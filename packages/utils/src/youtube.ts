export interface YouTubeChannelResult {
	feedUrl: string;
	title: string;
	requiresChannelId?: boolean;
}

function normalizeYouTubeUrl(input: string): string | null {
	const trimmed = input.trim();
	if (!trimmed) return null;

	if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
		try {
			const url = new URL(trimmed);
			if (
				url.hostname === "youtube.com" ||
				url.hostname === "www.youtube.com" ||
				url.hostname === "m.youtube.com" ||
				url.hostname === "youtu.be"
			) {
				return trimmed;
			}
		} catch {
			return null;
		}
		return null;
	}

	if (trimmed.startsWith("@") || trimmed.startsWith("UC")) {
		return `https://www.youtube.com/${trimmed}`;
	}

	if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
		return `https://${trimmed}`;
	}

	return null;
}

export function parseYouTubeChannelUrl(input: string): {
	normalizedUrl: string | null;
	isValid: boolean;
} {
	const normalized = normalizeYouTubeUrl(input);
	return {
		normalizedUrl: normalized,
		isValid: normalized !== null,
	};
}

/**
 * Build a YouTube RSS feed URL from a normalized channel URL.
 *
 * - /channel/UCxxxxx → ?channel_id=UCxxxxx (always works)
 * - /@handle → ?user=handle (works when handle matches legacy username)
 * - /c/name, /user/name → ?user=name
 *
 * For handles without a legacy username, ?user= returns 404.
 * In that case the caller should tell the user to use the /channel/UC... URL format.
 */
function buildFeedUrl(
	normalized: string,
): { feedUrl: string; isChannelId: boolean } | null {
	try {
		const url = new URL(normalized);
		const parts = url.pathname.split("/").filter(Boolean);
		if (!parts.length) return null;

		const first = parts[0];
		if (!first) return null;

		if (first === "channel" && parts[1]?.startsWith("UC")) {
			return {
				feedUrl: `https://www.youtube.com/feeds/videos.xml?channel_id=${parts[1]}`,
				isChannelId: true,
			};
		}

		if (first.startsWith("@")) {
			return {
				feedUrl: `https://www.youtube.com/feeds/videos.xml?user=${first.slice(1)}`,
				isChannelId: false,
			};
		}

		if (first === "c" || first === "user") {
			return {
				feedUrl: `https://www.youtube.com/feeds/videos.xml?user=${parts[1] ?? first}`,
				isChannelId: false,
			};
		}

		return {
			feedUrl: `https://www.youtube.com/feeds/videos.xml?user=${first}`,
			isChannelId: false,
		};
	} catch {
		return null;
	}
}

/**
 * Resolve a YouTube handle to a channel ID by fetching the channel page and
 * extracting the channelId from the initial data script.
 *
 * Works on platforms without CORS restrictions (React Native, Tauri Rust backend).
 * Will fail in browsers due to CORS – use platform-specific resolvers instead.
 */
const YOUTUBE_UA =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchChannelPage(url: string): Promise<string | null> {
	const res = await fetch(url, {
		headers: {
			"User-Agent": YOUTUBE_UA,
			Accept: "text/html,application/xhtml+xml",
		},
	});
	if (!res.ok) return null;
	return await res.text();
}

function extractChannelId(html: string): string | null {
	// "channelId":"UC..."
	const match = html.match(/"channelId":"(UC[\w-]{22,})"/);
	return match?.[1] ?? null;
}

/**
 * Resolve a YouTube handle to a channel ID via YouTube's internal
 * InnerTube API (the same one the website uses). This works without
 * any API key but relies on an embedded client key that Google could
 * change or restrict at any time.
 */
const YT_INNER_TUBE_KEY = "A8eiZC0e7g6k1v5x9z5y6z7x8y9z0a1b2c3d4e5f6"; // Example key, replace with actual, this is just gibberish

