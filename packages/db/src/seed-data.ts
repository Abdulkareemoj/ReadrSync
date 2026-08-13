// Dev/test seed data for the bookmarks and feeds tables, meant to give you
// real, non-empty data to click through on web, desktop, and mobile without
// hand-entering it three times.
//
// Usage: import { seedDatabase } from "@packages/db/seed-data" and call it
// once against whatever `db` instance each app already constructs (libsql,
// sql-js, or expo-sqlite), drizzle's .insert() API is the same regardless
// of dialect, so this works unmodified across all three.
//
//   await seedDatabase(db);
//
// Seeding is a no-op when the tables already have rows (see the onlyIfEmpty
// option), so it's safe to call on every app launch.

import { sql } from "drizzle-orm";
import type { NewBookmark, NewFeed } from "./schema";
import { bookmarks, feeds } from "./schema";
import { jsonBookmarks, jsonFeeds } from "./seed-data-json";

// --- RSS Feeds -----------------------------------------------------------
// Pulled from Feedspot's "Best RSS Feeds by Category (2026)" list
// (https://rss.feedspot.com/best_rss_feeds/), one or two picks per category
// for variety. feedUrl is unique + required for actual parsing; siteUrl is
// just the homepage.

export const seedFeeds: NewFeed[] = [
	// News & Current Affairs
	{
		id: "feed-nbc-news",
		title: "NBC News",
		feedUrl: "https://feeds.nbcnews.com/nbcnews/public/news",
		siteUrl: "https://www.nbcnews.com/",
	},
	{
		id: "feed-nyt",
		title: "The New York Times",
		feedUrl: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
		siteUrl: "https://www.nytimes.com/",
	},
	{
		id: "feed-vox",
		title: "Vox",
		feedUrl: "https://www.vox.com/rss/index.xml",
		siteUrl: "https://www.vox.com/",
	},

	// Technology
	{
		id: "feed-wired",
		title: "WIRED",
		feedUrl: "https://www.wired.com/feed/rss",
		siteUrl: "https://www.wired.com/",
	},
	{
		id: "feed-verge",
		title: "The Verge",
		feedUrl: "https://www.theverge.com/rss/index.xml",
		siteUrl: "https://www.theverge.com/",
	},
	{
		id: "feed-techcrunch",
		title: "TechCrunch",
		feedUrl: "https://techcrunch.com/feed/",
		siteUrl: "https://techcrunch.com/",
	},
	{
		id: "feed-hackaday",
		title: "Hackaday",
		feedUrl: "https://hackaday.com/blog/feed/",
		siteUrl: "https://hackaday.com/blog/",
	},
	{
		id: "feed-bleepingcomputer",
		title: "BleepingComputer",
		feedUrl: "https://www.bleepingcomputer.com/feed/",
		siteUrl: "https://www.bleepingcomputer.com/",
	},
	{
		id: "feed-ieee-spectrum",
		title: "IEEE Spectrum",
		feedUrl: "https://feeds.feedburner.com/IeeeSpectrumFullText",
		siteUrl: "https://spectrum.ieee.org/",
	},

	// Business
	{
		id: "feed-forbes-business",
		title: "Forbes » Business",
		feedUrl: "https://www.forbes.com/business/feed/",
		siteUrl: "https://www.forbes.com/business/",
	},
	{
		id: "feed-business-insider",
		title: "Business Insider",
		feedUrl: "https://feeds.businessinsider.com/custom/all",
		siteUrl: "https://www.businessinsider.com/",
	},
	{
		id: "feed-fast-company",
		title: "Fast Company",
		feedUrl: "https://www.fastcompany.com/latest/rss?truncated=true",
		siteUrl: "https://www.fastcompany.com/",
	},

	// Science
	{
		id: "feed-scientific-american",
		title: "Scientific American",
		feedUrl: "http://rss.sciam.com/ScientificAmerican-Global",
		siteUrl: "https://www.scientificamerican.com/",
	},
	{
		id: "feed-new-scientist",
		title: "New Scientist",
		feedUrl: "https://www.newscientist.com/feed/home/?cmpid=RSS%7CNSNS-Home",
		siteUrl: "https://www.newscientist.com/",
	},
	{
		id: "feed-phys-org",
		title: "Phys.org",
		feedUrl: "https://phys.org/rss-feed/",
		siteUrl: "https://phys.org/",
	},

	// Politics
	{
		id: "feed-npr-politics",
		title: "NPR » Politics",
		feedUrl: "https://feeds.npr.org/1014/rss.xml",
		siteUrl: "https://www.npr.org/sections/politics/",
	},
	{
		id: "feed-propublica",
		title: "ProPublica",
		feedUrl: "https://www.propublica.org/feeds/propublica/main",
		siteUrl: "https://www.propublica.org/",
	},

	// Finance
	{
		id: "feed-penny-hoarder",
		title: "The Penny Hoarder",
		feedUrl: "https://www.thepennyhoarder.com/rss/",
		siteUrl: "https://www.thepennyhoarder.com/",
	},
	{
		id: "feed-get-rich-slowly",
		title: "Get Rich Slowly",
		feedUrl: "https://www.getrichslowly.org/feed/",
		siteUrl: "https://www.getrichslowly.org/",
	},

	// Cryptocurrency
	{
		id: "feed-cointelegraph",
		title: "Cointelegraph",
		feedUrl: "https://cointelegraph.com/rss",
		siteUrl: "https://cointelegraph.com/",
	},
];

