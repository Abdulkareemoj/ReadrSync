import type { useNavigate } from "@tanstack/react-router";
import ArticleCard from "@/components/rss/article-card";

type Article = {
	id: string;
	title: string;
	feedId: string;
	contentSnippet?: string;
	content?: string;
	imageUrl?: string;
	imageData?: string;
	pubDate?: string;
	readTime?: number;
	liked?: boolean;
	saved?: boolean;
};

type Feed = {
	id: string;
	title: string;
	siteUrl?: string;
};

type Props = {
	title: string;
	articles: Article[];
	feeds: Feed[];
	navigate: ReturnType<typeof useNavigate>;
};

export default function ArticleGridSection({
	title,
	articles,
	feeds,
	navigate,
}: Props) {
	if (articles.length === 0) return null;

	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<h2 className="mb-4 font-semibold text-foreground text-xl">{title}</h2>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{articles.map((article) => {
					const feed = feeds.find((f) => f.id === article.feedId);
					return (
						<ArticleCard
							key={article.id}
							id={article.id}
							title={article.title}
							excerpt={article.contentSnippet || article.content || ""}
							category={feed?.title || "RSS"}
							readTime={article.readTime || 5}
							author={feed?.title || "Unknown"}
							date={
								article.pubDate
									? new Date(article.pubDate).toLocaleDateString()
									: ""
							}
							liked={article.liked}
							saved={article.saved}
							imageUrl={article.imageUrl || undefined}
							imageData={article.imageData}
							feedFavicon={
								feed?.siteUrl
									? `https://www.google.com/s2/favicons?domain=${new URL(feed.siteUrl).hostname}&sz=64`
									: undefined
							}
							onClick={() =>
								navigate({
									to: "/rss/article/$id",
									params: { id: article.id },
								})
							}
						/>
					);
				})}
			</div>
		</div>
	);
}
