import type {
	IAuthAgent,
	IBookmarkAgent,
	IHighlightAgent,
	IRssAgent,
	SyncData,
} from "@packages/agents";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createGoogleDriveSyncAgent } from "./sync-agent";

// test data builders
type Bookmark = Awaited<ReturnType<IBookmarkAgent["listBookmarks"]>>[number];
type Feed = Awaited<ReturnType<IRssAgent["listFeeds"]>>[number];
type Article = Awaited<ReturnType<IRssAgent["listArticles"]>>[number];
type Highlight = Awaited<ReturnType<IHighlightAgent["listHighlights"]>>[number];
type Annotation = Awaited<
	ReturnType<IHighlightAgent["listAnnotations"]>
>[number];

function bm(overrides: { id: string } & Partial<Bookmark>): Bookmark {
	return {
		title: `Bookmark ${overrides.id}`,
		url: `https://example.com/${overrides.id}`,
		tags: [],
		collectionId: "inbox",
		favorite: false,
		liked: false,
		saved: true,
		dateAdded: "2026-01-01T00:00:00.000Z",
		lastUpdatedAt: "2026-01-01T00:00:00.000Z",
		...overrides,
	} as Bookmark;
}

function feed(overrides: { id: string } & Partial<Feed>): Feed {
	return {
		title: `Feed ${overrides.id}`,
		feedUrl: `https://example.com/${overrides.id}.rss`,
		lastUpdatedAt: "2026-01-01T00:00:00.000Z",
		...overrides,
	} as Feed;
}

function article(overrides: { id: string } & Partial<Article>): Article {
	return {
		feedId: "f1",
		title: `Article ${overrides.id}`,
		link: `https://example.com/posts/${overrides.id}`,
		pubDate: "2026-01-01T00:00:00.000Z",
		read: false,
		liked: false,
		saved: false,
		lastUpdatedAt: "2026-01-01T00:00:00.000Z",
		...overrides,
	} as Article;
}

function highlight(overrides: { id: string } & Partial<Highlight>): Highlight {
	return {
		articleId: "a1",
		text: `Highlight ${overrides.id}`,
		color: "yellow",
		createdAt: "2026-01-01T00:00:00.000Z",
		...overrides,
	} as Highlight;
}

function annotation(
	overrides: { id: string } & Partial<Annotation>,
): Annotation {
	return {
		highlightId: "h1",
		text: `Annotation ${overrides.id}`,
		timestamp: "2026-01-01T00:00:00.000Z",
		...overrides,
	} as Annotation;
}

function syncData(overrides: Partial<SyncData>): SyncData {
	return {
		version: 1,
		exportedAt: "2026-01-02T00:00:00.000Z",
		bookmarks: [],
		feeds: [],
		articles: [],
		highlights: [],
		...overrides,
	};
}

// in-memory agent mocks
interface MockState {
	bookmarks: Bookmark[];
	feeds: Feed[];
	articles: Article[];
	highlights: Highlight[];
	annotations: Annotation[];
}

