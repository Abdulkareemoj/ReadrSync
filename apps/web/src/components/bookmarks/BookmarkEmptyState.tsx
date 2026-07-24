import { Bookmark as BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

type Props = {
	hasActiveFilters: boolean;
	currentCollectionName: string;
	filter: string;
	onClearFilters: () => void;
};

export default function BookmarkEmptyState({
	hasActiveFilters,
	currentCollectionName,
	filter,
	onClearFilters,
}: Props) {
	return (
		<div className="flex justify-center p-4">
			<Empty className="rounded-lg border">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<BookmarkIcon data-icon="inline-start" className="size-6" />
					</EmptyMedia>
					<EmptyTitle>No Bookmarks Found</EmptyTitle>
					<EmptyDescription>
						{hasActiveFilters
							? "Try adjusting your filters to find what you're looking for."
							: filter && filter !== "all"
								? `There are no bookmarks in the collection "${currentCollectionName}".`
								: "You haven't saved any bookmarks yet. Start by adding one!"}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					{hasActiveFilters ? (
						<Button variant="outline" size="sm" onClick={onClearFilters}>
							Clear filters
						</Button>
					) : (
						<p>
							Use the Add button in the header to create your first bookmark.
						</p>
					)}
				</EmptyContent>
			</Empty>
		</div>
	);
}
