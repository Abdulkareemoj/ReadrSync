import type React from "react";
import { useEffect, useState } from "react";
import type { StoreApi } from "zustand";
import { initializeWebAgents } from "@/lib/db";
import { initializeReaderStore, type ReaderState } from "@/lib/store";

interface StoreProviderProps {
	children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
	const [isInitialized, setIsInitialized] = useState(false);
	const [initError, setInitError] = useState<unknown>(null);

	type InitializedStore = StoreApi<ReaderState>;

	useEffect(() => {
		async function setup() {
			try {
				const injectedAgents =
					typeof window !== "undefined"
						? (globalThis as unknown as { __BOOKMARKREADER_AGENTS__?: unknown })
								.__BOOKMARKREADER_AGENTS__
						: undefined;

				if (injectedAgents) {
					setIsInitialized(true);
					return;
				}

				const agents = await initializeWebAgents();
				const store = initializeReaderStore(
					agents,
				) as unknown as InitializedStore;

				// refreshFeed now baked into store, no override needed

				await store.getState().loadInitialData();

				// Sync collections from DB to persist store for backward compat
				try {
					const { useCollectionsStore } = await import("@packages/store");
					const tree = store.getState().collections;
					if (tree.length > 0) {
						const flat: { id: string; name: string; parentId: string | null; position: number }[] = [];
						const walk = (nodes: any[]) => {
							for (const n of nodes) {
								flat.push({ id: n.id, name: n.name, parentId: n.parentId ?? null, position: n.position ?? 0 });
								walk(n.children ?? []);
							}
						};
						walk(tree);
						useCollectionsStore.getState().setBookmarkCollections([
							{ id: "all", name: "All Bookmarks", parentId: null, position: 0 },
							{ id: "inbox", name: "Inbox", parentId: null, position: 1 },
							...flat.filter((c) => c.id !== "all" && c.id !== "inbox"),
						]);
					}
				} catch (e) {
					console.warn("[StoreProvider] Sync collections failed:", e);
				}

				setIsInitialized(true);
			} catch (e) {
				console.error("Failed to initialize application:", e);
				setInitError(e);
			}
		}
		setup();
	}, []);

	if (initError) {
		return (
			<div className="flex h-screen flex-col items-center justify-center gap-2 px-6 text-center text-gray-500">
				<div className="font-medium text-foreground">
					Failed to initialize application
				</div>
				<div className="text-sm">
					Refresh the page. If this keeps happening, clear site data for this
					origin (IndexedDB) and try again.
				</div>
			</div>
		);
	}

	if (!isInitialized) {
		// Render loading state for web app
		return (
			<div className="flex h-screen items-center justify-center text-gray-500">
				Loading data...
			</div>
		);
	}

	return <>{children}</>;
}
