import { describe, expect, it } from "vitest";

import {
	extractBookmarksFromOpml,
	extractFeedsFromOpml,
	generateOpml,
	parseOpml,
} from "./opml";

const SAMPLE_OPML = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>My Subscriptions</title>
  </head>
  <body>
    <outline text="Feeds">
      <outline type="rss" text="TechCrunch" xmlUrl="https://techcrunch.com/feed/" htmlUrl="https://techcrunch.com"/>
      <outline type="rss" text="Hacker News" xmlUrl="https://hnrss.org/frontpage" htmlUrl="https://news.ycombinator.com"/>
    </outline>
    <outline text="Reading">
      <outline type="link" text="A Great Post" url="https://example.com/post" description="Worth a read" category="dev,rust"/>
    </outline>
  </body>
</opml>`;

describe("parseOpml", () => {
	it("parses the head title and nested outlines", () => {
		const doc = parseOpml(SAMPLE_OPML);
		expect(doc.title).toBe("My Subscriptions");
		expect(doc.outlines).toHaveLength(2);
		expect(doc.outlines[0]?.text).toBe("Feeds");
		expect(doc.outlines[0]?.outline).toHaveLength(2);
	});

	it("returns empty outlines for documents without an opml body", () => {
		expect(parseOpml("<not-opml/>").outlines).toEqual([]);
	});
});

describe("extractFeedsFromOpml", () => {
	it("flattens feeds nested inside folders", () => {
		const feeds = extractFeedsFromOpml(parseOpml(SAMPLE_OPML));
		expect(feeds).toEqual([
			{
				title: "TechCrunch",
				feedUrl: "https://techcrunch.com/feed/",
				siteUrl: "https://techcrunch.com",
			},
			{
				title: "Hacker News",
				feedUrl: "https://hnrss.org/frontpage",
				siteUrl: "https://news.ycombinator.com",
			},
		]);
	});

	it("falls back through title, text and url for the feed name", () => {
		const doc = parseOpml(
			'<opml><body><outline type="rss" xmlUrl="https://x.example/rss"/></body></opml>',
		);
		const feeds = extractFeedsFromOpml(doc);
		expect(feeds[0]).toMatchObject({
			title: "https://x.example/rss",
			feedUrl: "https://x.example/rss",
		});
	});
});

describe("extractBookmarksFromOpml", () => {
	it("extracts bookmarks with description and tags from category", () => {
		const bookmarks = extractBookmarksFromOpml(parseOpml(SAMPLE_OPML));
		expect(bookmarks).toHaveLength(1);
		expect(bookmarks[0]).toEqual({
			title: "A Great Post",
			url: "https://example.com/post",
			description: "Worth a read",
			tags: ["dev", "rust"],
		});
	});

	it("has no tags when category is absent", () => {
		const doc = parseOpml(
			'<opml><body><outline type="link" text="X" url="https://x.example"/></body></opml>',
		);
		expect(extractBookmarksFromOpml(doc)[0]?.tags).toBeUndefined();
	});
});

describe("generateOpml round-trip", () => {
	it("round-trips feeds and bookmarks through parse + extract", () => {
		const xml = generateOpml({
			title: "Export",
			feeds: [
				{
					title: "XKCD",
					feedUrl: "https://xkcd.com/atom.xml",
					siteUrl: "https://xkcd.com",
				},
			],
			bookmarks: [
				{
					title: "Rust",
					url: "https://rust-lang.org",
					description: "systems language",
				},
			],
		});

		const doc = parseOpml(xml);
		expect(extractFeedsFromOpml(doc)).toEqual([
			{
				title: "XKCD",
				feedUrl: "https://xkcd.com/atom.xml",
				siteUrl: "https://xkcd.com",
			},
		]);
		expect(extractBookmarksFromOpml(doc)[0]).toMatchObject({
			title: "Rust",
			url: "https://rust-lang.org",
			description: "systems language",
		});
	});

	it("escapes XML-special characters so they survive a round-trip", () => {
		const xml = generateOpml({
			bookmarks: [{ title: "A & B <tag>", url: "https://e.example/?a=1&b=2" }],
		});
		const bookmarks = extractBookmarksFromOpml(parseOpml(xml));
		expect(bookmarks[0]?.title).toBe("A & B <tag>");
		expect(bookmarks[0]?.url).toBe("https://e.example/?a=1&b=2");
	});

	it("uses a default title when none is provided", () => {
		expect(generateOpml({})).toContain("ReadrSync Export");
	});
});
