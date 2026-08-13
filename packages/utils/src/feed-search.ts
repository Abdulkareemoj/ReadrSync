// Live feed search: keyword → sources (Google News RSS) → feed URLs (feedsearch.dev).
// Replaces the hard-coded feed directory with genuinely live discovery.

export interface SearchedFeed {
	name: string;
	description: string;
	url: string;
	category: string;
	icon: string;
	favicon?: string;
	siteUrl?: string;
}

function googleNewsUrl(keyword: string): string {
	return `https://news.google.com/rss/search?q=${encodeURIComponent(
		keyword,
	)}&hl=en-US&gl=US&ceid=US:en`;
}

function feedsearchUrl(domain: string): string {
	return `https://feedsearch.dev/api/v1/search?url=${encodeURIComponent(
		domain,
	)}&info=true&skip_crawl=true`;
}

// Parse <source url="...">Site Name</source> entries from Google News RSS.
function extractSources(xml: string): { name: string; domain: string }[] {
	const sources: { name: string; domain: string }[] = [];
	const re = /<source[^>]*url=["']([^"']+)["'][^>]*>([\s\S]*?)<\/source>/gi;
	for (const match of xml.matchAll(re)) {
		const rawUrl = match[1];
		const name = (match[2] ?? "").replace(/<[^>]*>/g, "").trim();
		if (!rawUrl || !name) continue;
		let domain = rawUrl;
		try {
			domain = new URL(rawUrl).hostname.replace(/^www\./, "");
		} catch {
			continue;
		}
		if (domain) sources.push({ name, domain });
	}
	return sources;
}

interface FeedsearchResult {
	url?: string;
	title?: string;
	site_name?: string;
	site_url?: string;
	description?: string;
	favicon?: string;
	version?: string;
	velocity?: number;
}

function normalizeFeed(
	raw: FeedsearchResult,
	source: { name: string; domain: string },
): SearchedFeed | null {
	const url = raw.url?.trim();
	if (!url) return null;

	const version = (raw.version ?? "").toLowerCase();
	let category = "RSS";
	if (version.includes("atom")) category = "ATOM";
	else if (version.includes("json")) category = "JSON";

	return {
		name: raw.title?.trim() || raw.site_name?.trim() || source.name,
		description:
			raw.description?.trim() || raw.site_url?.trim() || source.domain,
		url,
		category,
		icon: category === "ATOM" ? "📄" : "📡",
		favicon: raw.favicon || undefined,
		siteUrl: raw.site_url || undefined,
		velocity: raw.velocity,
	} as SearchedFeed;
}

export function createFeedSearcher(fetcher: (url: string) => Promise<string>) {
	return async function searchFeedsByKeyword(
		keyword: string,
		options?: { maxSources?: number; maxResults?: number },
	): Promise<SearchedFeed[]> {
		const maxSources = options?.maxSources ?? 6;
		const maxResults = options?.maxResults ?? 12;
		const query = keyword.trim();
		if (!query) return [];

		const xml = await fetcher(googleNewsUrl(query));

		const domains: { name: string; domain: string }[] = [];
		const seenDomains = new Set<string>();
		for (const s of extractSources(xml)) {
			if (seenDomains.has(s.domain)) continue;
			seenDomains.add(s.domain);
			domains.push(s);
			if (domains.length >= maxSources) break;
		}
		if (domains.length === 0) return [];

		const settled = await Promise.allSettled(
			domains.map(async (source) => {
				const rawText = await fetcher(feedsearchUrl(source.domain));
				const parsed: unknown = JSON.parse(rawText);
				if (!Array.isArray(parsed)) return [];
				return parsed
					.map((f) => normalizeFeed(f as FeedsearchResult, source))
					.filter((f): f is SearchedFeed => f !== null);
			}),
		);

		const feeds: SearchedFeed[] = [];
		const seenUrls = new Set<string>();
		for (const result of settled) {
			if (result.status !== "fulfilled") continue;
			for (const feed of result.value) {
				if (seenUrls.has(feed.url)) continue;
				seenUrls.add(feed.url);
				feeds.push(feed);
				if (feeds.length >= maxResults) break;
			}
			if (feeds.length >= maxResults) break;
		}

		return feeds;
	};
}