function makeMocks(state: Partial<MockState> = {}) {
	const bookmarks = state.bookmarks ?? [];
	const feeds = state.feeds ?? [];
	const articles = state.articles ?? [];
	const highlights = state.highlights ?? [];
	const annotations = state.annotations ?? [];

	const bookmarkAgent = {
		listBookmarks: vi.fn(async () => bookmarks.map((b) => ({ ...b }))),
		addBookmark: vi.fn(
			async (data: Record<string, unknown> & { url: string }) => {
				const created = bm({
					id: `local-${bookmarks.length + 1}`,
					...(data as Partial<Bookmark>),
				});
				bookmarks.push(created);
				return created;
			},
		),
		updateBookmark: vi.fn(async (id: string, data: Partial<Bookmark>) => {
			const i = bookmarks.findIndex((b) => b.id === id);
			if (i >= 0) bookmarks[i] = { ...bookmarks[i], ...data } as Bookmark;
		}),
		deleteBookmark: vi.fn(async (id: string) => {
			const i = bookmarks.findIndex((b) => b.id === id);
			if (i >= 0) bookmarks.splice(i, 1);
		}),
	} as unknown as IBookmarkAgent & Record<string, ReturnType<typeof vi.fn>>;

	const rssAgent = {
		listFeeds: vi.fn(async () => feeds.map((f) => ({ ...f }))),
		listArticles: vi.fn(async () => articles.map((a) => ({ ...a }))),
		addFeed: vi.fn(async (data: { feedUrl: string }) => {
			const created = feed({
				id: `local-feed-${feeds.length + 1}`,
				...(data as Partial<Feed>),
			});
			feeds.push(created);
			return created;
		}),
		insertArticles: vi.fn(async (rows: Array<Record<string, unknown>>) => {
			const created = rows.map((row, n) =>
				article({
					id: `local-article-${articles.length + n + 1}`,
					...(row as Partial<Article>),
				}),
			);
			articles.push(...created);
			return created;
		}),
		removeFeed: vi.fn(async (id: string) => {
			const i = feeds.findIndex((f) => f.id === id);
			if (i >= 0) feeds.splice(i, 1);
		}),
	} as unknown as IRssAgent & Record<string, ReturnType<typeof vi.fn>>;

	const highlightAgent = {
		listHighlights: vi.fn(async () => highlights.map((h) => ({ ...h }))),
		listAnnotations: vi.fn(async (highlightId: string) =>
			annotations
				.filter((a) => a.highlightId === highlightId)
				.map((a) => ({ ...a })),
		),
		addHighlight: vi.fn(async (data: { id?: string } & Partial<Highlight>) => {
			const created = highlight({
				id: data.id ?? `local-highlight-${highlights.length + 1}`,
				...(data as Partial<Highlight>),
			});
			highlights.push(created);
			return created;
		}),
		addAnnotation: vi.fn(
			async (data: { id?: string } & Partial<Annotation>) => {
				const created = annotation({
					id: data.id ?? `local-annotation-${annotations.length + 1}`,
					...(data as Partial<Annotation>),
				});
				annotations.push(created);
				return created;
			},
		),
	} as unknown as IHighlightAgent & Record<string, ReturnType<typeof vi.fn>>;

	const authAgent = {
		isSignedIn: vi.fn(async () => true),
		getAccessToken: vi.fn(async () => "test-access-token"),
	} as unknown as IAuthAgent & Record<string, ReturnType<typeof vi.fn>>;

	return { bookmarkAgent, rssAgent, highlightAgent, authAgent };
}

type Mocks = ReturnType<typeof makeMocks>;

// Google Drive fetch stub

function stubDrive(opts: {
	remote: SyncData | null;
	uploadOk?: boolean;
	/** When set, downloading the remote file fails. */
	downloadFails?: boolean;
}) {
	const uploadBodies: string[] = [];
	const fetchMock = vi.fn(async (url: unknown, init?: RequestInit) => {
		const u = String(url);
		const ok = (body: unknown) =>
			({ ok: true, status: 200, json: async () => body }) as Response;
		const fail = (status: number) =>
			({ ok: false, status, json: async () => ({}) }) as Response;

		if (u.includes("oauth2.googleapis.com")) return fail(500);
		if (u.includes("/files?"))
			return ok({
				files: opts.remote
					? [
							{
								id: "drive-file-1",
								name: "bookmark-reader-sync.json",
								mimeType: "application/json",
								modifiedTime: "",
							},
						]
					: [],
			});
		if (u.includes("alt=media")) {
			if (opts.downloadFails) return fail(500);
			return ok(opts.remote);
		}
		if (init?.method === "PATCH" || u.includes("upload")) {
			uploadBodies.push(String(init?.body ?? ""));
			return { ok: opts.uploadOk !== false, status: 200 } as Response;
		}
		return fail(500);
	});
	vi.stubGlobal("fetch", fetchMock);
	return { fetchMock, uploadBodies };
}

function makeAgent(
	mocks: Mocks,
	fileStore?: Parameters<typeof createGoogleDriveSyncAgent>[0]["fileStore"],
) {
	return createGoogleDriveSyncAgent({
		authAgent: mocks.authAgent,
		bookmarkAgent: mocks.bookmarkAgent,
		rssAgent: mocks.rssAgent,
		highlightAgent: mocks.highlightAgent,
		fileStore,
	});
}

afterEach(() => {
	vi.unstubAllGlobals();
});

