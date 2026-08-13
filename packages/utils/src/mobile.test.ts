import { describe, expect, it } from "vitest";

import { parseFeedTitle, parseFeedXml } from "./mobile";

describe("parseFeedXml", () => {
	const FEED_ID = "feed-1";

	it("parses RSS 2.0 items", () => {
		const xml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Tech News</title>
    <item>
      <title>First story</title>
      <link>https://example.com/1</link>
      <description>Summary here</description>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Second story</title>
      <link>https://example.com/2</link>
      <content:encoded><![CDATA[<p>Full <b>body</b></p>]]></content:encoded>
    </item>
  </channel>
</rss>`;

		const out = parseFeedXml(xml, FEED_ID);
		expect(out).toHaveLength(2);
		expect(out[0]).toMatchObject({
			feedId: FEED_ID,
			title: "First story",
			link: "https://example.com/1",
			content: "Summary here",
			contentSnippet: "Summary here",
			read: false,
			liked: false,
			saved: false,
		});
		expect(out[1]?.title).toBe("Second story");
		expect(out[1]?.contentSnippet).toBe("Full body");
	});

	it("parses Atom entries including relative/array links", () => {
		const xml = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Atom post</title>
    <link rel="alternate" href="https://example.com/post" />
    <published>2024-05-01T10:00:00Z</published>
  </entry>
  <entry>
    <title>No link fallback</title>
    <summary>short</summary>
  </entry>
</feed>`;

		const out = parseFeedXml(xml, FEED_ID);
		expect(out).toHaveLength(1);
		expect(out[0]).toMatchObject({
			title: "Atom post",
			link: "https://example.com/post",
		});
		// entry with no usable link is skipped
		expect(out.every((a) => a.link)).toBe(true);
	});

	it("skips malformed XML and returns []", () => {
		expect(parseFeedXml("not xml at all", FEED_ID)).toEqual([]);
	});

	it("derives youtube watch url from yt:videoId", () => {
		const xml = `<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
  <entry>
    <title>video</title>
    <yt:videoId>abc123</yt:videoId>
  </entry>
</feed>`;
		const out = parseFeedXml(xml, FEED_ID);
		expect(out[0]?.link).toBe("https://www.youtube.com/watch?v=abc123");
	});
});

describe("parseFeedTitle", () => {
	it("extracts the channel title", () => {
		const xml = "<rss><channel><title>The Verge</title></channel></rss>";
		expect(parseFeedTitle(xml)).toBe("The Verge");
	});

	it("extracts CDATA-wrapped titles", () => {
		const xml =
			"<rss><channel><title><![CDATA[  Cool Blog  ]]></title></channel></rss>";
		expect(parseFeedTitle(xml)).toBe("Cool Blog");
	});

	it("returns null when no title present", () => {
		expect(parseFeedTitle("<rss></rss>")).toBeNull();
	});
});
