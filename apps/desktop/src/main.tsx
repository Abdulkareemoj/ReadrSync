import "../../web/src/styles.css";

import { initializeReaderStore, useSettingsStore } from "@packages/store";
import { resolveYouTubeHandle } from "@packages/utils";
import { RouterProvider } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import React from "react";
import ReactDOM from "react-dom/client";
import { wireWebFetchArticleContent } from "../../web/src/lib/article-content";
import { getRouter } from "../../web/src/router";
import { initializeTauriAgents } from "./db";

async function bootstrap() {
	const agents = await initializeTauriAgents();

	(window as any).__BOOKMARKREADER_AGENTS__ = agents;

	const store = initializeReaderStore(agents);
	wireWebFetchArticleContent(store);
	await store.getState().loadInitialData();

	// Background sync every 30s. Routed through the reader store
	// identical path to the manual "Sync now" (status + lastSyncedAt reflect in the UI).
	store.getState().startAutoSync(30_000);

	// Set up platform YouTube handle resolver (desktop uses native Rust command)
	(window as any).__RESOLVE_YOUTUBE_HANDLE__ = async (input: string) => {
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

		//  Native Rust resolver (channel-page scrape, no CORS)
		try {
			const channelId = await invoke<string>("resolve_youtube_handle", {
				handle,
			});
			if (channelId) {
				return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
			}
		} catch (e) {
			console.error("[youtube-resolver] Tauri command failed:", e);
		}

		// Shared JS resolver, official YouTube Data API v3 when a key is
		// configured, keyless InnerTube/scraping otherwise
		const jsId = await resolveYouTubeHandle(
			handle,
			useSettingsStore.getState().youtubeApiKey,
		);
		if (jsId) {
			return `https://www.youtube.com/feeds/videos.xml?channel_id=${jsId}`;
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
