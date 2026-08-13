import { getTableConfig } from "drizzle-orm/sqlite-core";
import {
	articles,
	bookmarks,
	feeds,
	schemaVersion,
	highlights,
	annotations,
} from "../src/schema";

const tables = [
	schemaVersion,
	bookmarks,
	feeds,
	articles,
	highlights,
	annotations,
];

function generateCreateStatement(table: any): string {
	const config = getTableConfig(table);
	const columns = config.columns.map((col: any) => {
		const parts = [col.name, col.getSQLType()];
		if (col.primary) parts.push("PRIMARY KEY");
		if (col.notNull) parts.push("NOT NULL");
		if (col.default !== undefined) {
			const def = col.defaultFn ? col.defaultFn() : col.default;
			parts.push(`DEFAULT ${typeof def === "string" ? `'${def}'` : def}`);
		}
		return parts.join(" ");
	});

	const fks = config.foreignKeys.map((fk: any) => {
		const ref = fk.reference();
		const localCols = ref.columns.map((c: any) => c.name);
		const refTable = getTableConfig(ref.foreignTable).name;
		const foreignCols = ref.foreignColumns.map((c: any) => c.name);
		return `FOREIGN KEY (${localCols.join(", ")}) REFERENCES ${refTable}(${foreignCols.join(", ")}) ON DELETE CASCADE`;
	});

	return `CREATE TABLE IF NOT EXISTS ${config.name} (\n  ${[...columns, ...fks].join(",\n  ")}\n)`;
}

const statements = tables.map(generateCreateStatement);
console.log(JSON.stringify(statements, null, 2));
