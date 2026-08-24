import { createFileRoute } from "@tanstack/react-router";
import BookmarkDisplay from "@/components/bookmarks/bookmark-display";
import { useReaderStore } from "@/lib/store";

export const Route = createFileRoute("/bookmarks/$id")({
	component: BookmarkPageComponent,
});

function BookmarkPageComponent() {
	const { id } = Route.useParams();
	const bookmarks = useReaderStore((state) => state.bookmarks);
	const bookmark = bookmarks.find((b) => b.id === id);

	if (!bookmark) {
		return (
			<div className="p-4">
				<h1 className="text-2xl">Bookmark not found</h1>
			</div>
		);
	}

	return (
		<main className="flex-1 overflow-y-auto">
			<BookmarkDisplay
				id={bookmark.id}
				title={bookmark.title}
				url={bookmark.url}
				description={bookmark.description ?? undefined}
				tags={bookmark.tags}
				favicon={bookmark.favicon ?? undefined}
				liked={bookmark.liked}
			/>
		</main>
	);
}
