import { describe, expect, it } from "vitest";

import { mockArticles, mockFeeds } from "./mock-rss-data";

describe("mock rss data integrity", () => {
	it("has unique feed ids", () => {
		const ids = mockFeeds.map((f) => f.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("has unique article ids", () => {
		const ids = mockArticles.map((a) => a.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("references an existing feed from every article", () => {
		const feedIds = new Set(mockFeeds.map((f) => f.id));
		for (const article of mockArticles) {
			expect(feedIds.has(article.feedId)).toBe(true);
		}
	});

	it("carries required metadata on every article", () => {
		for (const article of mockArticles) {
			expect(article.title.length).toBeGreaterThan(0);
			expect(article.link.startsWith("https://")).toBe(true);
			expect(typeof article.lastUpdatedAt).toBe("string");
		}
	});

	it("has parseable pubDates", () => {
		for (const article of mockArticles) {
			expect(Number.isNaN(Date.parse(article.pubDate ?? ""))).toBe(false);
		}
	});
});