// signed-in Google Drive sync
describe("sync() while signed in to Google Drive", () => {
	it("applies last-write-wins for bookmarks and adds new ones", async () => {
		const local = bm({ id: "b1", lastUpdatedAt: "2026-01-01T00:00:00.000Z" });
		const mocks = makeMocks({ bookmarks: [local] });
		stubDrive({
			remote: syncData({
				bookmarks: [
					// same id, newer remote edit -> must update locally
					bm({
						id: "b1",
						title: "Remote newer",
						lastUpdatedAt: "2026-02-01T00:00:00.000Z",
					}),
					// same id, older remote edit -> must be ignored
					bm({
						id: "b1",
						title: "Remote older",
						lastUpdatedAt: "2025-01-01T00:00:00.000Z",
					}),
					// new bookmark -> must be added
					bm({ id: "b2", title: "Remote new" }),
				],
			}),
		});

		const result = await makeAgent(mocks).sync();

		const updateFn = mocks.bookmarkAgent.updateBookmark as ReturnType<
			typeof vi.fn
		>;
		const addFn = mocks.bookmarkAgent.addBookmark as ReturnType<typeof vi.fn>;
		expect(updateFn).toHaveBeenCalledTimes(1);
		expect(updateFn).toHaveBeenCalledWith(
			"b1",
			expect.objectContaining({ title: "Remote newer" }),
		);
		expect(addFn).toHaveBeenCalledTimes(1);
		expect(addFn).toHaveBeenCalledWith(
			expect.objectContaining({ url: "https://example.com/b2" }),
		);
		expect(result.success).toBe(true);
		expect(result.bookmarksPushed).toBe(1);
		expect(result.bookmarksPulled).toBe(3);
	});

	it("adds missing feeds and articles, skips existing ones", async () => {
		const mocks = makeMocks({
			feeds: [feed({ id: "f1" })],
			articles: [article({ id: "a1", link: "https://example.com/posts/1" })],
		});
		stubDrive({
			remote: syncData({
				feeds: [feed({ id: "f1" }), feed({ id: "f2" })],
				articles: [
					article({ id: "a1", link: "https://example.com/posts/1" }),
					article({ id: "a2", link: "https://example.com/posts/2" }),
				],
			}),
		});

		const result = await makeAgent(mocks).sync();

		const addFeedFn = mocks.rssAgent.addFeed as ReturnType<typeof vi.fn>;
		const insertFn = mocks.rssAgent.insertArticles as ReturnType<typeof vi.fn>;
		expect(addFeedFn).toHaveBeenCalledTimes(1);
		expect(addFeedFn).toHaveBeenCalledWith(
			expect.objectContaining({ feedUrl: "https://example.com/f2.rss" }),
		);
		expect(insertFn).toHaveBeenCalledTimes(1);
		expect(insertFn).toHaveBeenCalledWith([
			expect.objectContaining({ link: "https://example.com/posts/2" }),
		]);
		expect(result.feedsPulled).toBe(2);
		expect(result.articlesPulled).toBe(2);
		expect(result.success).toBe(true);
	});

	it("merges remote highlights and annotations that are missing locally", async () => {
		const mocks = makeMocks({
			highlights: [highlight({ id: "h1" })],
			annotations: [annotation({ id: "an1", highlightId: "h1" })],
		});
		stubDrive({
			remote: syncData({
				highlights: [
					{
						...highlight({ id: "h1" }),
						annotations: [annotation({ id: "an1", highlightId: "h1" })],
					},
					{
						...highlight({ id: "h2", text: "Remote highlight" }),
						annotations: [
							annotation({ id: "an2", highlightId: "h2", text: "Remote note" }),
						],
					},
				],
			}),
		});

		const result = await makeAgent(mocks).sync();

		const addHighlightFn = mocks.highlightAgent.addHighlight as ReturnType<
			typeof vi.fn
		>;
		const addAnnotationFn = mocks.highlightAgent.addAnnotation as ReturnType<
			typeof vi.fn
		>;
		expect(addHighlightFn).toHaveBeenCalledTimes(1);
		expect(addHighlightFn).toHaveBeenCalledWith(
			expect.objectContaining({ id: "h2", text: "Remote highlight" }),
		);
		expect(addAnnotationFn).toHaveBeenCalledTimes(1);
		expect(addAnnotationFn).toHaveBeenCalledWith(
			expect.objectContaining({ id: "an2", text: "Remote note" }),
		);
		expect(result.success).toBe(true);
	});

	it("accumulates per-item errors and still merges the rest", async () => {
		const mocks = makeMocks({});
		(
			mocks.bookmarkAgent.addBookmark as ReturnType<typeof vi.fn>
		).mockImplementation(async (data: { url: string }) => {
			if (data.url.includes("bad")) throw new Error("constraint");
		});
		stubDrive({
			remote: syncData({
				bookmarks: [
					bm({ id: "bad1", title: "Bad bookmark" }),
					bm({ id: "good1", title: "Good bookmark" }),
				],
			}),
		});

		const result = await makeAgent(mocks).sync();

		expect(result.success).toBe(false);
		expect(result.errors).toEqual(["merge bookmark: Bad bookmark"]);
		expect(mocks.bookmarkAgent.addBookmark).toHaveBeenCalledTimes(2);
	});

	it("reports upload failure but still merges remote data", async () => {
		const mocks = makeMocks({});
		stubDrive({
			remote: syncData({ bookmarks: [bm({ id: "b1" })] }),
			uploadOk: false,
		});

		const result = await makeAgent(mocks).sync();

		expect(result.success).toBe(false);
		expect(result.errors).toContain("Failed to upload to Google Drive");
		expect(mocks.bookmarkAgent.addBookmark).toHaveBeenCalledWith(
			expect.objectContaining({ url: "https://example.com/b1" }),
		);
	});
});

