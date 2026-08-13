// Feed auto-discovery: given a site URL, fetch the page and extract its RSS/Atom
// <link rel="alternate"> tags so users can subscribe without pasting a feed URL.

export interface DiscoveredFeed {
	title: string;
	url: string;
	type: "rss" | "atom" | "json";
}

const FEED_TYPE_MAP: Record<string, "rss" | "atom" | "json"> = {
	"application/rss+xml": "rss",
	"application/atom+xml": "atom",
	"application/feed+json": "json",
};

const LINK_TAG_RE = /<link\b[^>]*>/gi;

function getAttr(tag: string, name: string): string | null {
	const match = tag.match(
		new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"),
	);
	return match ? match[1] : null;
}

function normalizeUrl(input: string): string {
	const trimmed = input.trim();
	if (!trimmed) return "";
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	return `https://${trimmed}`;
}

function resolveUrl(href: string, baseUrl: string): string | null {
	try {
		return new URL(href, baseUrl).toString();
	} catch {
		return null;
	}
}

/**
 * Extract RSS/Atom/JSON feed <link> tags from a page's HTML.
 * Relative hrefs are resolved against `baseUrl`.
 */
export function discoverFeedsFromHtml(
	html: string,
	baseUrl: string,
): DiscoveredFeed[] {
	const results: DiscoveredFeed[] = [];
	const seen = new Set<string>();

	for (const match of html.matchAll(LINK_TAG_RE)) {
		const tag = match[0];
		const rel = (getAttr(tag, "rel") ?? "").toLowerCase();
		if (!rel.split(/\s+/).includes("alternate")) continue;

		const type = (getAttr(tag, "type") ?? "").toLowerCase();
		const kind = FEED_TYPE_MAP[type] ?? null;

		// Loose fallback: some sites omit a proper feed mime type but name the
		// file with a feed extension.
		const hrefAttr = getAttr(tag, "href") ?? "";
		const looksLikeFeed = /\.(rss|atom|xml|json)(\?|$)/i.test(hrefAttr);
		if (!kind && !looksLikeFeed) continue;
		const resolvedType =
			kind ?? (hrefAttr.toLowerCase().includes("atom") ? "atom" : "rss");

		const resolved = resolveUrl(hrefAttr, baseUrl);
		if (!resolved || seen.has(resolved)) continue;
		seen.add(resolved);

		results.push({
			title: getAttr(tag, "title") ?? resolved,
			url: resolved,
			type: resolvedType,
		});
	}

	return results;
}

export function createFeedDiscoverer(
	fetcher: (url: string) => Promise<string>,
) {
	return async function discoverFeedsFromUrl(
		input: string,
	): Promise<DiscoveredFeed[]> {
		const url = normalizeUrl(input);
		if (!url) return [];

		const html = await fetcher(url);
		return discoverFeedsFromHtml(html, url);
	};
}
