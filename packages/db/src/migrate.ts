/**
 * This file is responsible for running database migrations and also keeps track
 * to make sure the apps are running the correct schema version. It also provides
 * the SQL statements needed to create the tables, which is used by the
 * web/desktop/mobile implementations that don't have filesystem access to run
 * separate migration scripts.
 *
 * NOTE: this intentionally does NOT use drizzle-orm's `migrate()` from
 * "drizzle-orm/libsql/migrator", that reads migration SQL files from disk via
 * node:fs/node:path, which is unavailable in the browser (Vite) and React
 * Native. Instead we apply idempotent CREATE TABLE statements plus a
 * versioned ALTER TABLE list directly against whatever drizzle sqlite-ish
 * `db` instance each platform already constructs.
 */

import { sql } from "drizzle-orm";
import {
	getCreateTableStatements,
	getSchemaVersion,
	SCHEMA_VERSION,
} from "./schema-to-sql";

// Add new migrations here as you evolve the schema.
// Each entry runs only when the DB version is below its version number.
const MIGRATIONS: { version: number; statements: string[] }[] = [
	{
		version: 2,
		statements: [
			"ALTER TABLE articles ADD COLUMN liked INTEGER NOT NULL DEFAULT 0",
			"ALTER TABLE articles ADD COLUMN saved INTEGER NOT NULL DEFAULT 0",
			"ALTER TABLE bookmarks ADD COLUMN liked INTEGER NOT NULL DEFAULT 0",
			"ALTER TABLE bookmarks ADD COLUMN saved INTEGER NOT NULL DEFAULT 1",
			"ALTER TABLE bookmarks ADD COLUMN collection_id TEXT NOT NULL DEFAULT 'inbox'",
		],
	},
	{ version: 3, statements: ["ALTER TABLE articles ADD COLUMN read_at TEXT"] },
	{
		version: 4,
		statements: [
			"ALTER TABLE bookmarks ADD COLUMN image TEXT",
			"ALTER TABLE articles ADD COLUMN image TEXT",
		],
	},
	{
		version: 5,
		statements: ["ALTER TABLE articles ADD COLUMN image_url TEXT"],
	},
	{
		version: 6,
		statements: ["ALTER TABLE articles ADD COLUMN image_data TEXT"],
	},
	{
		version: 7,
		statements: ["ALTER TABLE articles ADD COLUMN full_content TEXT"],
	},
];

export async function runMigrations(db: any): Promise<void> {
	console.log("Running migrations...");

	// Create tables for fresh installs
	for (const stmt of getCreateTableStatements()) {
		await db.run(sql.raw(stmt));
	}

	// Get current DB version
	const currentVersion = await getSchemaVersion(db);

	// Run any migrations newer than current version
	for (const migration of MIGRATIONS) {
		if (migration.version <= currentVersion) continue;

		for (const stmt of migration.statements) {
			try {
				await db.run(sql.raw(stmt));
			} catch {
				// Column already exists, safe to ignore on ALTER TABLE
			}
		}

		// Record that this version was applied
		await db.run(
			sql.raw(
				`INSERT OR REPLACE INTO schema_version (version) VALUES (${migration.version})`,
			),
		);
		console.log(`[DB] Migrated to schema version ${migration.version}`);
	}

	// Mark the schema as fully current so needsMigration() reports correctly.
	await db.run(
		sql.raw(
			`INSERT OR REPLACE INTO schema_version (version) VALUES (${SCHEMA_VERSION})`,
		),
	);
	console.log("Migrations completed successfully");
}
