import { describe, expect, it, vi } from "vitest";

import { createFeedSearcher, type SearchedFeed } from "./feed-search";

const SOURCE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Article one</title>
      <link>https://news.google.com/rss/articles/x</link>
      <source url="https://www.theverge.com">The Verge</source>
    </item>
    <item>
      <title>Article two</title>
      <link>https://news.google.com/rss/articles/y</link>
      <source url="https://theverge.com">The Verge</source>
    </item>
    <item>
      <title>Article three</title>
      <link>https://news.google.com/rss/articles/z</link>
      <source url="https://www.physo.org">Phys Org</source>
    </item>
  </channel>
</rss>`;

const FEEDSEARCH_BODY = JSON.stringify([
	{
		url: "https://www.theverge.com/rss/index.xml",
		title: "The Verge",
		site_name: "The Verge",
		site_url: "https://www.theverge.com/",
		description: "Technology news.",
		favicon: "https://theverge.com/favicon.ico",
		version: "rss20",
	},
	{
		url: "https://phys.org/rss-feed/",
		title: "Phys.org",
		site_url: "https://phys.org/",
		description: "Science news.",
		version: "rss20",
	},
]);

describe("createFeedSearcher", () => {
	it("returns [] for empty or whitespace-only keyword", async () => {
		const searcher = createFeedSearcher(vi.fn());
		await expect(searcher("   ")).resolves.toEqual([]);
		await expect(searcher("")).resolves.toEqual([]);
	});

	it("returns [] when no sources can be extracted", async () => {
		const fetcher = vi.fn().mockResolvedValue("<rss><channel></channel></rss>");
		const searcher = createFeedSearcher(fetcher);
		await expect(searcher("cooking")).resolves.toEqual([]);
	});

	it("resolves domains to feeds and dedupes by url", async () => {
		const fetcher = vi.fn((url: string) => {
			if (url.startsWith("https://news.google.com")) {
				return Promise.resolve(SOURCE_XML);
			}
			return Promise.resolve(FEEDSEARCH_BODY);
		});

		const searcher = createFeedSearcher(fetcher);
		const results = await searcher("tech");

		expect(results).toHaveLength(2);
		expect(results.map((r) => r.url)).toEqual([
			"https://www.theverge.com/rss/index.xml",
			"https://phys.org/rss-feed/",
		]);
		// both sources map to the same domain "theverge.com" → deduped to one call
		expect(fetcher).toHaveBeenCalledWith(
			"https://feedsearch.dev/api/v1/search?url=theverge.com&info=true&skip_crawl=true",
		);
		expect(fetcher).toHaveBeenCalledWith(
			"https://feedsearch.dev/api/v1/search?url=physo.org&info=true&skip_crawl=true",
		);
	});

	it("normalizes feed metadata and category", async () => {
		const fetcher = vi.fn((url: string) => {
			if (url.startsWith("https://news.google.com")) {
				return Promise.resolve(SOURCE_XML);
			}
			return Promise.resolve(
				JSON.stringify([
					{
						url: "https://feeds.acast.com/tech",
						title: "Tech Weekly",
						site_url: "https://acast.com/",
						version: "atom10",
					},
				]),
			);
		});

		const searcher = createFeedSearcher(fetcher);
		const [feed] = await searcher("podcast");

		expect(feed).toMatchObject<SearchedFeed>({
			name: "Tech Weekly",
			description: "https://acast.com/",
			url: "https://feeds.acast.com/tech",
			category: "ATOM",
			icon: "📄",
		});
	});

	it("skips entries without a url and failed feedsearch responses", async () => {
		const fetcher = vi.fn((url: string) => {
			if (url.startsWith("https://news.google.com")) {
				return Promise.resolve(SOURCE_XML);
			}
			if (url.includes("physo.org")) {
				return Promise.reject(new Error("network down"));
			}
			return Promise.resolve(
				JSON.stringify([
					{ site_name: "No URL here" },
					{ url: "https://valid.com/rss", title: "Valid" },
				]),
			);
		});

		const searcher = createFeedSearcher(fetcher);
		const results = await searcher("tech");

		expect(results).toHaveLength(1);
		expect(results[0]?.url).toBe("https://valid.com/rss");
	});

	it("respects maxSources and maxResults", async () => {
		const fetcher = vi.fn((url: string) => {
			if (url.startsWith("https://news.google.com")) {
				return Promise.resolve(SOURCE_XML);
			}
			return Promise.resolve(FEEDSEARCH_BODY);
		});

		const searcher = createFeedSearcher(fetcher);
		const results = await searcher("tech", { maxSources: 1, maxResults: 1 });

		expect(results).toHaveLength(1);
		expect(results[0]?.name).toBe("The Verge");
	});
});
