type Bookmark = {
	id: string;
	title: string;
	pinned?: boolean;
};

type Article = {
	id: string;
	title: string;
	pinned?: boolean;
};

type Props = {
	bookmarks: Bookmark[];
	articles: Article[];
};

export default function PinnedItemsSection({ bookmarks, articles }: Props) {
	if (bookmarks.length === 0 && articles.length === 0) return null;

	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<h2 className="mb-4 font-semibold text-foreground text-xl">
				Pinned Items
			</h2>
			<div className="flex flex-col gap-3">
				{bookmarks.slice(0, 5).map((bookmark) => (
					<div
						key={bookmark.id}
						className="border-border border-b pb-3 last:border-0"
					>
						<h3 className="font-semibold text-sm">{bookmark.title}</h3>
						<p className="mt-1 text-muted-foreground text-xs">📌 Bookmark</p>
					</div>
				))}
				{articles.slice(0, 5).map((article) => (
					<div
						key={article.id}
						className="border-border border-b pb-3 last:border-0"
					>
						<h3 className="font-semibold text-sm">{article.title}</h3>
						<p className="mt-1 text-muted-foreground text-xs">📌 Article</p>
					</div>
				))}
			</div>
		</div>
	);
}
