// Pure database agents, no extractus, no network calls beyond what's needed
// Safe for all platforms including React Native / Hermes

import type { DB } from "@packages/db/src/index";
import type {
	Annotation,
	Article,
	Bookmark,
	Collection,
	Feed,
	Highlight,
	NewArticle,
	NewBookmark,
	NewFeed,
} from "@packages/db/src/schema";
import {
	annotations,
	articles,
	bookmarks,
	collections,
	feeds,
	highlights,
} from "@packages/db/src/schema";
import { and, asc, desc, eq, gte, inArray, like, lte, sql } from "drizzle-orm";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomId(prefix: string): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function stableId(prefix: string, input: string): string {
	let hash = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash =
			(hash +
				((hash << 1) +
					(hash << 4) +
					(hash << 7) +
					(hash << 8) +
					(hash << 24))) >>>
			0;
	}
	return `${prefix}_${hash.toString(16)}`;
}

function now(): string {
	return new Date().toISOString();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type { Article, Bookmark, Collection, Feed };

// ─── Collection Tree Types ─────────────────────────────────────────────────────

export interface CollectionTreeNode {
	id: string;
	name: string;
	parentId: string | null;
	position: number;
	createdAt: string;
	updatedAt: string;
	bookmarkCount: number;
	children: CollectionTreeNode[];
}

// ─── Filter Types ──────────────────────────────────────────────────────────────

export interface BookmarkFilterOptions {
	collectionId?: string;
	tags?: string[];
	favorite?: boolean;
	liked?: boolean;
	saved?: boolean;
	search?: string;
	dateAddedFrom?: string;
	dateAddedTo?: string;
	offset?: number;
	limit?: number;
	orderBy?: "dateAdded" | "title" | "lastUpdatedAt";
	orderDir?: "asc" | "desc";
}

export interface ArticleFilterOptions {
	feedId?: string;
	read?: boolean;
	liked?: boolean;
	saved?: boolean;
	search?: string;
	pubDateFrom?: string;
	pubDateTo?: string;
	offset?: number;
	limit?: number;
	orderBy?: "pubDate" | "title" | "lastUpdatedAt";
	orderDir?: "asc" | "desc";
}

// ─── Sync Types ───────────────────────────────────────────────────────────────

export interface SyncData {
	version: number;
	exportedAt: string;
	bookmarks: Bookmark[];
	feeds: Feed[];
	articles: Article[];
	highlights: (Highlight & { annotations: Annotation[] })[];
}

export interface SyncResult {
	success: boolean;
	syncedAt: string;
	bookmarksPushed: number;
	bookmarksPulled: number;
	feedsPushed: number;
	feedsPulled: number;
	articlesPushed: number;
	articlesPulled: number;
	errors: string[];
}

export type SyncProvider = "gdrive" | "dropbox" | "icloud" | "none";
export type AuthProvider = "gdrive" | "dropbox" | "none";

export interface AuthResult {
	success: boolean;
	provider: AuthProvider;
	accessToken: string | null;
	refreshToken?: string | null;
	error?: string;
}

export interface AuthUserInfo {
	email: string;
	name?: string;
	picture?: string;
}

// ─── Auth Agent ────────────────────────────────────────────────────────────────

export interface IAuthAgent {
	signIn(provider: AuthProvider): Promise<AuthResult>;
	signOut(): Promise<void>;
	getAccessToken(): Promise<string | null>;
	isSignedIn(): Promise<boolean>;
	getProvider(): Promise<AuthProvider>;
	getUserInfo(): Promise<AuthUserInfo | null>;
}

// ─── Sync Agent ───────────────────────────────────────────────────────────────

export interface ISyncAgent {
	sync(): Promise<SyncResult>;
	startAutoSync(intervalMs: number): void;
	stopAutoSync(): void;
	exportToFile(): Promise<string>;
	importFromFile(data: SyncData, mode: "merge" | "replace"): Promise<void>;
	getSyncFilePath(): string | null;
}

export interface ParsedArticle {
	feedId: string;
	title: string;
	link: string;
	content?: string;
	contentSnippet?: string;
	imageUrl?: string;
	pubDate: string;
	read: boolean;
	liked: boolean;
	saved: boolean;
	lastUpdatedAt: string;
}

// ─── Collection Agent ─────────────────────────────────────────────────────────

export interface ICollectionAgent {
	createCollection(name: string, parentId?: string | null): Promise<Collection>;
	renameCollection(id: string, name: string): Promise<Collection>;
	deleteCollection(id: string): Promise<void>;
	moveCollection(
		id: string,
		newParentId: string | null,
		position?: number,
	): Promise<Collection>;
	setCollectionPosition(id: string, position: number): Promise<Collection>;
	getCollection(id: string): Promise<Collection | undefined>;
	listCollections(): Promise<Collection[]>;
	getCollectionTree(): Promise<CollectionTreeNode[]>;
	getCollectionBookmarkCount(id: string): Promise<number>;
	getDescendantIds(id: string): Promise<string[]>;
}

// ─── Bookmark Agent ───────────────────────────────────────────────────────────

export interface IBookmarkAgent {
	addBookmark(data: Omit<NewBookmark, "id" | "dateAdded">): Promise<Bookmark>;
	getBookmark(id: string): Promise<Bookmark | undefined>;
	listBookmarks(collectionId?: string): Promise<Bookmark[]>;
	listBookmarksFiltered(options?: BookmarkFilterOptions): Promise<Bookmark[]>;
	searchBookmarks(query: string): Promise<Bookmark[]>;
	updateBookmark(
		id: string,
		data: Partial<Omit<NewBookmark, "id">>,
	): Promise<Bookmark>;
	deleteBookmark(id: string): Promise<void>;
	toggleFavorite(id: string): Promise<void>;
	toggleLiked(id: string): Promise<void>;
	toggleSaved(id: string): Promise<void>;
	addTag(id: string, tag: string): Promise<void>;
}

function buildBookmarkQuery(q: any, options?: BookmarkFilterOptions): any {
	const conditions: any[] = [];

	if (options?.collectionId && options.collectionId !== "all") {
		conditions.push(eq(bookmarks.collectionId, options.collectionId));
	}
	if (options?.tags && options.tags.length > 0) {
		// Tag filtering via JSON array contains, check each tag
		const tagConditions = options.tags.map(
			(tag) => sql`${bookmarks.tags} LIKE ${`%"${tag}"%`}`,
		);
		conditions.push(sql`(${and(...tagConditions)})`);
	}
	if (options?.favorite !== undefined) {
		conditions.push(eq(bookmarks.favorite, options.favorite));
	}
	if (options?.liked !== undefined) {
		conditions.push(eq(bookmarks.liked, options.liked));
	}
	if (options?.saved !== undefined) {
		conditions.push(eq(bookmarks.saved, options.saved));
	}
	if (options?.search) {
		const term = `%${options.search.replace(/[%_]/g, "\\$&")}%`;
		conditions.push(
			sql`(${like(bookmarks.title, term)} OR ${like(bookmarks.url, term)} OR ${like(bookmarks.description, term)})`,
		);
	}
	if (options?.dateAddedFrom) {
		conditions.push(gte(bookmarks.dateAdded, options.dateAddedFrom));
	}
	if (options?.dateAddedTo) {
		conditions.push(lte(bookmarks.dateAdded, options.dateAddedTo));
	}

	let query = q.select().from(bookmarks);
	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	// Sorting
	const orderCol =
		options?.orderBy === "title"
			? bookmarks.title
			: options?.orderBy === "lastUpdatedAt"
				? bookmarks.lastUpdatedAt
				: bookmarks.dateAdded;
	const orderFn = options?.orderDir === "asc" ? asc : desc;
	query = query.orderBy(orderFn(orderCol));

	// Pagination
	if (options?.offset !== undefined) {
		query = query.offset(options.offset);
	}
	if (options?.limit !== undefined) {
		query = query.limit(options.limit);
	}

	return query;
}

export function createBookmarkAgent(db: DB): IBookmarkAgent {
	const q = db as any;
	return {
		addBookmark: async (data) => {
			const [row] = await q
				.insert(bookmarks)
				.values({
					...data,
					id: randomId("bkm"),
					dateAdded: now(),
					lastUpdatedAt: now(),
				})
				.returning();
			if (!row) throw new Error("Failed to add bookmark.");
			return row;
		},
		getBookmark: async (id) => {
			const [row] = await q
				.select()
				.from(bookmarks)
				.where(eq(bookmarks.id, id))
				.limit(1);
			return row;
		},
		listBookmarks: async (collectionId) => {
			if (collectionId && collectionId !== "all") {
				return q
					.select()
					.from(bookmarks)
					.where(eq(bookmarks.collectionId, collectionId));
			}
			return q.select().from(bookmarks);
		},
		listBookmarksFiltered: async (options) => {
			return buildBookmarkQuery(q, options);
		},
		searchBookmarks: async (query) => {
			try {
				// Try FTS search first (FTS5 where available, FTS4 fallback)
				const ftsQuery = query.replace(/[^a-zA-Z0-9\s]/g, "").trim();
				if (ftsQuery) {
					const result = await q.all(
						sql`SELECT b.* FROM bookmarks b
              INNER JOIN bookmarks_fts fts ON b.rowid = fts.rowid
              WHERE bookmarks_fts MATCH ${ftsQuery}
              ORDER BY b.date_added DESC`,
					);
					if (result.length > 0) return result as Bookmark[];
				}
			} catch {
				// FTS not available, fall through to LIKE search
			}
			// Fallback: multi-field LIKE search
			const term = `%${query.replace(/[%_]/g, "\\$&")}%`;
			return q
				.select()
				.from(bookmarks)
				.where(
					sql`(${like(bookmarks.title, term)} OR ${like(bookmarks.url, term)} OR ${like(bookmarks.description, term)})`,
				)
				.orderBy(desc(bookmarks.dateAdded));
		},
		updateBookmark: async (id, data) => {
			const [row] = await q
				.update(bookmarks)
				.set({ ...data, lastUpdatedAt: now() })
				.where(eq(bookmarks.id, id))
				.returning();
			if (!row) throw new Error(`Bookmark ${id} not found.`);
			return row;
		},
		deleteBookmark: async (id) => {
			await q.delete(bookmarks).where(eq(bookmarks.id, id));
		},
		toggleFavorite: async (id) => {
			const [cur] = await q
				.select({ favorite: bookmarks.favorite })
				.from(bookmarks)
				.where(eq(bookmarks.id, id))
				.limit(1);
			if (cur)
				await q
					.update(bookmarks)
					.set({ favorite: !cur.favorite, lastUpdatedAt: now() })
					.where(eq(bookmarks.id, id));
		},
		toggleLiked: async (id) => {
			const [cur] = await q
				.select({ liked: bookmarks.liked })
				.from(bookmarks)
				.where(eq(bookmarks.id, id))
				.limit(1);
			if (cur)
				await q
					.update(bookmarks)
					.set({ liked: !cur.liked, lastUpdatedAt: now() })
					.where(eq(bookmarks.id, id));
		},
		toggleSaved: async (id) => {
			const [cur] = await q
				.select({ saved: bookmarks.saved })
				.from(bookmarks)
				.where(eq(bookmarks.id, id))
				.limit(1);
			if (cur)
				await q
					.update(bookmarks)
					.set({ saved: !cur.saved, lastUpdatedAt: now() })
					.where(eq(bookmarks.id, id));
		},
		addTag: async (id, tag) => {
			const [cur] = await q
				.select({ tags: bookmarks.tags })
				.from(bookmarks)
				.where(eq(bookmarks.id, id))
				.limit(1);
			if (!cur) throw new Error(`Bookmark ${id} not found.`);
			const existing: string[] = Array.isArray(cur.tags) ? cur.tags : [];
			if (existing.includes(tag)) return;
			await q
				.update(bookmarks)
				.set({ tags: [...existing, tag], lastUpdatedAt: now() })
				.where(eq(bookmarks.id, id));
		},
	};
}

// ─── RSS Agent ────────────────────────────────────────────────────────────────

export interface IRssAgent {
	addFeed(data: Omit<NewFeed, "id">): Promise<Feed>;
	removeFeed(id: string): Promise<void>;
	listFeeds(): Promise<Feed[]>;
	// refreshFeed is platform-specific, handled by the store layer
	// which calls insertArticles after platform-specific parsing
	insertArticles(parsed: ParsedArticle[]): Promise<Article[]>;
	updateFeedMeta(
		id: string,
		meta: { title?: string; lastFetched?: string; unreadCount?: number },
	): Promise<void>;
	listArticles(feedId?: string): Promise<Article[]>;
	listArticlesFiltered(options?: ArticleFilterOptions): Promise<Article[]>;
	searchArticles(query: string): Promise<Article[]>;
	markArticleRead(id: string, read: boolean, readAt?: string): Promise<void>;
	toggleArticleLike(id: string): Promise<void>;
	toggleArticleSave(id: string): Promise<void>;
	updateArticleContent(
		id: string,
		fullContent: string,
		imageUrl?: string | null,
	): Promise<void>;
}

function buildArticleQuery(q: any, options?: ArticleFilterOptions): any {
	const conditions: any[] = [];

	if (options?.feedId) {
		conditions.push(eq(articles.feedId, options.feedId));
	}
	if (options?.read !== undefined) {
		conditions.push(eq(articles.read, options.read));
	}
	if (options?.liked !== undefined) {
		conditions.push(eq(articles.liked, options.liked));
	}
	if (options?.saved !== undefined) {
		conditions.push(eq(articles.saved, options.saved));
	}
	if (options?.search) {
		const term = `%${options.search.replace(/[%_]/g, "\\$&")}%`;
		conditions.push(
			sql`(${like(articles.title, term)} OR ${like(articles.link, term)} OR ${like(articles.contentSnippet, term)})`,
		);
	}
	if (options?.pubDateFrom) {
		conditions.push(gte(articles.pubDate, options.pubDateFrom));
	}
	if (options?.pubDateTo) {
		conditions.push(lte(articles.pubDate, options.pubDateTo));
	}

	let query = q.select().from(articles);
	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	// Sorting
	const orderCol =
		options?.orderBy === "title"
			? articles.title
			: options?.orderBy === "lastUpdatedAt"
				? articles.lastUpdatedAt
				: articles.pubDate;
	const orderFn = options?.orderDir === "asc" ? asc : desc;
	query = query.orderBy(orderFn(orderCol));

	// Pagination
	if (options?.offset !== undefined) {
		query = query.offset(options.offset);
	}
	if (options?.limit !== undefined) {
		query = query.limit(options.limit);
	}

	return query;
}

export function createRssAgent(db: DB): IRssAgent {
	const q = db as any;
	return {
		addFeed: async (data) => {
			const existing = await q
				.select()
				.from(feeds)
				.where(eq(feeds.feedUrl, data.feedUrl))
				.limit(1);
			if (existing[0]) return existing[0];
			const [row] = await q
				.insert(feeds)
				.values({
					...data,
					id: randomId("feed"),
					unreadCount: 0,
					lastUpdatedAt: now(),
				})
				.returning();
			if (!row) throw new Error("Failed to add feed.");
			return row;
		},
		removeFeed: async (id) => {
			await q.delete(feeds).where(eq(feeds.id, id));
		},
		listFeeds: async () => {
			return q.select().from(feeds);
		},
		insertArticles: async (parsed) => {
			if (!parsed.length) return [];

			const links = parsed.map((a) => a.link).filter(Boolean);
			const existing = await q
				.select({
					link: articles.link,
					id: articles.id,
					imageUrl: articles.imageUrl,
				})
				.from(articles)
				.where(inArray(articles.link, links));

			const existingByLink = new Map(existing.map((e: any) => [e.link, e]));
			const timestamp = now();

			// Backfill imageUrl on existing articles missing it
			for (const p of parsed) {
				const ex = existingByLink.get(p.link) as any;
				if (ex && !ex.imageUrl && p.imageUrl) {
					await q
						.update(articles)
						.set({ imageUrl: p.imageUrl, lastUpdatedAt: timestamp })
						.where(eq(articles.id, ex.id));
				}
			}

			const newRows: NewArticle[] = parsed
				.filter((a) => !existingByLink.has(a.link))
				.map((a) => ({
					...a,
					id: stableId("article", `${a.feedId}|${a.link}`),
					lastUpdatedAt: timestamp,
				}));

			if (!newRows.length) return [];

			const inserted = await q
				.insert(articles)
				.values(newRows)
				.onConflictDoNothing()
				.returning();

			return inserted;
		},
		updateFeedMeta: async (id, meta) => {
			await q
				.update(feeds)
				.set({ ...meta, lastUpdatedAt: now() })
				.where(eq(feeds.id, id));
		},
		listArticles: async (feedId) => {
			if (feedId)
				return q.select().from(articles).where(eq(articles.feedId, feedId));
			return q.select().from(articles);
		},
		listArticlesFiltered: async (options) => {
			return buildArticleQuery(q, options);
		},
		searchArticles: async (query) => {
			try {
				// Try FTS search first (FTS5 where available, FTS4 fallback)
				const ftsQuery = query.replace(/[^a-zA-Z0-9\s]/g, "").trim();
				if (ftsQuery) {
					const result = await q.all(
						sql`SELECT a.* FROM articles a
              INNER JOIN articles_fts fts ON a.rowid = fts.rowid
              WHERE articles_fts MATCH ${ftsQuery}
              ORDER BY a.pub_date DESC`,
					);
					if (result.length > 0) return result as Article[];
				}
			} catch {
				// FTS not available, fall through to LIKE search
			}
			// Fallback: multi-field LIKE search
			const term = `%${query.replace(/[%_]/g, "\\$&")}%`;
			return q
				.select()
				.from(articles)
				.where(
					sql`(${like(articles.title, term)} OR ${like(articles.link, term)} OR ${like(articles.contentSnippet, term)})`,
				)
				.orderBy(desc(articles.pubDate));
		},
		markArticleRead: async (id, read, readAt) => {
			await q
				.update(articles)
				.set({ read, readAt: readAt ?? null, lastUpdatedAt: now() })
				.where(eq(articles.id, id));
		},
		toggleArticleLike: async (id) => {
			const [cur] = await q
				.select({ liked: articles.liked })
				.from(articles)
				.where(eq(articles.id, id))
				.limit(1);
			if (cur)
				await q
					.update(articles)
					.set({ liked: !cur.liked, lastUpdatedAt: now() })
					.where(eq(articles.id, id));
		},
		toggleArticleSave: async (id) => {
			const [cur] = await q
				.select({ saved: articles.saved })
				.from(articles)
				.where(eq(articles.id, id))
				.limit(1);
			if (cur)
				await q
					.update(articles)
					.set({ saved: !cur.saved, lastUpdatedAt: now() })
					.where(eq(articles.id, id));
		},
		updateArticleContent: async (id, fullContent, imageUrl) => {
			await q
				.update(articles)
				.set({
					fullContent,
					...(imageUrl !== undefined ? { imageUrl } : {}),
					lastUpdatedAt: now(),
				})
				.where(eq(articles.id, id));
		},
	};
}

// ─── Collection Agent ─────────────────────────────────────────────────────────

export function createCollectionAgent(db: DB): ICollectionAgent {
	const q = db as any;

	return {
		createCollection: async (name, parentId) => {
			const id = slugify(name);
			const existing = await q
				.select()
				.from(collections)
				.where(eq(collections.id, id))
				.limit(1);
			if (existing.length > 0) {
				throw new Error(`Collection "${name}" already exists.`);
			}
			// Get next position at the target parent level
			const siblings: Collection[] = parentId
				? await q
						.select()
						.from(collections)
						.where(eq(collections.parentId, parentId))
				: await q
						.select()
						.from(collections)
						.where(sql`${collections.parentId} IS NULL`);
			const position = siblings.length;

			const [row] = await q
				.insert(collections)
				.values({
					id,
					name,
					parentId: parentId ?? null,
					position,
					createdAt: now(),
					updatedAt: now(),
				})
				.returning();
			if (!row) throw new Error("Failed to create collection.");
			return row;
		},

		renameCollection: async (id, name) => {
			const [row] = await q
				.update(collections)
				.set({ name, updatedAt: now() })
				.where(eq(collections.id, id))
				.returning();
			if (!row) throw new Error(`Collection ${id} not found.`);
			return row;
		},

		deleteCollection: async (id) => {
			// Move child collections up to the deleted collection's parent
			const col = await q
				.select()
				.from(collections)
				.where(eq(collections.id, id))
				.limit(1);
			if (!col.length) throw new Error(`Collection ${id} not found.`);
			const parentId = col[0].parentId;

			// Reparent children
			await q
				.update(collections)
				.set({ parentId, updatedAt: now() })
				.where(eq(collections.parentId, id));

			// Move bookmarks in this collection to parent (or inbox if root)
			const targetId = parentId ?? "inbox";
			await q
				.update(bookmarks)
				.set({ collectionId: targetId, lastUpdatedAt: now() })
				.where(eq(bookmarks.collectionId, id));

			// Delete the collection
			await q.delete(collections).where(eq(collections.id, id));
		},

		moveCollection: async (id, newParentId, position) => {
			const siblings: Collection[] = newParentId
				? await q
						.select()
						.from(collections)
						.where(
							and(
								eq(collections.parentId, newParentId),
								sql`${collections.id} != ${id}`,
							),
						)
						.orderBy(collections.position)
				: await q
						.select()
						.from(collections)
						.where(
							and(
								sql`${collections.parentId} IS NULL`,
								sql`${collections.id} != ${id}`,
							),
						)
						.orderBy(collections.position);

			const pos = position ?? siblings.length;

			// Shift positions of siblings at or after the target position
			for (const sibling of siblings) {
				if (sibling.position >= pos) {
					await q
						.update(collections)
						.set({ position: sibling.position + 1, updatedAt: now() })
						.where(eq(collections.id, sibling.id));
				}
			}

			const [row] = await q
				.update(collections)
				.set({
					parentId: newParentId ?? null,
					position: pos,
					updatedAt: now(),
				})
				.where(eq(collections.id, id))
				.returning();
			if (!row) throw new Error(`Collection ${id} not found.`);
			return row;
		},

		setCollectionPosition: async (id, position) => {
			const [row] = await q
				.update(collections)
				.set({ position, updatedAt: now() })
				.where(eq(collections.id, id))
				.returning();
			if (!row) throw new Error(`Collection ${id} not found.`);
			return row;
		},

		getCollection: async (id) => {
			const [row] = await q
				.select()
				.from(collections)
				.where(eq(collections.id, id))
				.limit(1);
			return row;
		},

		listCollections: async () => {
			return q
				.select()
				.from(collections)
				.orderBy(collections.position, collections.createdAt);
		},

		getCollectionTree: async () => {
			const all = await q
				.select()
				.from(collections)
				.orderBy(collections.position, collections.createdAt);

			// Get bookmark counts for all collections
			const counts = await q.all(
				sql`SELECT collection_id, COUNT(*) as cnt FROM bookmarks GROUP BY collection_id`,
			);
			const countMap = new Map<string, number>();
			for (const row of counts) {
				countMap.set(row.collection_id, row.cnt);
			}

			const buildTree = (parentId: string | null): CollectionTreeNode[] => {
				return all
					.filter((c: Collection) => c.parentId === parentId)
					.map((c: Collection) => ({
						...c,
						bookmarkCount: countMap.get(c.id) ?? 0,
						children: buildTree(c.id),
					}));
			};

			return buildTree(null);
		},

		getCollectionBookmarkCount: async (id) => {
			const [row] = await q.all(
				sql`SELECT COUNT(*) as cnt FROM bookmarks WHERE collection_id = ${id}`,
			);
			return row?.cnt ?? 0;
		},

		getDescendantIds: async (id) => {
			const result: string[] = [];
			const collect = async (parentId: string) => {
				const children: Collection[] = await q
					.select()
					.from(collections)
					.where(eq(collections.parentId, parentId));
				for (const child of children) {
					result.push(child.id);
					await collect(child.id);
				}
			};
			await collect(id);
			return result;
		},
	};
}

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

// ─── Highlight Agent ─────────────────────────────────────────────────────────

export interface IHighlightAgent {
	listHighlights(articleId?: string): Promise<Highlight[]>;
	listAnnotations(highlightId: string): Promise<Annotation[]>;
	addHighlight(data: {
		articleId: string;
		text: string;
		color: string;
		id?: string;
	}): Promise<Highlight>;
	removeHighlight(id: string): Promise<void>;
	addAnnotation(data: {
		highlightId: string;
		text: string;
		id?: string;
	}): Promise<Annotation>;
	removeAnnotation(id: string): Promise<void>;
}

export function createHighlightAgent(db: DB): IHighlightAgent {
	const q = db as any;

	const listAnnotations = async (highlightId: string) => {
		return q
			.select()
			.from(annotations)
			.where(eq(annotations.highlightId, highlightId));
	};

	return {
		listHighlights: async (articleId) => {
			if (articleId) {
				return q
					.select()
					.from(highlights)
					.where(eq(highlights.articleId, articleId));
			}
			return q.select().from(highlights);
		},

		listAnnotations,

		addHighlight: async (data) => {
			const [row] = await q
				.insert(highlights)
				.values({
					articleId: data.articleId,
					text: data.text,
					color: data.color,
					id: data.id ?? randomId("hl"),
					createdAt: now(),
				})
				.returning();
			if (!row) throw new Error("Failed to add highlight.");
			return row;
		},

		removeHighlight: async (id) => {
			await q.delete(highlights).where(eq(highlights.id, id));
		},

		addAnnotation: async (data) => {
			const [row] = await q
				.insert(annotations)
				.values({
					highlightId: data.highlightId,
					text: data.text,
					id: data.id ?? randomId("ann"),
					timestamp: now(),
				})
				.returning();
			if (!row) throw new Error("Failed to add annotation.");
			return row;
		},

		removeAnnotation: async (id) => {
			await q.delete(annotations).where(eq(annotations.id, id));
		},
	};
}

// ─── IAgents ─────────────────────────────────────────────────────────────────

export interface IAgents {
	bookmarkAgent: IBookmarkAgent;
	collectionAgent: ICollectionAgent;
	rssAgent: IRssAgent;
	highlightAgent: IHighlightAgent;
	syncAgent: ISyncAgent;
	authAgent: IAuthAgent;
}
