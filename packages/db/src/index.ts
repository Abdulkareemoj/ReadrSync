import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { SQLJsDatabase } from "drizzle-orm/sql-js";
import type * as schema from "./schema";

export type DB = LibSQLDatabase<typeof schema> | SQLJsDatabase<typeof schema>;

export { runMigrations } from "./migrate";

// These all actually live in schema-to-sql.ts, not migrate.ts, the original
// export block pointed at the wrong file, which would have failed to build.
export {
	getCreateTableStatements,
	getFtsStatements,
	getFtsTriggerStatements,
	getIndexStatements,
	getSchemaVersion,
	needsMigration,
	runFtsSetup,
	SCHEMA_VERSION,
} from "./schema-to-sql";
