import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CollectionItem {
	id: string;
	name: string;
	parentId: string | null;
	position: number;
}

interface CollectionsState {
	bookmarkCollections: CollectionItem[];
	rssCollections: CollectionItem[];
	setBookmarkCollections: (collections: CollectionItem[]) => void;
	addBookmarkCollection: (name: string) => void;
	removeBookmarkCollection: (id: string) => void;
	addRssCollection: (name: string) => void;
}

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

export const useCollectionsStore = create<CollectionsState>()(
	persist(
		(set, get) => ({
			bookmarkCollections: [
				{ id: "all", name: "All Bookmarks", parentId: null, position: 0 },
				{ id: "inbox", name: "Inbox", parentId: null, position: 1 },
			],
			rssCollections: [
				{ id: "all", name: "All Feeds", parentId: null, position: 0 },
			],
			setBookmarkCollections: (collections) =>
				set(() => ({ bookmarkCollections: collections })),
			addBookmarkCollection: (name) =>
				set((state) => {
					const id = slugify(name);
					if (state.bookmarkCollections.some((c) => c.id === id)) return state;
					return {
						bookmarkCollections: [
							...state.bookmarkCollections,
							{ id, name, parentId: null, position: state.bookmarkCollections.length },
						],
					};
				}),
			removeBookmarkCollection: (id) =>
				set((state) => ({
					bookmarkCollections: state.bookmarkCollections.filter(
						(c) => c.id !== id,
					),
				})),
			addRssCollection: (name) =>
				set((state) => {
					const id = slugify(name);
					if (state.rssCollections.some((c) => c.id === id)) return state;
					return {
						rssCollections: [
							...state.rssCollections,
							{ id, name, parentId: null, position: state.rssCollections.length },
						],
					};
				}),
		}),
		{ 
			name: "collections-store",
		},
	),
);
