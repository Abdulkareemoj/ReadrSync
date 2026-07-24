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
	articlesByFeed: { feed: Feed; articles: Article[] }[];
	navigate: ReturnType<typeof useNavigate>;
};

export default function FromYourFeedsSection({
	articlesByFeed,
	navigate,
}: Props) {
	const hasArticles = articlesByFeed.some((f) => f.articles.length > 0);
	if (!hasArticles) return null;

	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<h2 className="mb-4 font-semibold text-foreground text-xl">
				From Your Feeds
			</h2>
			<div className="flex flex-col gap-6">
				{articlesByFeed.map(
					({ feed, articles }) =>
						articles.length > 0 && (
							<div key={feed.id}>
								<h3 className="mb-3 font-semibold text-lg">{feed.title}</h3>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									{articles.map((article) => (
										<ArticleCard
											key={article.id}
											id={article.id}
											title={article.title}
											excerpt={article.contentSnippet || article.content || ""}
											category={feed.title}
											readTime={article.readTime || 5}
											author={feed.title}
											date={
												article.pubDate
													? new Date(article.pubDate).toLocaleDateString()
													: ""
											}
											liked={article.liked}
											saved={article.saved}
											imageUrl={article.imageUrl || undefined}
											feedFavicon={
												feed.siteUrl
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
									))}
								</div>
							</div>
						),
				)}
			</div>
		</div>
	);
}
