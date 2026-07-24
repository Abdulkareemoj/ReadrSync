type Props = {
	title: string;
	bookmarksCount: number;
	articlesCount: number;
};

export default function WeeklyActivity({
	title,
	bookmarksCount,
	articlesCount,
}: Props) {
	if (bookmarksCount === 0 && articlesCount === 0) return null;

	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<h2 className="mb-4 font-semibold text-foreground text-xl">{title}</h2>
			<p className="text-muted-foreground">
				{bookmarksCount > 0 &&
					`${bookmarksCount} bookmark${bookmarksCount !== 1 ? "s" : ""}${title === "Today's Activity" ? " added" : ""}`}
				{bookmarksCount > 0 && articlesCount > 0 && " • "}
				{articlesCount > 0 &&
					`${articlesCount} article${articlesCount !== 1 ? "s" : ""} ${title === "Today's Activity" ? "published" : ""}`}
			</p>
		</div>
	);
}
