import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// --- Schema Version (for migrations) ---

export const schemaVersion = sqliteTable("schema_version", {
	version: integer("version").primaryKey(),
	appliedAt: text("applied_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// --- Bookmarks Schema -----
export const bookmarks = sqliteTable("bookmarks", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	url: text("url").notNull(),
	description: text("description"),
	favicon: text("favicon"),
	image: text("image"),
	tags: text("tags", { mode: "json" }).$type<string[]>().default([]).notNull(),
	dateAdded: text("date_added").default(sql`CURRENT_TIMESTAMP`).notNull(),
	favorite: integer("favorite", { mode: "boolean" }).default(false).notNull(),
	collectionId: text("collection_id").default("inbox").notNull(),
	liked: integer("liked", { mode: "boolean" }).default(false).notNull(),
	saved: integer("saved", { mode: "boolean" }).default(true).notNull(), // Bookmarks are'saved'
	lastUpdatedAt: text("last_updated_at")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

// --- RSS Feeds Schema ---

export const feeds = sqliteTable("feeds", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	feedUrl: text("feed_url").unique().notNull(),
	siteUrl: text("site_url"),
	lastFetched: text("last_fetched"),
	unreadCount: integer("unread_count").default(0).notNull(), //this ones typically calculated, but keeping it for simplicity/mocking if needed
	lastUpdatedAt: text("last_updated_at")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

// --- RSS Articles Schema ---

export const articles = sqliteTable("articles", {
	id: text("id").primaryKey(),
	feedId: text("feed_id")
		.notNull()
		.references(() => feeds.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	link: text("link").unique().notNull(),
	contentSnippet: text("content_snippet"),
	content: text("content"),
	fullContent: text("full_content"),
	imageUrl: text("image_url"),
	imageData: text("image_data"),
	pubDate: text("pub_date"),
	read: integer("read", { mode: "boolean" }).default(false).notNull(),
	liked: integer("liked", { mode: "boolean" }).default(false).notNull(),
	saved: integer("saved", { mode: "boolean" }).default(false).notNull(),
	lastUpdatedAt: text("last_updated_at")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	readAt: text("read_at"),
});

// --- Collections Schema ---

export const collections = sqliteTable("collections", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	parentId: text("parent_id"),
	position: integer("position").default(0).notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// --- Highlights Schema ---

export const highlights = sqliteTable("highlights", {
	id: text("id").primaryKey(),
	articleId: text("article_id")
		.notNull()
		.references(() => articles.id, { onDelete: "cascade" }),
	text: text("text").notNull(),
	color: text("color").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// --- Annotations Schema ---

export const annotations = sqliteTable("annotations", {
	id: text("id").primaryKey(),
	highlightId: text("highlight_id")
		.notNull()
		.references(() => highlights.id, { onDelete: "cascade" }),
	text: text("text").notNull(),
	timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Export Types for Drizzle, but you could probably tell, no?

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

export type Feed = typeof feeds.$inferSelect;
export type NewFeed = typeof feeds.$inferInsert;

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

export type Highlight = typeof highlights.$inferSelect;
export type NewHighlight = typeof highlights.$inferInsert;

export type Annotation = typeof annotations.$inferSelect;
export type NewAnnotation = typeof annotations.$inferInsert;
