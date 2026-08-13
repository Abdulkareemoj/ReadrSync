import {
	extractArticleContent,
	fetchFeed,
	parseFeedTitle,
	parseFeedXml,
} from "@packages/utils/src/mobile";
import { initializeMobileAgents } from "./db";

let isInit = false;
let initError: Error | null = null;
let storeInstance: any = null;

export async function appInit() {
	if (isInit) return storeInstance;
	if (initError) throw initError;

	try {
		console.log("[appInit] Initializing agents...");
		const agents = await initializeMobileAgents();

		console.log("[appInit] Initializing store...");
		const { initializeReaderStore } = await import("@packages/store");
		storeInstance = initializeReaderStore(agents);

		// Wire up mobile-specific RSS operations into the store
		// The store's refreshFeed calls rssAgent methods, we extend it here
		storeInstance.setState({
			refreshFeed: async (feedId: string) => {
				const { feeds, rssAgent } = storeInstance.getState();
				const feed = feeds.find((f: any) => f.id === feedId);
				if (!feed) return;

				try {
					const rawText = await fetchFeed(feed.feedUrl);
					const parsed = parseFeedXml(rawText, feedId);
					const feedTitle = parseFeedTitle(rawText) || feed.title;

					// Insert new articles
					const inserted = await rssAgent.insertArticles(parsed);

					// Eagerly fetch OG images for new articles missing imageUrl
					// Limit to 5 concurrent to avoid hammering the network
					const needsImage = inserted
						.filter((a: any) => !a.imageUrl)
						.slice(0, 5);
					if (needsImage.length > 0) {
						await Promise.allSettled(
							needsImage.map(async (article: any) => {
								try {
									const res = await fetch(article.link, {
										headers: { "User-Agent": "ReadrSync/1.0" },
									});
									if (!res.ok) return;
									const html = await res.text();
									const ogImage =
										html.match(
											/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
										)?.[1] ||
										html.match(
											/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
										)?.[1];
									if (ogImage) {
										await rssAgent.updateArticleContent(
											article.id,
											article.content ?? "",
											ogImage,
										);
										console.log(
											"[refreshFeed] OG image fetched for:",
											article.title?.slice(0, 40),
										);
									}
								} catch {
									// Silently skip, image is optional
								}
							}),
						);
					}

					// Update feed metadata + unread count
					const allArticles = await rssAgent.listArticles(feedId);
					const unreadCount = allArticles.filter((a: any) => !a.read).length;
					await rssAgent.updateFeedMeta(feedId, {
						title: feedTitle,
						lastFetched: new Date().toISOString(),
						unreadCount,
					});

					// Refresh store state
					const [updatedFeeds, updatedArticles] = await Promise.all([
						rssAgent.listFeeds(),
						rssAgent.listArticles(),
					]);

					storeInstance.setState({
						feeds: updatedFeeds,
						articles: updatedArticles,
					});

					console.log(
						`[refreshFeed] ${feedId}: ${inserted.length} new, ${needsImage.length} OG images fetched`,
					);
				} catch (e) {
					console.error(`[refreshFeed] ${feedId} failed:`, e);
					throw e;
				}
			},

			// Wire mobile article content extraction
			fetchArticleContent: async (id: string) => {
				const { articles, rssAgent } = storeInstance.getState();
				const article = articles.find((a: any) => a.id === id);
				if (!article || article.fullContent || !article.link) return;

				const contentText = (article.content ?? "")
					.replace(/<[^>]*>/g, "")
					.trim();
				if (contentText.length > 500) return; // already has enough content

				const extracted = await extractArticleContent(article.link);
				if (!extracted?.content) return;

				const imageUrl = article.imageUrl ?? extracted.image ?? null;
				await rssAgent.updateArticleContent(id, extracted.content, imageUrl);

				storeInstance.setState((state: any) => ({
					articles: state.articles.map((a: any) =>
						a.id === id
							? { ...a, fullContent: extracted.content, imageUrl }
							: a,
					),
				}));
			},

			// Wire addFeed to also trigger a refresh
			addFeed: async (data: any) => {
				const { rssAgent } = storeInstance.getState();

				// Try to get real feed title before inserting
				let title = data.title;
				try {
					const rawText = await fetchFeed(data.feedUrl);
					title = parseFeedTitle(rawText) || title || data.feedUrl;
				} catch {
					title = title || data.feedUrl;
				}

				const newFeed = await rssAgent.addFeed({ ...data, title });

				storeInstance.setState((state: any) => ({
					feeds: [...state.feeds, { ...newFeed, unreadCount: 0 }],
				}));

				// Refresh to pull articles
				await storeInstance.getState().refreshFeed(newFeed.id);
			},
		});

		console.log("[appInit] Loading initial data...");
		await storeInstance.getState().loadInitialData();

		// Sync collections from DB to persist store for backward compat
		await syncCollectionsToPersistStore();

		isInit = true;
		console.log("[appInit] Ready");
		return storeInstance;
	} catch (error) {
		console.error("[appInit] Failed:", error);
		initError = error as Error;
		throw error;
	}
}

export function getInitStatus() {
	return { isInit, initError, store: storeInstance };
}

async function syncCollectionsToPersistStore() {
	try {
		const { useCollectionsStore: ucs } = await import("@packages/store");
		const tree = storeInstance?.getState()?.collections;
		if (!tree || tree.length === 0) return;
		const flat: {
			id: string;
			name: string;
			parentId: string | null;
			position: number;
		}[] = [];
		const walk = (nodes: any[]) => {
			for (const n of nodes) {
				flat.push({
					id: n.id,
					name: n.name,
					parentId: n.parentId ?? null,
					position: n.position ?? 0,
				});
				walk(n.children ?? []);
			}
		};
		walk(tree);
		ucs
			.getState()
			.setBookmarkCollections([
				{ id: "all", name: "All Bookmarks", parentId: null, position: 0 },
				{ id: "inbox", name: "Inbox", parentId: null, position: 1 },
				...flat.filter((c) => c.id !== "all" && c.id !== "inbox"),
			]);
	} catch (e) {
		console.warn("[syncCollectionsToPersistStore] Failed:", e);
	}
}
