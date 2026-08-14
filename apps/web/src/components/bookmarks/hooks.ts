import { useCollectionsStore } from "@packages/store";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useReaderStore } from "@/lib/store";

type ViewMode = "list" | "grid";

export function useBookmarksPage(filter: string, tagsParam: string) {
	const navigate = useNavigate();
	const bookmarksData = useBookmarks(filter);
	const { bookmarks, removeBookmark, toggleLike, toggleSave, addBookmark } =
		bookmarksData;
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [editingBookmark, setEditingBookmark] = useState<string | null>(null);

	const { bookmarkAgent } = useReaderStore((state) => state);
	const { bookmarkCollections } = useCollectionsStore();

	const handleEdit = (id: string) => setEditingBookmark(id);
	const handleCloseEdit = () => setEditingBookmark(null);

	const handleMove = (id: string, collectionId: string) => {
		void bookmarkAgent.updateBookmark(id, { collectionId });
	};

	const handleLike = (id: string) => toggleLike(id);
	const handleSave = (id: string) => toggleSave(id);
	const handleDelete = (id: string) => removeBookmark(id);

	const currentCollectionName = useMemo(() => {
		if (!filter || filter === "all") return "All Bookmarks";
		const collection = bookmarkCollections.find((c: any) => c.id === filter);
		return collection?.name || "Collection";
	}, [bookmarks, filter, bookmarkCollections]);

	const selectedTags = useMemo(() => {
		if (!tagsParam) return [];
		return tagsParam.split(",").filter(Boolean);
	}, [tagsParam]);

	const allTags = useMemo(() => {
		const tagSet = new Set<string>();
		bookmarks.forEach((b) => {
			if (b.tags && Array.isArray(b.tags)) {
				b.tags.forEach((t) => {
					tagSet.add(t);
				});
			}
		});
		return Array.from(tagSet).sort();
	}, [bookmarks]);

	const tagCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		bookmarks.forEach((b) => {
			if (b.tags && Array.isArray(b.tags)) {
				b.tags.forEach((t) => {
					counts[t] = (counts[t] || 0) + 1;
				});
			}
		});
		return counts;
	}, [bookmarks]);

	const filteredBookmarks = useMemo(() => {
		if (selectedTags.length === 0) return bookmarks;
		return bookmarks.filter((b) =>
			selectedTags.some((t) => b.tags?.includes(t)),
		);
	}, [bookmarks, selectedTags]);

	const hasActiveFilters = selectedTags.length > 0;
	const isFavoritesView = filter === "favorites";

	const stats = useMemo(() => {
		return {
			total: filteredBookmarks.length,
			favorites: filteredBookmarks.filter((b: any) => b.liked).length,
			tagsCount: allTags.length,
		};
	}, [filteredBookmarks, allTags]);

	const toggleTagParam = (tag: string) => {
		const current = new Set(selectedTags);
		if (current.has(tag)) {
			current.delete(tag);
		} else {
			current.add(tag);
		}
		const next = Array.from(current);
		void navigate({
			search: (prev: any) => ({
				...prev,
				tags: next.length > 0 ? next.join(",") : undefined,
			}),
			replace: true,
		});
	};

	const clearTagFilters = () => {
		void navigate({
			search: (prev: any) => ({
				...prev,
				tags: undefined,
			}),
			replace: true,
		});
	};

	return {
		bookmarks: filteredBookmarks,
		bookmarkAgent,
		viewMode,
		setViewMode,
		editingBookmark,
		handleEdit,
		handleCloseEdit,
		handleMove,
		handleLike,
		handleSave,
		handleDelete,
		addBookmark,
		selectedTags,
		allTags,
		tagCounts,
		stats,
		hasActiveFilters,
		isFavoritesView,
		currentCollectionName,
		toggleTagParam,
		clearTagFilters,
		filter,
	};
}
