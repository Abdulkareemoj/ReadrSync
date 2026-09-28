import type {
	IAuthAgent,
	IBookmarkAgent,
	IHighlightAgent,
	IRssAgent,
	ISyncAgent,
	SyncData,
	SyncResult,
} from "@packages/agents";
import { downloadSyncData, uploadSyncData } from "./google-drive";

/**
 * Platform file I/O used for the local sync file (export/import and the
 * signed-out sync fallback). Desktop provides a Tauri fs implementation;
 * web/mobile omit it and those features report a platform error instead.
 */
export interface SyncFileStore {
	readTextFile(path: string): Promise<string>;
	writeTextFile(path: string, data: string): Promise<void>;
	resolvePath(): Promise<string>;
	/** The last resolved path, or null before the first resolve. */
	cachedPath(): string | null;
}

export interface GoogleDriveSyncDeps {
	authAgent: IAuthAgent;
	bookmarkAgent: IBookmarkAgent;
	rssAgent: IRssAgent;
	highlightAgent: IHighlightAgent;
	fileStore?: SyncFileStore;
}

function emptyResult(syncedAt: string, errors: string[]): SyncResult {
	return {
		success: false,
		syncedAt,
		bookmarksPushed: 0,
		bookmarksPulled: 0,
		feedsPushed: 0,
		feedsPulled: 0,
		articlesPushed: 0,
		articlesPulled: 0,
		errors,
	};
}

/**
 * Shared Google Drive sync agent: gathers local data, uploads it, downloads
 * the remote copy, and merges remote rows into the local database with
 * last-write-wins semantics (by lastUpdatedAt).
 */
