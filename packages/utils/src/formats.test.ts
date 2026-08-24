import { describe, expect, it } from "vitest";

import { detectFormat } from "./formats";

describe("detectFormat", () => {
	it("detects JSON by leading brace", () => {
		expect(detectFormat('{"version":1,"bookmarks":[]}')).toBe("json");
		expect(detectFormat('\n  {"bookmarks":[]}')).toBe("json");
	});

	it("detects OPML regardless of tag case", () => {
		expect(detectFormat('<?xml?><opml version="2.0"></opml>')).toBe("opml");
		expect(detectFormat("<OPML></OPML>")).toBe("opml");
	});

	it("detects Netscape bookmark HTML", () => {
		expect(
			detectFormat(
				'<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<DL><A HREF="https://x">x</A></DL>',
			),
		).toBe("html");
		expect(detectFormat("<html><body><DL><p></p></DL></body></html>")).toBe(
			"html",
		);
	});

	it("detects bare anchor exports as html", () => {
		expect(detectFormat('<A HREF="https://example.com">Example</A>')).toBe(
			"html",
		);
	});

	it("returns unknown for arbitrary content", () => {
		expect(detectFormat("just some random text")).toBe("unknown");
		expect(detectFormat("")).toBe("unknown");
		expect(detectFormat("<div>regular page</div>")).toBe("unknown");
	});
});
