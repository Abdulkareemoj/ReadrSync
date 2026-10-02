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

// Add new migrations to the MIGRATIONS array in ./schema-to-sql.ts — one
// idempotent block per schema change, with the next version number.

// Cross-connection contention (another handle mid-write on the same database
// file) surfaces as SQLITE_BUSY/LOCKED. busy_timeout handles most contention;
// this retry is the backstop for longer locks — leaked handles from JS
// reloads can hold a lock until their process dies.
const BUSY_PATTERN = /locked|busy/i;

async function runMigrationStatement(db: unknown, stmt: string): Promise<void> {
	for (let attempt = 0; ; attempt++) {
		try {
			await (db as { run: (q: unknown) => unknown }).run(sql.raw(stmt));
			return;
		} catch (error) {
			const message = String(
				(error as { cause?: { message?: string } })?.cause?.message ??
					(error as { message?: string })?.message ??
					error,
			);
			if (attempt >= 9 || !BUSY_PATTERN.test(message)) throw error;
			await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
		}
	}
}

export async function runMigrations(db: any): Promise<void> {
	console.log("Running migrations...");

	// Create tables for fresh installs
	for (const stmt of getCreateTableStatements()) {
		await runMigrationStatement(db, stmt);
	}

	// Get current DB version
	const currentVersion = await getSchemaVersion(db);

	// Run any migrations newer than current version
	for (const migration of MIGRATIONS) {
		if (migration.version <= currentVersion) continue;

		for (const stmt of migration.statements) {
			try {
				await runMigrationStatement(db, stmt);
			} catch {
				// Column already exists, safe to ignore on ALTER TABLE
			}
		}

		// Record that this version was applied
		await runMigrationStatement(
			db,
			`INSERT OR REPLACE INTO schema_version (version) VALUES (${migration.version})`,
		);
		console.log(`[DB] Migrated to schema version ${migration.version}`);
	}

	// Mark the schema as fully current so needsMigration() reports correctly.
	await runMigrationStatement(
		db,
		`INSERT OR REPLACE INTO schema_version (version) VALUES (${SCHEMA_VERSION})`,
	);
	console.log("Migrations completed successfully");
}
