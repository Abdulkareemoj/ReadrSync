import { BookmarkIcon, Heart, LayoutGrid, List, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddBookmarkDialog } from "./add-bookmark-dialog";

type Props = {
	stats: { total: number; favorites: number; tagsCount: number };
	viewMode: "list" | "grid";
	onViewModeChange: (mode: "list" | "grid") => void;
	addBookmarkDialog: React.ReactElement<
		React.ComponentProps<typeof AddBookmarkDialog>
	>;
};

export default function BookmarksHeader({
	stats,
	viewMode,
	onViewModeChange,
	addBookmarkDialog,
}: Props) {
	return (
		<header className="flex items-center justify-between border-b px-6 py-3">
			<div className="flex items-center gap-4">{addBookmarkDialog}</div>
			<div className="flex items-center gap-2">
				{stats.total > 0 && (
					<div className="mr-4 flex items-center gap-4 text-muted-foreground text-sm">
						<span className="flex items-center gap-1">
							<BookmarkIcon className="size-3.5" />
							{stats.total}
						</span>
						<span className="flex items-center gap-1">
							<Heart className="size-3.5" />
							{stats.favorites}
						</span>
						<span className="flex items-center gap-1">
							<Tag className="size-3.5" />
							{stats.tagsCount}
						</span>
					</div>
				)}
				<div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
					<Button
						variant={viewMode === "list" ? "secondary" : "ghost"}
						size="icon"
						className="size-7"
						onClick={() => onViewModeChange("list")}
						title="List View"
					>
						<List data-icon="inline-start" />
					</Button>
					<Button
						variant={viewMode === "grid" ? "secondary" : "ghost"}
						size="icon"
						className="size-7"
						onClick={() => onViewModeChange("grid")}
						title="Grid View"
					>
						<LayoutGrid data-icon="inline-start" />
					</Button>
				</div>
			</div>
		</header>
	);
}
