import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveYouTubeHandle } from "./youtube";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("resolveYouTubeHandle", () => {
	it("uses the official Data API v3 first when an API key is set", async () => {
		const fetchMock = vi.fn(async (url: unknown) => {
			const u = String(url);
			if (u.includes("youtube.googleapis.com/youtube/v3/channels")) {
				expect(u).toContain("forHandle=%40handle1");
				expect(u).toContain("key=test-key");
				return {
					ok: true,
					status: 200,
					json: async () => ({ items: [{ id: "UC123" }] }),
				};
			}
			throw new Error(`unexpected fetch: ${u}`);
		});
		vi.stubGlobal("fetch", fetchMock);

		const id = await resolveYouTubeHandle("@handle1", "test-key");

		expect(id).toBe("UC123");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("falls back to keyless resolvers when the Data API yields nothing", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async (url: unknown) => {
				const u = String(url);
				if (u.includes("youtube.googleapis.com"))
					return {
						ok: true,
						status: 200,
						json: async () => ({ items: [] }),
					};
				if (u.includes("youtubei/v1/navigation/resolve_url"))
					return {
						ok: true,
						status: 200,
						json: async () => ({
							endpoint: { browseEndpoint: { browseId: "UC456" } },
						}),
					};
				throw new Error(`unexpected fetch: ${u}`);
			}),
		);

		const id = await resolveYouTubeHandle("handle2", "test-key");

		expect(id).toBe("UC456");
	});

	it("returns null for empty handles without fetching", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		expect(await resolveYouTubeHandle("@", "key")).toBeNull();
		expect(await resolveYouTubeHandle("   ", "key")).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
