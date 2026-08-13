// Reads the root seed-data.json and emits src/seed-data-json.ts with the data
// typed against the drizzle schema. We generate a TS module (instead of
// importing the JSON at runtime) so the data bundles cleanly on web (Vite),
// desktop (Vite), and mobile (Metro) without cross-boundary JSON resolution.
//
// Usage: pnpm --filter @packages/db generate:seed

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");
const jsonPath = resolve(root, "seed-data.json");
const outPath = resolve(here, "../src/seed-data-json.ts");

const raw = JSON.parse(readFileSync(jsonPath, "utf8")) as {
	feeds?: unknown[];
	bookmarks?: unknown[];
};

const feeds = raw.feeds ?? [];
const bookmarks = raw.bookmarks ?? [];

function fmtValue(value: unknown): string {
	if (Array.isArray(value)) {
		return `[${value.map((v) => fmtValue(v)).join(", ")}]`;
	}
	return JSON.stringify(value) ?? "null";
}

// Renders one row as a Biome-conformant, multi-line object literal ending in a
// trailing comma, e.g. `\t{\n\t\tid: "feed_1",\n\t\t...\n\t},`.
function fmtRow(row: Record<string, unknown>): string {
	const props = Object.entries(row)
		.map(([key, value]) => `\t\t${key}: ${fmtValue(value)},`)
		.join("\n");
	return `\t{\n${props}\n\t},`;
}

const fmtRows = (rows: unknown[]) =>
	rows.length > 0
		? `\n${rows.map((r) => fmtRow(r as Record<string, unknown>)).join("\n")}\n`
		: "";

const content = `// AUTO-GENERATED from seed-data.json by scripts/generate-seed.ts, do not edit by hand.
// Regenerate with: pnpm --filter @packages/db generate:seed
import type { NewBookmark, NewFeed } from "./schema";

export const jsonFeeds: NewFeed[] = [${fmtRows(feeds)}];

export const jsonBookmarks: NewBookmark[] = [${fmtRows(bookmarks)}];
`;

writeFileSync(outPath, content);
console.log(
	`Wrote ${outPath} (${feeds.length} feeds, ${bookmarks.length} bookmarks)`,
);
