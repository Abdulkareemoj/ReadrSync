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
	MIGRATIONS,
	SCHEMA_VERSION,
} from "./schema-to-sql";

// Add new migrations to the MIGRATIONS array in ./schema-to-sql.ts one
// idempotent block per schema change, with the next version number.

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
