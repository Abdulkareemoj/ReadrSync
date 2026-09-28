/**
 * Verifies runMigrations() converges every database shape to the current
 * schema:
 *   1. a fresh database (full DDL, ALTER blocks must fail harmlessly)
 *   2. a v1-era database (no liked/saved/collection/image columns, no
 *      collections table, no FTS, no indexes, no schema_version table yet)
 *   3. running migrations twice on the same database (idempotency)
 *
 * Run from packages/db:  npx tsx scripts/verify-migrations.ts
 */
import Database from "better-sqlite3";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { runMigrations } from "../src/migrate";
import { SCHEMA_VERSION } from "../src/schema-to-sql";

type Raw = InstanceType<typeof Database>;

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
	if (!ok) {
		failures++;
		console.error(`FAIL: ${label} ${detail}`);
	} else {
		console.log(`ok:   ${label}`);
	}
}

function columns(raw: Raw, table: string): Set<string> {
	const rows = raw.prepare(`PRAGMA table_info(${table})`).all() as {
		name: string;
	}[];
	return new Set(rows.map((r) => r.name));
}

function objects(raw: Raw, type: string, name: string): boolean {
	const row = raw
		.prepare("SELECT name FROM sqlite_master WHERE type = ? AND name = ?")
		.get(type, name);
	return row !== undefined;
}

async function migrate(raw: Raw) {
	const db = drizzle(raw);
	await runMigrations(db as unknown as Parameters<typeof runMigrations>[0]);
}

async function currentVersion(raw: Raw): Promise<number> {
	const db = drizzle(raw);
	const row = (await db.get(
		sql`SELECT MAX(version) as version FROM schema_version`,
	)) as { version: number | null } | undefined;
	return row?.version ?? 0;
}

async function main() {
	// --- 1. Fresh database -------------------------------------------------
	const fresh = new Database(":memory:");
	await migrate(fresh);
	check(
		"fresh db stamped at SCHEMA_VERSION",
		(await currentVersion(fresh)) === SCHEMA_VERSION,
	);

	// --- 2. v1-era database ------------------------------------------------
	const legacy = new Database(":memory:");
	legacy.exec(`
		CREATE TABLE bookmarks (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			url TEXT NOT NULL,
			description TEXT,
			favicon TEXT,
			date_added TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
			favorite INTEGER DEFAULT 0 NOT NULL,
			last_updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
		);
		CREATE TABLE feeds (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			feed_url TEXT UNIQUE NOT NULL,
			site_url TEXT,
			last_fetched TEXT,
			unread_count INTEGER DEFAULT 0 NOT NULL,
			last_updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
		);
		CREATE TABLE articles (
			id TEXT PRIMARY KEY,
			feed_id TEXT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
			title TEXT NOT NULL,
			link TEXT UNIQUE NOT NULL,
			content_snippet TEXT,
			content TEXT,
			pub_date TEXT,
			read INTEGER DEFAULT 0 NOT NULL,
			last_updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
		);
		INSERT INTO bookmarks (id, title, url) VALUES ('b1', 'Example', 'https://example.com');
		INSERT INTO feeds (id, title, feed_url) VALUES ('f1', 'Example Feed', 'https://example.com/rss');
		INSERT INTO articles (id, feed_id, title, link) VALUES ('a1', 'f1', 'Hello', 'https://example.com/post');
	`);
	await migrate(legacy);

	const bm = columns(legacy, "bookmarks");
	const art = columns(legacy, "articles");
	check(
		"legacy bookmarks gained liked/saved/collection_id/image",
		["liked", "saved", "collection_id", "image"].every((c) => bm.has(c)),
	);
	check(
		"legacy articles gained liked/saved/read_at/image/image_url/image_data/full_content",
		[
			"liked",
			"saved",
			"read_at",
			"image",
			"image_url",
			"image_data",
			"full_content",
		].every((c) => art.has(c)),
	);
	check(
		"legacy collections table created",
		objects(legacy, "table", "collections"),
	);
	check(
		"legacy FTS tables created",
		objects(legacy, "table", "bookmarks_fts") &&
			objects(legacy, "table", "articles_fts"),
	);
	check(
		"legacy FTS triggers created",
		objects(legacy, "trigger", "bookmarks_ai") &&
			objects(legacy, "trigger", "articles_au"),
	);
	check(
		"legacy indexes created",
		objects(legacy, "index", "idx_bookmarks_collection_id") &&
			objects(legacy, "index", "idx_articles_pub_date"),
	);
	check(
		"legacy data survived migration",
		(
			legacy.prepare("SELECT COUNT(*) as c FROM bookmarks").get() as {
				c: number;
			}
		).c === 1,
	);
	check(
		"legacy db stamped at SCHEMA_VERSION",
		(await currentVersion(legacy)) === SCHEMA_VERSION,
	);

	// --- 3. Idempotency ----------------------------------------------------
	await migrate(legacy);
	check(
		"second run keeps version at SCHEMA_VERSION",
		(await currentVersion(legacy)) === SCHEMA_VERSION,
	);
	check(
		"second run keeps data intact",
		(
			legacy.prepare("SELECT COUNT(*) as c FROM articles").get() as {
				c: number;
			}
		).c === 1,
	);

	legacy.close();
	fresh.close();

	if (failures > 0) {
		console.error(`\n${failures} check(s) failed`);
		process.exit(1);
	}
	console.log("\nAll migration checks passed");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
