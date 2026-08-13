import { describe, expect, it, vi } from "vitest";

import { createFeedDiscoverer, discoverFeedsFromHtml } from "./feed-discovery";

describe("discoverFeedsFromHtml", () => {
	it("extracts RSS/Atom/JSON alternate links", () => {
		const html = `<html><head>
  <link rel="alternate" type="application/rss+xml" title="RSS" href="/feed.xml">
  <link rel="alternate" type="application/atom+xml" title="Atom" href="https://site.com/atom">
  <link rel="alternate" type="application/feed+json" href="/feed.json">
  <link rel="stylesheet" href="/styles.css">
</head></html>`;

		const feeds = discoverFeedsFromHtml(html, "https://site.com/blog/");
		expect(feeds).toEqual([
			{ title: "RSS", url: "https://site.com/feed.xml", type: "rss" },
			{ title: "Atom", url: "https://site.com/atom", type: "atom" },
			{
				title: "https://site.com/feed.json",
				url: "https://site.com/feed.json",
				type: "json",
			},
		]);
	});

	it("resolves relative hrefs against the base url", () => {
		const html = `<link rel="alternate" type="application/rss+xml" href="rss">`;
		const feeds = discoverFeedsFromHtml(html, "https://example.com/");
		expect(feeds[0]?.url).toBe("https://example.com/rss");
	});

	it("falls back to loose detection for untyped feed-looking links", () => {
		const html = `<link rel="alternate" href="https://site.com/index.xml">`;
		const feeds = discoverFeedsFromHtml(html, "https://site.com");
		expect(feeds[0]).toMatchObject({
			url: "https://site.com/index.xml",
			type: "rss",
		});
	});

	it("ignores non-feed links and dedupes urls", () => {
		const html = `<link rel="alternate" type="application/rss+xml" href="https://a.com/feed">
  <link rel="alternate" type="application/rss+xml" href="https://a.com/feed">
  <link rel="canonical" href="https://a.com/">`;
		const feeds = discoverFeedsFromHtml(html, "https://a.com");
		expect(feeds).toHaveLength(1);
	});

	it("returns [] for empty or unrelated html", () => {
		expect(discoverFeedsFromHtml("", "https://a.com")).toEqual([]);
		expect(discoverFeedsFromHtml("<p>hello</p>", "https://a.com")).toEqual([]);
	});
});

describe("createFeedDiscoverer", () => {
	it("normalizes input and delegates to the fetcher", async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValue(
				'<link rel="alternate" type="application/rss+xml" href="https://a.com/feed">',
			);
		const discover = createFeedDiscoverer(fetcher);

		const feeds = await discover("a.com");
		expect(feeds).toHaveLength(1);
		expect(fetcher).toHaveBeenCalledWith("https://a.com");
	});

	it("returns [] for blank input without calling the fetcher", async () => {
		const fetcher = vi.fn();
		const discover = createFeedDiscoverer(fetcher);
		await expect(discover("   ")).resolves.toEqual([]);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it("propagates fetcher failures", async () => {
		const fetcher = vi.fn().mockRejectedValue(new Error("network down"));
		const discover = createFeedDiscoverer(fetcher);
		await expect(discover("https://a.com")).rejects.toThrow("network down");
	});
});