// --- Bookmarks -------------------------------------------------------------
// A dev-tool-flavored set (since that's what you'll actually be clicking
// around in while testing) with a mix of favorite/liked/tags so filtering
// and search have something to chew on.

export const seedBookmarks: NewBookmark[] = [
	{
		id: "bm-github",
		title: "GitHub",
		url: "https://github.com",
		description: "Where the code lives.",
		tags: ["dev", "tools"],
		favorite: true,
	},
	{
		id: "bm-mdn",
		title: "MDN Web Docs",
		url: "https://developer.mozilla.org",
		description: "The web platform reference.",
		tags: ["dev", "docs"],
		liked: true,
	},
	{
		id: "bm-drizzle",
		title: "Drizzle ORM Docs",
		url: "https://orm.drizzle.team",
		description: "TypeScript ORM docs, schema, migrations, drivers.",
		tags: ["dev", "docs", "sqlite"],
		favorite: true,
	},
	{
		id: "bm-tailwind",
		title: "Tailwind CSS Docs",
		url: "https://tailwindcss.com/docs",
		description: "Utility-class reference.",
		tags: ["dev", "css"],
	},
	{
		id: "bm-shadcn",
		title: "shadcn/ui",
		url: "https://ui.shadcn.com",
		description: "Copy-paste component library built on Radix.",
		tags: ["dev", "ui"],
		liked: true,
	},
	{
		id: "bm-expo",
		title: "Expo Documentation",
		url: "https://docs.expo.dev",
		description: "Expo SDK + EAS docs.",
		tags: ["dev", "mobile", "docs"],
	},
	{
		id: "bm-vite",
		title: "Vite",
		url: "https://vitejs.dev",
		description: "Frontend build tool.",
		tags: ["dev", "tools"],
	},
	{
		id: "bm-radix",
		title: "Radix UI",
		url: "https://www.radix-ui.com",
		description: "Unstyled, accessible component primitives.",
		tags: ["dev", "ui"],
	},
	{
		id: "bm-hn",
		title: "Hacker News",
		url: "https://news.ycombinator.com",
		description: "Tech news & discussion.",
		tags: ["news", "dev"],
		favorite: true,
	},
	{
		id: "bm-devto",
		title: "DEV Community",
		url: "https://dev.to",
		description: "Community of software developers.",
		tags: ["dev", "community"],
	},
	{
		id: "bm-css-tricks",
		title: "CSS-Tricks",
		url: "https://css-tricks.com",
		description: "CSS tips, tricks, and techniques.",
		tags: ["dev", "css"],
	},
	{
		id: "bm-zustand",
		title: "Zustand",
		url: "https://zustand-demo.pmnd.rs",
		description: "Small, fast state management for React.",
		tags: ["dev", "react"],
		liked: true,
	},
];

export async function seedDatabase(
	db: any,
	options?: { onlyIfEmpty?: boolean },
) {
	const { onlyIfEmpty = true } = options ?? {};

	if (onlyIfEmpty) {
		const feedCount = await db
			.select({ count: sql<number>`count(*)` })
			.from(feeds)
			.then((rows) => rows[0]?.count ?? 0);
		const bookmarkCount = await db
			.select({ count: sql<number>`count(*)` })
			.from(bookmarks)
			.then((rows) => rows[0]?.count ?? 0);
		if (feedCount > 0 || bookmarkCount > 0) {
			console.log("[Seed] Database already has data, skipping seed.");
			return { seeded: false, feeds: 0, bookmarks: 0 };
		}
	}

	// Merge the dev-tool set (seed-data.ts) with the imported set
	// (seed-data.json). feed_url is unique, so dedupe by it; bookmarks by url.
	const feedRows = dedupeByKey(
		[...seedFeeds, ...jsonFeeds],
		(f) => f.feedUrl ?? f.id,
	);
	const bookmarkRows = dedupeByKey(
		[...seedBookmarks, ...jsonBookmarks],
		(b) => b.url ?? b.id,
	);

	await db.insert(feeds).values(feedRows).onConflictDoNothing();
	await db.insert(bookmarks).values(bookmarkRows).onConflictDoNothing();
	console.log(
		`[Seed] Inserted ${feedRows.length} feeds and ${bookmarkRows.length} bookmarks.`,
	);
	return {
		seeded: true,
		feeds: feedRows.length,
		bookmarks: bookmarkRows.length,
	};
}

function dedupeByKey<T>(rows: T[], keyOf: (row: T) => string): T[] {
	const seen = new Set<string>();
	return rows.filter((row) => {
		const key = keyOf(row);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