// signed-out behavior

describe("sync() while signed out", () => {
	it("returns an error result and touches no agents without a fileStore", async () => {
		const mocks = makeMocks({});
		(mocks.authAgent.isSignedIn as ReturnType<typeof vi.fn>).mockResolvedValue(
			false,
		);
		stubDrive({ remote: null });

		const result = await makeAgent(mocks).sync();

		expect(result.success).toBe(false);
		expect(result.errors[0]).toMatch(/not signed in/i);
		expect(mocks.bookmarkAgent.listBookmarks).not.toHaveBeenCalled();
	});

	it("falls back to the local sync file when a fileStore is provided", async () => {
		const local = bm({ id: "b1", lastUpdatedAt: "2026-01-01T00:00:00.000Z" });
		const mocks = makeMocks({ bookmarks: [local] });
		const remoteOnDisk = syncData({
			bookmarks: [
				bm({
					id: "b1",
					title: "Disk newer",
					lastUpdatedAt: "2026-03-01T00:00:00.000Z",
				}),
			],
		});
		const writes: string[] = [];
		const fileStore = {
			readTextFile: vi.fn(async () => JSON.stringify(remoteOnDisk)),
			writeTextFile: vi.fn(async (_path: string, data: string) => {
				writes.push(data);
			}),
			resolvePath: vi.fn(async () => "C:\\appdata\\sync.json"),
			cachedPath: () => "C:\\appdata\\sync.json",
		};
		(mocks.authAgent.isSignedIn as ReturnType<typeof vi.fn>).mockResolvedValue(
			false,
		);
		stubDrive({ remote: null });

		const result = await makeAgent(
			mocks,
			fileStore as Parameters<
				typeof createGoogleDriveSyncAgent
			>[0]["fileStore"],
		).sync();

		expect(result.success).toBe(true);
		expect(writes).toHaveLength(1);
		expect(writes[0]).toContain("Bookmark b1");
		expect(mocks.bookmarkAgent.updateBookmark).toHaveBeenCalledWith(
			"b1",
			expect.objectContaining({ title: "Disk newer" }),
		);
	});
});

// file import/export
describe("export/import file support", () => {
	it("throws a platform error without a fileStore", async () => {
		const mocks = makeMocks({});
		const agent = makeAgent(mocks);

		await expect(agent.exportToFile()).rejects.toThrow(/not supported/i);
		await expect(agent.importFromFile(syncData({}), "merge")).rejects.toThrow(
			/not supported/i,
		);
		expect(agent.getSyncFilePath()).toBeNull();
	});

	it("importFromFile in replace mode clears existing data and applies highlights", async () => {
		const mocks = makeMocks({
			bookmarks: [bm({ id: "old1" })],
			feeds: [feed({ id: "fold1" })],
		});
		const writes: string[] = [];
		const fileStore = {
			readTextFile: vi.fn(async () => "{}"),
			writeTextFile: vi.fn(async (_p: string, data: string) => {
				writes.push(data);
			}),
			resolvePath: vi.fn(async () => "C:\\appdata\\sync.json"),
			cachedPath: () => null,
		};
		stubDrive({ remote: null });

		const agent = makeAgent(
			mocks,
			fileStore as Parameters<
				typeof createGoogleDriveSyncAgent
			>[0]["fileStore"],
		);

		await agent.importFromFile(
			syncData({
				bookmarks: [bm({ id: "new1", title: "Imported" })],
				highlights: [
					{
						...highlight({ id: "h1" }),
						annotations: [annotation({ id: "an1", highlightId: "h1" })],
					},
				],
			}),
			"replace",
		);

		expect(mocks.bookmarkAgent.deleteBookmark).toHaveBeenCalledWith("old1");
		expect(mocks.rssAgent.removeFeed).toHaveBeenCalledWith("fold1");
		expect(mocks.bookmarkAgent.addBookmark).toHaveBeenCalledWith(
			expect.objectContaining({ title: "Imported" }),
		);
		expect(mocks.highlightAgent.addHighlight).toHaveBeenCalledWith(
			expect.objectContaining({ id: "h1" }),
		);
		expect(mocks.highlightAgent.addAnnotation).toHaveBeenCalledWith(
			expect.objectContaining({ id: "an1" }),
		);
		// cachedPath stays null: import never resolves a path (only export
		// and signed-out sync do)
		expect(agent.getSyncFilePath()).toBeNull();
	});
});
