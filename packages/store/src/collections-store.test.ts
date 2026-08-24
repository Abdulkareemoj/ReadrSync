import { beforeEach, describe, expect, it } from "vitest";

import { useCollectionsStore } from "./collections-store";

const defaultBookmarkCollections = [
	{ id: "all", name: "All Bookmarks", parentId: null, position: 0 },
	{ id: "inbox", name: "Inbox", parentId: null, position: 1 },
];

const defaultRssCollections = [
	{ id: "all", name: "All Feeds", parentId: null, position: 0 },
];

beforeEach(() => {
	localStorage.clear();
	useCollectionsStore.setState({
		bookmarkCollections: [...defaultBookmarkCollections],
		rssCollections: [...defaultRssCollections],
	});
});

describe("useCollectionsStore", () => {
	it("starts with virtual all/inbox collections", () => {
		const state = useCollectionsStore.getState();
		expect(state.bookmarkCollections.map((c) => c.id)).toEqual([
			"all",
			"inbox",
		]);
		expect(state.rssCollections.map((c) => c.id)).toEqual(["all"]);
	});

	it("slugifies new collection names", () => {
		useCollectionsStore.getState().addBookmarkCollection("My Cool Tags!");

		const added = useCollectionsStore
			.getState()
			.bookmarkCollections.find((c) => c.name === "My Cool Tags!");
		expect(added).toMatchObject({
			id: "my-cool-tags",
			parentId: null,
			position: 2,
		});
	});

	it("does not create duplicates for names with the same slug", () => {
		const { addBookmarkCollection } = useCollectionsStore.getState();
		addBookmarkCollection("Work");
		addBookmarkCollection("work!!");

		const work = useCollectionsStore
			.getState()
			.bookmarkCollections.filter((c) => c.id === "work");
		expect(work).toHaveLength(1);
		expect(work[0]?.name).toBe("Work");
	});

	it("removes collections by id", () => {
		useCollectionsStore.getState().addBookmarkCollection("Temp");
		expect(
			useCollectionsStore
				.getState()
				.bookmarkCollections.some((c) => c.id === "temp"),
		).toBe(true);

		useCollectionsStore.getState().removeBookmarkCollection("temp");
		expect(
			useCollectionsStore
				.getState()
				.bookmarkCollections.some((c) => c.id === "temp"),
		).toBe(false);
	});

	it("setBookmarkCollections replaces the whole list and preserves positions", () => {
		useCollectionsStore.getState().setBookmarkCollections([
			{ id: "a", name: "A", parentId: null, position: 0 },
			{ id: "b", name: "B", parentId: "a", position: 1 },
		]);

		expect(useCollectionsStore.getState().bookmarkCollections).toEqual([
			{ id: "a", name: "A", parentId: null, position: 0 },
			{ id: "b", name: "B", parentId: "a", position: 1 },
		]);
	});

	it("adds rss collections without touching bookmark ones", () => {
		useCollectionsStore.getState().addRssCollection("News");

		const state = useCollectionsStore.getState();
		expect(state.rssCollections.map((c) => c.id)).toEqual(["all", "news"]);
		expect(state.bookmarkCollections.map((c) => c.id)).toEqual([
			"all",
			"inbox",
		]);
	});

	it("persists state to localStorage under its storage key", () => {
		useCollectionsStore.getState().addBookmarkCollection("Persisted");

		const raw = localStorage.getItem("collections-store");
		expect(raw).toBeTruthy();
		expect(raw).toContain("persisted");
	});
});
