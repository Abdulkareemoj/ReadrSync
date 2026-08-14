import type { Article } from "@packages/store";
import { Link } from "@tanstack/react-router";
import { Bookmark, Check, Heart, Rss } from "lucide-react";
import { AddFeedDialog } from "@/components/rss/add-feed-dialog";
import ArticleCard from "@/components/rss/article-card";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

function extractImageFromContent(content?: string): string | undefined {
	if (!content) return undefined;
	const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
	return match?.[1];
}

type Props = {
	articles: Article[];
	feeds: { id: string; title: string }[];
	toggleArticleRead: (id: string) => void;
	toggleArticleLike: (id: string) => void;
	toggleArticleSave: (id: string) => void;
	viewMode: "grid" | "list";
};

export default function ArticleGrid({
	articles,
	feeds,
	toggleArticleRead,
	toggleArticleLike,
	toggleArticleSave,
	viewMode,
}: Props) {
	if (articles.length === 0) {
		const hasNoFeeds = feeds.length === 0;
		return (
			<div className="flex justify-center p-8">
				<Empty className="w-full max-w-sm rounded-xl border">
					<div className="flex flex-col gap-3 p-8 text-center">
						<div className="flex justify-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-muted">
								{hasNoFeeds ? (
									<Rss
										data-icon="inline-start"
										className="text-muted-foreground"
									/>
								) : (
									<Check
										data-icon="inline-start"
										className="text-muted-foreground"
									/>
								)}
							</div>
						</div>
						<div>
							<h2 className="font-semibold text-foreground">
								{hasNoFeeds ? "No feeds yet" : "All caught up"}
							</h2>
							<p className="mt-1 text-muted-foreground text-sm">
								{hasNoFeeds
									? "Add an RSS feed to start reading"
									: "No articles found for this feed"}
							</p>
						</div>
						{hasNoFeeds && (
							<div className="pt-2">
								<AddFeedDialog />
							</div>
						)}
					</div>
				</Empty>
			</div>
		);
	}

	const sorted = [...articles].sort(
		(a, b) =>
			new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime(),
	);

	if (viewMode === "list") {
		return (
			<div className="flex flex-col gap-px">
				{sorted.map((article) => {
					const feedTitle = feeds.find((f) => f.id === article.feedId)?.title;
					return (
						<Link
							key={article.id}
							to="/rss/article/$id"
							params={{ id: article.id }}
							className="block"
						>
							<div
								className={cn(
									"flex items-start gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/50",
									article.read && "opacity-60",
								)}
							>
								<div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
									{article.imageUrl ? (
										<img
											src={article.imageUrl}
											alt=""
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center">
											<span className="font-bold text-lg text-muted-foreground/30">
												{article.title?.charAt(0)}
											</span>
										</div>
									)}
								</div>

								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-2">
										<h3 className="line-clamp-2 font-medium text-foreground text-sm leading-snug">
											{article.title}
										</h3>
										<div className="flex shrink-0 items-center gap-0.5">
											<Button
												variant="ghost"
												size="icon"
												className="size-7 text-muted-foreground hover:text-foreground"
												onClick={(e) => {
													e.preventDefault();
													toggleArticleLike(article.id);
												}}
											>
												<Heart
													data-icon="inline-start"
													className={cn(
														article.liked && "fill-current text-red-500",
													)}
												/>
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="size-7 text-muted-foreground hover:text-foreground"
												onClick={(e) => {
													e.preventDefault();
													toggleArticleSave(article.id);
												}}
											>
												<Bookmark
													data-icon="inline-start"
													className={cn(
														article.saved && "fill-current text-primary",
													)}
												/>
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="size-7 text-muted-foreground hover:text-foreground"
												onClick={(e) => {
													e.preventDefault();
													toggleArticleRead(article.id);
												}}
											>
												<Check
													data-icon="inline-start"
													className={cn(article.read && "text-primary")}
												/>
											</Button>
										</div>
									</div>
									<div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
										{feedTitle && (
											<span className="truncate font-medium">{feedTitle}</span>
										)}
										{feedTitle && <span className="text-border">·</span>}
										<span>
											{article.pubDate
												? new Date(article.pubDate).toLocaleDateString(
														undefined,
														{ month: "short", day: "numeric" },
													)
												: "Unknown date"}
										</span>
									</div>
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{sorted.map((article) => {
				const feedTitle = feeds.find((f) => f.id === article.feedId)?.title;
				const imageUrl =
					article.imageUrl ||
					extractImageFromContent(article.content || article.contentSnippet);

				return (
					<Link
						key={article.id}
						to="/rss/article/$id"
						params={{ id: article.id }}
						className="block"
					>
						<ArticleCard
							id={article.id}
							title={article.title ?? "Untitled"}
							excerpt={
								article.contentSnippet?.replace(/<[^>]*>/g, "").slice(0, 120) ??
								""
							}
							category={feedTitle ?? "RSS"}
							readTime={Math.max(
								1,
								Math.ceil(
									(article.content?.replace(/<[^>]*>/g, "").length ?? 0) / 1000,
								),
							)}
							author=""
							date={
								article.pubDate
									? new Date(article.pubDate).toLocaleDateString(undefined, {
											month: "short",
											day: "numeric",
										})
									: ""
							}
							imageUrl={imageUrl}
							imageData={article.imageData}
							feedTitle={feedTitle}
							liked={article.liked}
							saved={article.saved}
							read={article.read}
							onLike={() => toggleArticleLike(article.id)}
							onSave={() => toggleArticleSave(article.id)}
						/>
					</Link>
				);
			})}
		</div>
	);
}
