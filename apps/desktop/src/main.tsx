import "../../web/src/styles.css";

import { initializeReaderStore, useSettingsStore } from "@packages/store";
import { RouterProvider } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import React from "react";
import ReactDOM from "react-dom/client";
import { getRouter } from "../../web/src/router";
import { initializeTauriAgents } from "./db";

async function bootstrap() {
	const agents = await initializeTauriAgents();

	(window as any).__BOOKMARKREADER_AGENTS__ = agents;

	const store = initializeReaderStore(agents);
	await store.getState().loadInitialData();

	// Background sync every 30s. Routed through the store so lastSyncedAt and
	// sync status reflect in the UI (identical path to the manual "Sync now").
	const AUTO_SYNC_INTERVAL_MS = 30_000;
	setInterval(() => {
		const settings = useSettingsStore.getState();
		if (settings.syncStatus === "syncing") return;
		settings.setSyncStatus("syncing");
		store
			.getState()
			.triggerSync()
			.then((result) => {
				const next = useSettingsStore.getState();
				next.setSyncStatus(result.success ? "connected" : "error");
				if (result.syncedAt) next.setLastSyncedAt(result.syncedAt);
			})
			.catch(() => {
				useSettingsStore.getState().setSyncStatus("error");
			});
	}, AUTO_SYNC_INTERVAL_MS);

	// Set up platform YouTube handle resolver (desktop uses native Rust command)
	(window as any).__RESOLVE_YOUTUBE_HANDLE__ = async (input: string) => {
		try {
			// Extract just the handle name from various input formats
			let handle = input.trim();
			if (handle.includes("youtube.com") || handle.includes("youtu.be")) {
				try {
					const pathname = new URL(handle).pathname;
					const parts = pathname.split("/").filter(Boolean);
					handle = parts.find((p) => p.startsWith("@"))?.slice(1) ?? "";
				} catch {
					// fall through
				}
			}
			handle = handle.replace(/^@/, "");
			if (!handle) return null;

			const channelId = await invoke<string>("resolve_youtube_handle", {
				handle,
			});
			if (channelId) {
				return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
			}
		} catch (e) {
			console.error("[youtube-resolver] Tauri command failed:", e);
		}
		return null;
	};

	const router = getRouter();

	ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
		<React.StrictMode>
			<RouterProvider router={router} />
		</React.StrictMode>,
	);
}

bootstrap();
