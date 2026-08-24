import { beforeEach, describe, expect, it } from "vitest";

import { useSettingsStore } from "./settings-store";

const defaults = {
	theme: "system" as const,
	readerFontSize: "md" as const,
	syncProvider: "none" as const,
	syncStatus: "idle" as const,
	lastSyncedAt: null,
	isAuthenticated: false,
	authProvider: "none" as const,
	authEmail: null,
	youtubeApiKey: "",
};

beforeEach(() => {
	localStorage.clear();
	useSettingsStore.setState({ ...defaults });
});

describe("useSettingsStore", () => {
	it("starts with sensible defaults", () => {
		const state = useSettingsStore.getState();
		expect(state.theme).toBe("system");
		expect(state.readerFontSize).toBe("md");
		expect(state.syncStatus).toBe("idle");
		expect(state.isAuthenticated).toBe(false);
		expect(state.youtubeApiKey).toBe("");
	});

	it("setTheme updates the theme", () => {
		useSettingsStore.getState().setTheme("dark");
		expect(useSettingsStore.getState().theme).toBe("dark");
	});

	it("setReaderFontSize accepts only sm/md/lg", () => {
		useSettingsStore.getState().setReaderFontSize("lg");
		expect(useSettingsStore.getState().readerFontSize).toBe("lg");
	});

	it("setSyncStatus tracks sync lifecycle", () => {
		const { setSyncStatus } = useSettingsStore.getState();
		setSyncStatus("syncing");
		expect(useSettingsStore.getState().syncStatus).toBe("syncing");
		setSyncStatus("connected");
		expect(useSettingsStore.getState().syncStatus).toBe("connected");
		setSyncStatus("error");
		expect(useSettingsStore.getState().syncStatus).toBe("error");
	});

	it("setLastSyncedAt records the timestamp", () => {
		useSettingsStore.getState().setLastSyncedAt("2026-08-24T00:00:00.000Z");
		expect(useSettingsStore.getState().lastSyncedAt).toBe(
			"2026-08-24T00:00:00.000Z",
		);
	});

	it("setAuth stores provider identity and clearAuth resets it", () => {
		useSettingsStore.getState().setAuth({
			isAuthenticated: true,
			provider: "gdrive",
			email: "reader@example.com",
		});

		let state = useSettingsStore.getState();
		expect(state.isAuthenticated).toBe(true);
		expect(state.authProvider).toBe("gdrive");
		expect(state.authEmail).toBe("reader@example.com");

		state.clearAuth();
		state = useSettingsStore.getState();
		expect(state.isAuthenticated).toBe(false);
		expect(state.authProvider).toBe("none");
		expect(state.authEmail).toBeNull();
	});

	it("setYoutubeApiKey stores and clears the key", () => {
		useSettingsStore.getState().setYoutubeApiKey("yt-secret");
		expect(useSettingsStore.getState().youtubeApiKey).toBe("yt-secret");

		useSettingsStore.getState().setYoutubeApiKey("");
		expect(useSettingsStore.getState().youtubeApiKey).toBe("");
	});
});