export function createGoogleDriveSyncAgent(
	deps: GoogleDriveSyncDeps,
): ISyncAgent {
	const { authAgent, bookmarkAgent, rssAgent, highlightAgent } = deps;
	const fileStore = deps.fileStore;

	let pollingTimer: ReturnType<typeof setInterval> | null = null;
	let isSyncing = false;

	async function gatherData(): Promise<SyncData> {
		const [bookmarks, feeds, articles, dbHighlights] = await Promise.all([
			bookmarkAgent.listBookmarks(),
			rssAgent.listFeeds(),
			rssAgent.listArticles(),
			highlightAgent.listHighlights(),
		]);
		const highlightsWithAnnotations = await Promise.all(
			dbHighlights.map(async (h) => {
				const anns = await highlightAgent.listAnnotations(h.id);
				return { ...h, annotations: anns };
			}),
		);
		return {
			version: 1,
			exportedAt: new Date().toISOString(),
			bookmarks,
			feeds,
			articles,
			highlights: highlightsWithAnnotations,
		};
	}

	/** Applies remote rows into the local database; the newest edit wins. */
	async function applyRemoteData(
		remoteData: SyncData,
		localData: SyncData,
		errors: string[],
	): Promise<void> {
		for (const rb of remoteData.bookmarks) {
			const lb = localData.bookmarks.find((b) => b.id === rb.id);
			if (!lb || rb.lastUpdatedAt > lb.lastUpdatedAt) {
				try {
					if (lb) await bookmarkAgent.updateBookmark(rb.id, rb as any);
					else
						await bookmarkAgent.addBookmark({
							title: rb.title,
							url: rb.url,
							description: rb.description,
							favicon: rb.favicon,
							image: rb.image,
							tags: rb.tags,
							favorite: rb.favorite,
							collectionId: rb.collectionId,
						});
				} catch {
					errors.push(`merge bookmark: ${rb.title}`);
				}
			}
		}
		for (const rf of remoteData.feeds) {
			if (!localData.feeds.find((f) => f.id === rf.id)) {
				try {
					await rssAgent.addFeed({
						title: rf.title,
						feedUrl: rf.feedUrl,
						siteUrl: rf.siteUrl,
					});
				} catch {
					errors.push(`merge feed: ${rf.title}`);
				}
			}
		}
		for (const ra of remoteData.articles) {
			if (!localData.articles.find((a) => a.link === ra.link)) {
				try {
					await rssAgent.insertArticles([
						{
							feedId: ra.feedId,
							title: ra.title,
							link: ra.link,
							content: ra.content ?? undefined,
							contentSnippet: ra.contentSnippet ?? undefined,
							imageUrl: ra.imageUrl ?? undefined,
							pubDate: ra.pubDate ?? "",
							read: ra.read,
							liked: ra.liked,
							saved: ra.saved,
							lastUpdatedAt: ra.lastUpdatedAt,
						},
					]);
				} catch {
					errors.push(`merge article: ${ra.title}`);
				}
			}
		}
		// Highlights are immutable once created, so add-missing by id gives
		// them the same convergence guarantee as the other entities.
		for (const rh of remoteData.highlights) {
			if (localData.highlights.find((h) => h.id === rh.id)) continue;
			try {
				await highlightAgent.addHighlight({
					articleId: rh.articleId,
					text: rh.text,
					color: rh.color,
					id: rh.id,
				});
				for (const ann of rh.annotations)
					await highlightAgent.addAnnotation({
						highlightId: rh.id,
						text: ann.text,
						id: ann.id,
					});
			} catch {
				errors.push(`merge highlight: ${rh.text.slice(0, 20)}`);
			}
		}
	}

	/** Import path: force-add every row (agents dedupe by id/url/link). */
	async function applyData(data: SyncData): Promise<string[]> {
		const errors: string[] = [];
		for (const bm of data.bookmarks) {
			try {
				await bookmarkAgent.addBookmark({
					title: bm.title,
					url: bm.url,
					description: bm.description,
					favicon: bm.favicon,
					image: bm.image,
					tags: bm.tags,
					favorite: bm.favorite,
					collectionId: bm.collectionId,
				});
			} catch {
				errors.push(`bookmark: ${bm.title}`);
			}
		}
		for (const f of data.feeds) {
			try {
				await rssAgent.addFeed({
					title: f.title,
					feedUrl: f.feedUrl,
					siteUrl: f.siteUrl,
				});
			} catch {
				errors.push(`feed: ${f.title}`);
			}
		}
		for (const a of data.articles) {
			try {
				await rssAgent.insertArticles([
					{
						feedId: a.feedId,
						title: a.title,
						link: a.link,
						content: a.content ?? undefined,
						contentSnippet: a.contentSnippet ?? undefined,
						imageUrl: a.imageUrl ?? undefined,
						pubDate: a.pubDate ?? "",
						read: a.read,
						liked: a.liked,
						saved: a.saved,
						lastUpdatedAt: a.lastUpdatedAt,
					},
				]);
			} catch {
				errors.push(`article: ${a.title}`);
			}
		}
		for (const h of data.highlights) {
			try {
				await highlightAgent.addHighlight({
					articleId: h.articleId,
					text: h.text,
					color: h.color,
					id: h.id,
				});
				for (const ann of h.annotations)
					await highlightAgent.addAnnotation({
						highlightId: h.id,
						text: ann.text,
						id: ann.id,
					});
			} catch {
				errors.push(`highlight: ${h.text.slice(0, 20)}`);
			}
		}
		return errors;
	}

	const agent: ISyncAgent = {
		startAutoSync: (intervalMs) => {
			if (pollingTimer !== null) clearInterval(pollingTimer);
			pollingTimer = setInterval(async () => {
				if (isSyncing) return;
				isSyncing = true;
				try {
					await agent.sync();
				} catch {
					/* silent */
				} finally {
					isSyncing = false;
				}
			}, intervalMs);
		},

		stopAutoSync: () => {
			if (pollingTimer !== null) {
				clearInterval(pollingTimer);
				pollingTimer = null;
			}
		},

		sync: async (): Promise<SyncResult> => {
			const startedAt = new Date().toISOString();
			const errors: string[] = [];

			const useDrive = await authAgent.isSignedIn();

			if (!useDrive) {
				// Signed out: desktop falls back to the local sync file; other
				// platforms report an error.
				if (!fileStore) {
					return emptyResult(startedAt, [
						"Not signed in, connect Google Drive in Settings first",
					]);
				}
				try {
					const localData = await gatherData();
					const path = await fileStore.resolvePath();
					let remoteData: SyncData | null = null;
					try {
						remoteData = JSON.parse(
							await fileStore.readTextFile(path),
						) as SyncData;
					} catch {
						/* first sync */
					}
					await fileStore.writeTextFile(
						path,
						JSON.stringify(localData, null, 2),
					);
					if (remoteData) await applyRemoteData(remoteData, localData, errors);
					return {
						success: errors.length === 0,
						syncedAt: startedAt,
						bookmarksPushed: localData.bookmarks.length,
						bookmarksPulled: remoteData ? remoteData.bookmarks.length : 0,
						feedsPushed: localData.feeds.length,
						feedsPulled: remoteData ? remoteData.feeds.length : 0,
						articlesPushed: localData.articles.length,
						articlesPulled: remoteData ? remoteData.articles.length : 0,
						errors,
					};
				} catch (err) {
					return emptyResult(startedAt, [String(err)]);
				}
			}

			try {
				const token = await authAgent.getAccessToken();
				if (!token) return emptyResult(startedAt, ["No access token"]);

				const localData = await gatherData();
				const remoteData = await downloadSyncData(token);

				const pushed = await uploadSyncData(token, localData);
				if (!pushed) errors.push("Failed to upload to Google Drive");

				if (remoteData) await applyRemoteData(remoteData, localData, errors);

				return {
					success: errors.length === 0,
					syncedAt: startedAt,
					bookmarksPushed: localData.bookmarks.length,
					bookmarksPulled: remoteData ? remoteData.bookmarks.length : 0,
					feedsPushed: localData.feeds.length,
					feedsPulled: remoteData ? remoteData.feeds.length : 0,
					articlesPushed: localData.articles.length,
					articlesPulled: remoteData ? remoteData.articles.length : 0,
					errors,
				};
			} catch (err) {
				return emptyResult(startedAt, [String(err)]);
			}
		},

		exportToFile: async () => {
			if (!fileStore)
				throw new Error("File export is not supported on this platform");
			const data = await gatherData();
			const path = await fileStore.resolvePath();
			await fileStore.writeTextFile(path, JSON.stringify(data, null, 2));
			return path;
		},

		importFromFile: async (data, mode) => {
			if (!fileStore)
				throw new Error("File import is not supported on this platform");
			if (mode === "replace") {
				for (const bm of await bookmarkAgent.listBookmarks())
					await bookmarkAgent.deleteBookmark(bm.id);
				for (const f of await rssAgent.listFeeds())
					await rssAgent.removeFeed(f.id);
			}
			const errors = await applyData(data);
			if (errors.length) throw new Error(`Import errors: ${errors.join(", ")}`);
		},

		getSyncFilePath: () => fileStore?.cachedPath() ?? null,
	};

	return agent;
}
