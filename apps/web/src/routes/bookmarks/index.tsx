import { createFileRoute } from "@tanstack/react-router";
import { AddBookmarkDialog } from "@/components/bookmarks/add-bookmark-dialog";
import BookmarkEmptyState from "@/components/bookmarks/BookmarkEmptyState";
import BookmarksHeader from "@/components/bookmarks/BookmarksHeader";
import { BookmarkGridView } from "@/components/bookmarks/bookmark-grid-view";
import { BookmarkListView } from "@/components/bookmarks/bookmark-list-view";
import { EditBookmarkDialog } from "@/components/bookmarks/edit-bookmark-dialog";
import FilterChips from "@/components/bookmarks/FilterChips";
import { useBookmarksPage } from "@/components/bookmarks/hooks";

export const Route = createFileRoute("/bookmarks/")({
	component: BookmarksComponent,
	validateSearch: (search: Record<string, unknown>) => ({
		filter: (search.filter as string) || "all",
		tags: (search.tags as string) || "",
	}),
});

function BookmarksComponent() {
	const { filter, tags: tagsParam } = Route.useSearch();
	const d = useBookmarksPage(filter, tagsParam);

	const commonProps = {
		bookmarks: d.bookmarks,
		onLike: d.handleLike,
		onSave: d.handleSave,
		onDelete: d.handleDelete,
		onEdit: d.handleEdit,
		onMove: d.handleMove,
	};

	return (
		<div className="flex h-full flex-col">
			<BookmarksHeader
				stats={d.stats}
				viewMode={d.viewMode}
				onViewModeChange={d.setViewMode}
				addBookmarkDialog={
					<AddBookmarkDialog
						onAddBookmark={(data) => {
							void d.addBookmark({
								url: data.url,
								title: data.title,
								tags: data.tags,
								collectionId: data.collectionId || filter || "inbox",
								image: data.image,
							});
						}}
					/>
				}
			/>

			<FilterChips
				tags={d.selectedTags}
				onRemoveTag={d.toggleTagParam}
				onClearAll={d.clearTagFilters}
			/>

			<div className="flex-1 overflow-y-auto">
				{d.bookmarks.length === 0 ? (
					<BookmarkEmptyState
						hasActiveFilters={d.hasActiveFilters}
						currentCollectionName={d.currentCollectionName}
						filter={d.filter}
						onClearFilters={d.clearTagFilters}
					/>
				) : d.viewMode === "list" ? (
					<BookmarkListView {...commonProps} />
				) : (
					<BookmarkGridView {...commonProps} />
				)}
			</div>

			<EditBookmarkDialog
				bookmark={
					d.bookmarks.find((b: any) => b.id === d.editingBookmark) || null
				}
				isOpen={!!d.editingBookmark}
				onClose={d.handleCloseEdit}
			/>
		</div>
	);
}
