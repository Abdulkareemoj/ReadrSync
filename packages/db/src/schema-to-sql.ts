/**
 * Utility to generate CREATE TABLE SQL from Drizzle schema
 * This allows us to initialize the web/mobile database without filesystem access
 * The schema source is in packages/db/src/schema.ts
 */

import { sql } from "drizzle-orm";

//need to find a way to keep track of this

export const SCHEMA_VERSION = 10; // bump this whenever you add a migration block

/**
 * Gets the CREATE TABLE statements needed to initialize the database
 * Must match packages/db/src/schema.ts exactly
 */
export function getCreateTableStatements(): string[] {
	return [
		// Schema version tracking table
		`CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,

		// Bookmarks table - matches packages/db/src/schema.ts
		`CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      favicon TEXT,
      image TEXT,
      tags TEXT DEFAULT '[]' NOT NULL,
      date_added TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      favorite INTEGER DEFAULT 0 NOT NULL,
      collection_id TEXT DEFAULT 'inbox' NOT NULL,
      liked INTEGER DEFAULT 0 NOT NULL,
      saved INTEGER DEFAULT 1 NOT NULL,
      last_updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,

		// Feeds table - matches packages/db/src/schema.ts
		`CREATE TABLE IF NOT EXISTS feeds (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      feed_url TEXT UNIQUE NOT NULL,
      site_url TEXT,
      last_fetched TEXT,
      unread_count INTEGER DEFAULT 0 NOT NULL,
      last_updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,

		// Articles table - matches packages/db/src/schema.ts
		`CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      feed_id TEXT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      link TEXT UNIQUE NOT NULL,
      content_snippet TEXT,
      content TEXT,
      full_content TEXT,
      image_url TEXT,
      image_data TEXT,
      pub_date TEXT,
      read INTEGER DEFAULT 0 NOT NULL,
      liked INTEGER DEFAULT 0 NOT NULL,
      saved INTEGER DEFAULT 0 NOT NULL,
      last_updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      read_at TEXT
    )`,

		// Highlights table - matches packages/db/src/schema.ts
		`CREATE TABLE IF NOT EXISTS highlights (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,

		// Annotations table - matches packages/db/src/schema.ts
		`CREATE TABLE IF NOT EXISTS annotations (
      id TEXT PRIMARY KEY,
      highlight_id TEXT NOT NULL REFERENCES highlights(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,

		// Collections table - matches packages/db/src/schema.ts
		`CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
      position INTEGER DEFAULT 0 NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
	];
}
/**
 * Gets FTS virtual table creation SQL (FTS5 by default, FTS4 fallback for
 * sql.js builds that only ship FTS3/4). Run AFTER the main tables exist to
 * add full-text search capabilities.
 */
export function getFtsStatements(fts: "fts5" | "fts4" = "fts5"): string[] {
	const tokenize = fts === "fts5" ? "porter unicode61" : "porter";
	const contentRowid = fts === "fts5" ? ",\n      content_rowid='rowid'" : "";
	return [
		// Bookmarks FTS, indexes title, url, description, tags
		`CREATE VIRTUAL TABLE IF NOT EXISTS bookmarks_fts USING ${fts}(
      title,
      url,
      description,
      tags,
      content='bookmarks'${contentRowid},
      tokenize='${tokenize}'
    )`,
		// Articles FTS, indexes title, link, content_snippet, content, full_content
		`CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING ${fts}(
      title,
      link,
      content_snippet,
      content,
      full_content,
      content='articles'${contentRowid},
      tokenize='${tokenize}'
    )`,
	];
}

/**
 * Gets trigger statements to keep FTS tables in sync with main tables
 */
