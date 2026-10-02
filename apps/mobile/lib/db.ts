import {
	createBookmarkAgent,
	createCollectionAgent,
	createHighlightAgent,
	createRssAgent,
	type IAgents,
} from "@packages/agents";
import { runFtsSetup, runMigrations, SCHEMA_VERSION } from "@packages/db";
import type { DB } from "@packages/db/src/index";
import * as schema from "@packages/db/src/schema";
import { seedDatabase } from "@packages/db/src/seed-data";
import { createGoogleDriveSyncAgent } from "@packages/sync";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseAsync } from "expo-sqlite";
import { createMobileAuthAgent } from "./auth-agent";
import { GOOGLE_OAUTH_CONFIG } from "./auth-config";

const DB_NAME = "bookmark_tool.db";

let initializedAgents: IAgents | null = null;
// Single-flight: two concurrent calls would each openDatabaseAsync and race
// migrations on separate connections (SQLITE_BUSY on the writes).
let agentsPromise: Promise<IAgents> | null = null;

export function initializeMobileAgents(): Promise<IAgents> {
	if (initializedAgents) return Promise.resolve(initializedAgents);
	if (!agentsPromise) {
		agentsPromise = doInitializeMobileAgents().catch((error) => {
			agentsPromise = null; // allow a fresh attempt after a failure
			throw error;
		});
	}
	return agentsPromise;
}

async function doInitializeMobileAgents(): Promise<IAgents> {
	const expoDb = await openDatabaseAsync(DB_NAME);

	// Hardening against "database is locked": WAL lets readers and the writer
	// coexist, and busy_timeout makes SQLite wait on a contended lock instead
	// of failing instantly. A JS reload that lands mid-statement can leak a
	// connection holding a lock until the app process dies — WAL + timeout
	// keeps the next boot from inheriting that.
	await expoDb.execAsync("PRAGMA busy_timeout = 2000;");
	await expoDb.execAsync("PRAGMA journal_mode = WAL;");

	const db = drizzle(expoDb as any, { schema }) as unknown as DB;

	try {
		await runMigrations(db);
		await runFtsSetup(db);

		// Dev-only: populate a fresh database with sample content
		if (__DEV__) {
			await seedDatabase(db);
		}
	} catch (error) {
		// A failed boot must not leak the handle — a leaked connection can hold
		// a lock that survives JS reloads.
		try {
			await expoDb.closeAsync();
		} catch {
			// already closed
		}
		throw error;
	}

	console.log(`[Mobile DB] Schema v${SCHEMA_VERSION} ready`);

	const bookmarkAgent = createBookmarkAgent(db);
	const collectionAgent = createCollectionAgent(db);
	const rssAgent = createRssAgent(db);
	const highlightAgent = createHighlightAgent(db);
	const authAgent = createMobileAuthAgent(GOOGLE_OAUTH_CONFIG.clientId);
	const syncAgent = createGoogleDriveSyncAgent({
		authAgent,
		bookmarkAgent,
		rssAgent,
		highlightAgent,
	});

	initializedAgents = {
		bookmarkAgent,
		collectionAgent,
		rssAgent,
		highlightAgent,
		syncAgent,
		authAgent,
	};
	return initializedAgents;
}

export function getInitializedMobileAgents(): IAgents {
	if (!initializedAgents) {
		throw new Error("Call initializeMobileAgents() first.");
	}
	return initializedAgents;
}