async function resolveViaInnerTube(handle: string): Promise<string | null> {
	try {
		const res = await fetch(
			`https://www.youtube.com/youtubei/v1/navigation/resolve_url?key=${YT_INNER_TUBE_KEY}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"User-Agent": YOUTUBE_UA,
					Origin: "https://www.youtube.com",
					"X-YouTube-Client-Name": "1",
					"X-YouTube-Client-Version": "2.20240101",
				},
				body: JSON.stringify({
					url: `https://www.youtube.com/@${handle}`,
					context: {
						client: {
							clientName: "WEB",
							clientVersion: "2.20240101",
							hl: "en",
							gl: "US",
						},
					},
				}),
			},
		);
		if (!res.ok) return null;
		const data: any = await res.json();
		// Response shape: { endpoint: { browseEndpoint: { browseId: "UC..." } } }
		return data?.endpoint?.browseEndpoint?.browseId ?? null;
	} catch {
		return null;
	}
}

/**
 * Official YouTube Data API v3 path (1 quota unit/call, 10k free daily).
 * Works in browsers — the endpoint is CORS-enabled.
 */
async function resolveViaDataApi(
	handle: string,
	apiKey: string,
): Promise<string | null> {
	try {
		const params = new URLSearchParams({
			part: "id",
			forHandle: `@${handle}`,
			key: apiKey,
		});
		const res = await fetch(
			`https://youtube.googleapis.com/youtube/v3/channels?${params}`,
		);
		if (!res.ok) return null;
		const data: any = await res.json();
		return data?.items?.[0]?.id ?? null;
	} catch {
		return null;
	}
}

/**
 * Resolve a YouTube handle to a channel ID. When an API key is configured
 * (Settings → YouTube), the official Data API v3 is tried first; otherwise
 * (and as fallback) the keyless InnerTube/scraping chain below runs.
 */
export async function resolveYouTubeHandle(
	handle: string,
	apiKey?: string,
): Promise<string | null> {
	const cleanHandle = handle.replace(/^@/, "").trim();
	if (!cleanHandle) return null;

	// Official YouTube Data API v3 when the user configured a key
	if (apiKey?.trim()) {
		const id = await resolveViaDataApi(cleanHandle, apiKey.trim());
		if (id) return id;
	}

	// Try YouTube's internal API (JSON endpoint, less likely to be blocked)
	try {
		const id = await resolveViaInnerTube(cleanHandle);
		if (id) return id;
	} catch {
		// fall through
	}

	const url = `https://www.youtube.com/@${cleanHandle}`;

	// Direct fetch (Rust)
	try {
		const html = await fetchChannelPage(url);
		if (html) {
			const id = extractChannelId(html);
			if (id) return id;
		}
	} catch {
		// fall through
	}

	// Via CORS proxy
	for (const proxy of [
		"https://corsproxy.io/?",
		"https://api.allorigins.win/raw?url=",
	]) {
		try {
			const html = await fetchChannelPage(proxy + encodeURIComponent(url));
			if (html) {
				const id = extractChannelId(html);
				if (id) return id;
			}
		} catch {
			// try next proxy
		}
	}

	return null;
}

/**
 * Extract the bare handle/username from a YouTube URL.
 * Returns null if the URL doesn't contain a resolvable name.
 */
export function extractYouTubeHandle(normalizedUrl: string): string | null {
	try {
		const url = new URL(normalizedUrl);
		const parts = url.pathname.split("/").filter(Boolean);
		if (!parts.length) return null;

		const first = parts[0];
		if (!first) return null;
		if (first.startsWith("@")) return first.slice(1);
		if (first === "c" || first === "user") return parts[1] ?? null;

		return first;
	} catch {
		return null;
	}
}

export async function discoverYouTubeChannelFeed(
	channelUrl: string,
): Promise<YouTubeChannelResult | null> {
	try {
		const normalized = normalizeYouTubeUrl(channelUrl);
		if (!normalized) return null;

		const result = buildFeedUrl(normalized);
		if (!result) return null;

		const url = new URL(normalized);
		const parts = url.pathname.split("/").filter(Boolean);

		let title: string;
		if (parts[0] === "channel" && parts[1]?.startsWith("UC")) {
			title = "YouTube Channel";
		} else {
			const nameFromUrl = parts[0]?.startsWith("@")
				? parts[0].slice(1)
				: (parts[1] ?? parts[0] ?? "YouTube Channel");
			title = nameFromUrl
				.replace(/[-_]/g, " ")
				.replace(/\b\w/g, (c) => c.toUpperCase());
		}

		return {
			feedUrl: result.feedUrl,
			title,
			requiresChannelId: !result.isChannelId,
		};
	} catch {
		return null;
	}
}