export function getFtsTriggerStatements(): string[] {
	return [
		// Bookmarks insert trigger
		`CREATE TRIGGER IF NOT EXISTS bookmarks_ai AFTER INSERT ON bookmarks BEGIN
      INSERT INTO bookmarks_fts(rowid, title, url, description, tags)
      VALUES (new.rowid, new.title, new.url, new.description, new.tags);
    END`,
		// Bookmarks delete trigger
		`CREATE TRIGGER IF NOT EXISTS bookmarks_ad AFTER DELETE ON bookmarks BEGIN
      INSERT INTO bookmarks_fts(bookmarks_fts, rowid, title, url, description, tags)
      VALUES ('delete', old.rowid, old.title, old.url, old.description, old.tags);
    END`,
		// Bookmarks update trigger
		`CREATE TRIGGER IF NOT EXISTS bookmarks_au AFTER UPDATE ON bookmarks BEGIN
      INSERT INTO bookmarks_fts(bookmarks_fts, rowid, title, url, description, tags)
      VALUES ('delete', old.rowid, old.title, old.url, old.description, old.tags);
      INSERT INTO bookmarks_fts(rowid, title, url, description, tags)
      VALUES (new.rowid, new.title, new.url, new.description, new.tags);
    END`,
		// Articles insert trigger
		`CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
      INSERT INTO articles_fts(rowid, title, link, content_snippet, content, full_content)
      VALUES (new.rowid, new.title, new.link, new.content_snippet, new.content, new.full_content);
    END`,
		// Articles delete trigger
		`CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
      INSERT INTO articles_fts(articles_fts, rowid, title, link, content_snippet, content, full_content)
      VALUES ('delete', old.rowid, old.title, old.link, old.content_snippet, old.content, old.full_content);
    END`,
		// Articles update trigger
		`CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
      INSERT INTO articles_fts(articles_fts, rowid, title, link, content_snippet, content, full_content)
      VALUES ('delete', old.rowid, old.title, old.link, old.content_snippet, old.content, old.full_content);
      INSERT INTO articles_fts(rowid, title, link, content_snippet, content, full_content)
      VALUES (new.rowid, new.title, new.link, new.content_snippet, new.content, new.full_content);
    END`,
	];
}

/**
 * Gets index creation statements for frequently filtered columns
 */
export function getIndexStatements(): string[] {
	return [
		`CREATE INDEX IF NOT EXISTS idx_bookmarks_collection_id ON bookmarks(collection_id)`,
		`CREATE INDEX IF NOT EXISTS idx_bookmarks_favorite ON bookmarks(favorite)`,
		`CREATE INDEX IF NOT EXISTS idx_bookmarks_liked ON bookmarks(liked)`,
		`CREATE INDEX IF NOT EXISTS idx_bookmarks_saved ON bookmarks(saved)`,
		`CREATE INDEX IF NOT EXISTS idx_bookmarks_date_added ON bookmarks(date_added)`,
		`CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON articles(feed_id)`,
		`CREATE INDEX IF NOT EXISTS idx_articles_read ON articles("read")`,
		`CREATE INDEX IF NOT EXISTS idx_articles_liked ON articles(liked)`,
		`CREATE INDEX IF NOT EXISTS idx_articles_saved ON articles(saved)`,
		`CREATE INDEX IF NOT EXISTS idx_articles_pub_date ON articles(pub_date)`,
	];
}

// ---------------------------------------------------------------------------
// The three functions below were exported from index.ts (`getSchemaVersion`,
// `needsMigration`, `runFtsSetup`) but didn't exist anywhere in the package,
// added here as a starting point. They assume a drizzle sqlite-style db
// instance with .get()/.run(), which libsql, sql-js, and expo-sqlite all
// implement, but double check against however each platform actually
// constructs its db instance.
// ---------------------------------------------------------------------------

/** Reads the highest applied version out of the schema_version table. Returns 0 if the table doesn't exist yet (fresh db). */
export async function getSchemaVersion(db: any): Promise<number> {
	try {
		const row = await db.get(
			sql`SELECT MAX(version) as version FROM schema_version`,
		);
		return row?.version ?? 0;
	} catch {
		return 0;
	}
}

/** Whether the db's applied schema version is behind the current SCHEMA_VERSION constant. */
export async function needsMigration(db: any): Promise<boolean> {
	const current = await getSchemaVersion(db);
	return current < SCHEMA_VERSION;
}

/**
 * Creates the FTS virtual tables + sync triggers. Uses FTS5 where available
 * (native mobile SQLite) and falls back to FTS4 for sql.js builds that ship
 * without FTS5 (web/desktop). Run once, after getCreateTableStatements().
 */
export async function runFtsSetup(db: any): Promise<void> {
	try {
		for (const stmt of [
			...getFtsStatements("fts5"),
			...getFtsTriggerStatements(),
		]) {
			await db.run(sql.raw(stmt));
		}
	} catch {
		// FTS5 unavailable (e.g. sql.js), retry with FTS4
		try {
			for (const stmt of [
				...getFtsStatements("fts4"),
				...getFtsTriggerStatements(),
			]) {
				await db.run(sql.raw(stmt));
			}
		} catch (err) {
			// No FTS support at all, search code falls back to LIKE
			console.warn("[db] Full-text search unavailable:", err);
		}
	}
}
