import {
	type DiscoveredFeed,
	discoverFeedsFromUrl,
	discoverYouTubeChannelFeed,
	parseYouTubeChannelUrl,
	type SearchedFeed,
	searchFeedsByKeyword,
} from "@packages/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Bookmark,
	BookOpen,
	Check,
	Film,
	Heart,
	Link2,
	Plus,
	Rss,
	Search,
	TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import ArticleCard from "@/components/rss/article-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useReaderStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
	component: Explore,
});

function EmptyCard({
	icon: Icon,
	title,
	desc,
	action,
}: {
	icon: React.ElementType;
	title: string;
	desc: string;
	action?: { label: string; onClick: () => void };
}) {
	return (
		<div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
			<div className="mb-1 flex size-9 items-center justify-center rounded-xl border bg-muted/40">
				<Icon data-icon="inline-start" className="text-muted-foreground" />
			</div>
			<p className="font-medium text-foreground text-sm">{title}</p>
			<p className="max-w-[240px] text-muted-foreground text-sm leading-relaxed">
				{desc}
			</p>
			{action && (
				<Button
					type="button"
					onClick={action.onClick}
					size="sm"
					className="mt-2"
				>
					{action.label}
				</Button>
			)}
		</div>
	);
}

function SectionCard({
	title,
	subtitle,
	icon: Icon,
	children,
}: {
	title: string;
	subtitle: string;
	icon: React.ElementType;
	children: React.ReactNode;
}) {
	return (
		<Card className="rounded-xl">
			<CardHeader className="flex flex-col gap-1">
				<CardTitle className="flex items-center gap-2 text-base">
					<Icon data-icon="inline-start" className="text-primary" />
					<span>{title}</span>
				</CardTitle>
				<p className="text-muted-foreground text-sm">{subtitle}</p>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

type FeedSource = {
	name: string;
	description: string;
	url: string;
	category: string;
	icon: string;
};

function FeedToggleButton({
	subscribed,
	onToggle,
}: {
	subscribed: boolean;
	onToggle: () => void;
}) {
	return (
		<motion.button
			type="button"
			whileTap={{ scale: 0.8 }}
			onClick={onToggle}
			aria-label={subscribed ? "Unsubscribe" : "Subscribe"}
			title={subscribed ? "Unsubscribe" : "Subscribe"}
			className={cn(
				"flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
				subscribed
					? "border-primary/40 bg-primary/10 text-primary"
					: "border-border bg-muted/40 text-muted-foreground hover:bg-accent",
			)}
		>
			<AnimatePresence mode="wait" initial={false}>
				{subscribed ? (
					<motion.span
						key="check"
						initial={{ scale: 0, rotate: -90 }}
						animate={{ scale: 1, rotate: 0 }}
						exit={{ scale: 0, opacity: 0 }}
						transition={{ type: "spring", stiffness: 500, damping: 25 }}
					>
						<Check data-icon="inline-start" />
					</motion.span>
				) : (
					<motion.span
						key="plus"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0, opacity: 0 }}
						transition={{ duration: 0.12 }}
					>
						<Plus data-icon="inline-start" />
					</motion.span>
				)}
			</AnimatePresence>
		</motion.button>
	);
}

function FeedRow({
	feed,
	subscribed,
	onToggle,
}: {
	feed: FeedSource;
	subscribed: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="flex items-center gap-3 rounded-lg border bg-card px-3.5 py-3 transition-colors hover:bg-accent">
			<div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm">
				{feed.icon}
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex min-w-0 items-center gap-2">
					<span className="truncate font-medium text-foreground text-sm">
						{feed.name}
					</span>
					<Badge variant="secondary" className="shrink-0 text-[10px]">
						{feed.category}
					</Badge>
				</div>
				<p className="mt-0.5 truncate text-muted-foreground text-sm">
					{feed.description}
				</p>
			</div>
			<FeedToggleButton subscribed={subscribed} onToggle={onToggle} />
		</div>
	);
}

function ArticleList({ ids }: { ids: string[] }) {
	const navigate = useNavigate();
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);

	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
			{ids.map((id) => {
				const article = articles.find((a) => a.id === id);
				if (!article) return null;
				const feed = feeds.find((f) => f.id === article.feedId);
				const readTime = (article as any).readTime ?? 5;
				return (
					<ArticleCard
						key={article.id}
						id={article.id}
						title={article.title}
						excerpt={article.contentSnippet || article.content || ""}
						category={feed?.title || "RSS"}
						readTime={readTime}
						author={feed?.title || "Unknown"}
						date={
							article.pubDate
								? new Date(article.pubDate).toLocaleDateString()
								: ""
						}
						liked={article.liked}
						saved={article.saved}
						imageUrl={article.imageUrl || undefined}
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
	);
}

function Explore() {
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);
	const addFeed = useReaderStore((state) => state.addFeed);
	const removeFeed = useReaderStore((state) => state.removeFeed);
	const [discoverUrl, setDiscoverUrl] = useState("");
	const [discovering, setDiscovering] = useState(false);
	const [discoverError, setDiscoverError] = useState("");
	const [discoveredFeeds, setDiscoveredFeeds] = useState<DiscoveredFeed[]>([]);
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [youtubeLoading, setYoutubeLoading] = useState(false);
	const [youtubeError, setYoutubeError] = useState("");
	const [feedSearch, setFeedSearch] = useState("");
	const [searching, setSearching] = useState(false);
	const [searchError, setSearchError] = useState("");
	const [searchResults, setSearchResults] = useState<SearchedFeed[]>([]);

	const readArticles = articles.filter((a) => a.read).length;
	const likedArticlesCount = articles.filter((a) => a.liked).length;
	const savedArticlesCount = articles.filter((a) => a.saved).length;
	const totalArticles = articles.length;

	const stats = [
		{
			icon: BookOpen,
			label: "Articles read",
			value: readArticles,
		},
		{
			icon: Heart,
			label: "Articles liked",
			value: likedArticlesCount,
		},
		{
			icon: Bookmark,
			label: "Articles saved",
			value: savedArticlesCount,
		},
		{
			icon: Rss,
			label: "Total articles",
			value: totalArticles,
		},
	];

	const bestArticleIds = articles
		.filter((a) => !a.read)
		.sort(
			(a, b) =>
				new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime(),
		)
		.slice(0, 4)
		.map((a) => a.id);

	const recommendedIds = articles
		.filter((a) => a.liked)
		.slice(0, 4)
		.map((a) => a.id);

	const backlogIds = articles
		.filter((a) => a.saved && !a.read)
		.slice(0, 4)
		.map((a) => a.id);

	const isSubscribed = (url: string) => feeds.some((f) => f.feedUrl === url);

	const handleAddFeed = async (url: string, title: string) => {
		await addFeed({ feedUrl: url, title });
	};

	const handleToggleFeed = async (url: string, title: string) => {
		const existing = feeds.find((f) => f.feedUrl === url);
		if (existing) {
			await removeFeed(existing.id);
		} else {
			await handleAddFeed(url, title);
		}
	};

	const handleFeedSearch = async () => {
		setSearchError("");
		setSearchResults([]);
		if (!feedSearch.trim()) return;
		setSearching(true);
		try {
			const results = await searchFeedsByKeyword(feedSearch);
			setSearchResults(results);
			if (results.length === 0) {
				setSearchError("No feeds found for that search.");
			}
		} catch (e) {
			setSearchError(
				e instanceof Error ? e.message : "Could not search feeds. Try again.",
			);
		} finally {
			setSearching(false);
		}
	};

	const handleDiscover = async () => {
		setDiscoverError("");
		setDiscoveredFeeds([]);
		if (!discoverUrl.trim()) return;
		setDiscovering(true);
		try {
			const found = await discoverFeedsFromUrl(discoverUrl);
			setDiscoveredFeeds(found);
			if (found.length === 0) {
				setDiscoverError("No RSS or Atom feeds found on that page.");
			}
		} catch (e) {
			setDiscoverError(
				e instanceof Error ? e.message : "Could not discover feeds.",
			);
		} finally {
			setDiscovering(false);
		}
	};

	const handleYouTubeSubscribe = async () => {
		setYoutubeError("");
		const { normalizedUrl, isValid } = parseYouTubeChannelUrl(youtubeUrl);
		if (!isValid || !normalizedUrl) {
			setYoutubeError("Invalid YouTube channel URL");
			return;
		}
		const feedInfo = await discoverYouTubeChannelFeed(normalizedUrl);
		if (!feedInfo) {
			setYoutubeError("Could not find RSS feed for this channel");
			return;
		}
		setYoutubeLoading(true);
		try {
			// Try platform-specific handle resolver if available (e.g. Tauri Rust command)
			let resolvedUrl = feedInfo.feedUrl;
			if (feedInfo.requiresChannelId) {
				const platformResolve = (window as any).__RESOLVE_YOUTUBE_HANDLE__ as
					| ((handle: string) => Promise<string | null>)
					| undefined;
				if (platformResolve) {
					const platformUrl = await platformResolve(youtubeUrl);
					if (platformUrl) resolvedUrl = platformUrl;
				}
			}
			await handleAddFeed(resolvedUrl, feedInfo.title);
			setYoutubeUrl("");
		} catch (e) {
			const msg = e instanceof Error ? e.message : "Failed to subscribe";
			if (feedInfo.requiresChannelId) {
				setYoutubeError(
					`${msg} Try the channel URL in /channel/UC... format instead (some handles don't have matching RSS feeds).`,
				);
			} else {
				setYoutubeError(msg);
			}
		} finally {
			setYoutubeLoading(false);
		}
	};

	return (
		<div className="overflow-x-hidden p-4 md:p-8">
			<div id="overview" className="is-shown mb-6">
				<h1 className="truncate font-semibold text-2xl text-foreground">
					Explore
				</h1>
				<p className="mt-1 text-muted-foreground">
					Discover useful shortcuts and fresh content from your feeds.
				</p>
			</div>

			<div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((s) => (
					<Card key={s.label} className="rounded-xl">
						<CardContent className="p-4">
							<div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-muted">
								<s.icon
									data-icon="inline-start"
									className="text-muted-foreground"
								/>
							</div>
							<div className="font-semibold text-2xl text-foreground leading-none">
								{s.value}
							</div>
							<div className="mt-1 text-muted-foreground text-xs uppercase tracking-wide">
								{s.label}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
				<section id="trending">
					<SectionCard
						icon={Rss}
						title="Trending now"
						subtitle="Latest unread articles across all sources"
					>
						{bestArticleIds.length > 0 ? (
							<ArticleList ids={bestArticleIds} />
						) : (
							<EmptyCard
								icon={Rss}
								title="No feeds yet"
								desc="Add some feeds to see articles here"
								action={{
									label: "+ Add feed",
									onClick: () =>
										document
											.getElementById("directory")
											?.scrollIntoView({ behavior: "smooth" }),
								}}
							/>
						)}
					</SectionCard>
				</section>
				<section id="recommended">
					<SectionCard
						icon={TrendingUp}
						title="Recommended for you"
						subtitle="Personalised recommendations from your activity"
					>
						{recommendedIds.length > 0 ? (
							<ArticleList ids={recommendedIds} />
						) : (
							<EmptyCard
								icon={Heart}
								title="Nothing yet"
								desc="Like some articles to get personalised recommendations"
							/>
						)}
					</SectionCard>
				</section>
			</div>

			<section id="backlog" className="mb-6">
				<SectionCard
					icon={Bookmark}
					title="Saved backlog"
					subtitle="Articles you've marked to read later"
				>
					{backlogIds.length > 0 ? (
						<ArticleList ids={backlogIds} />
					) : (
						<EmptyCard
							icon={Bookmark}
							title="All caught up"
							desc="No unread saved articles â€” you're on top of it"
						/>
					)}
				</SectionCard>
			</section>

			{/* YouTube Subscription */}
			<Card id="youtube" className="mb-6 w-full rounded-xl">
				<CardHeader className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-2 text-base">
						<Film data-icon="inline-start" className="text-red-500" />
						<span>Subscribe to YouTube Channels</span>
					</CardTitle>
					<p className="text-muted-foreground text-sm">
						Enter a YouTube channel URL or handle to subscribe via RSS
					</p>
				</CardHeader>
				<CardContent>
					<div className="flex min-w-0 gap-2">
						<Input
							placeholder="e.g. https://youtube.com/@mkbhd"
							value={youtubeUrl}
							onChange={(e) => {
								setYoutubeUrl(e.target.value);
								setYoutubeError("");
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleYouTubeSubscribe();
							}}
							className="min-w-0 flex-1"
						/>
						<Button
							onClick={handleYouTubeSubscribe}
							disabled={youtubeLoading || !youtubeUrl.trim()}
						>
							{youtubeLoading ? <Spinner className="size-4" /> : "Subscribe"}
						</Button>
					</div>
					{youtubeError && (
						<p className="mt-2 text-red-500 text-sm">{youtubeError}</p>
					)}
					<p className="mt-2 text-muted-foreground text-xs">
						Supports youtube.com/channel/UC... (best), youtube.com/@handle, or
						bare @handle. Some handles require the /channel/UC... format.
					</p>
				</CardContent>
			</Card>

			{/* Discover by URL */}
			<Card id="discover" className="mb-6 w-full rounded-xl">
				<CardHeader className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-2 text-base">
						<Link2 data-icon="inline-start" className="text-primary" />
						<span>Discover Feeds</span>
					</CardTitle>
					<p className="text-muted-foreground text-sm">
						Paste any site URL and we'll auto-detect its RSS, Atom, or JSON
						feeds
					</p>
				</CardHeader>
				<CardContent>
					<div className="flex min-w-0 gap-2">
						<Input
							placeholder="e.g. https://www.theverge.com"
							value={discoverUrl}
							onChange={(e) => {
								setDiscoverUrl(e.target.value);
								setDiscoverError("");
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleDiscover();
							}}
							className="min-w-0 flex-1"
						/>
						<Button
							onClick={handleDiscover}
							disabled={discovering || !discoverUrl.trim()}
						>
							{discovering ? <Spinner className="size-4" /> : "Discover"}
						</Button>
					</div>
					{discoverError && (
						<p className="mt-2 text-red-500 text-sm">{discoverError}</p>
					)}
					{discoveredFeeds.length > 0 && (
						<div className="mt-4 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
							{discoveredFeeds.map((feed) => (
								<FeedRow
									key={feed.url}
									feed={{
										name: feed.title,
										description: feed.url,
										url: feed.url,
										category: feed.type.toUpperCase(),
										icon: feed.type === "atom" ? "📄" : "📡",
									}}
									subscribed={isSubscribed(feed.url)}
									onToggle={() => handleToggleFeed(feed.url, feed.title)}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Search Feeds */}
			<Card id="directory" className="mb-6 w-full rounded-xl">
				<CardHeader className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-2 text-base">
						<TrendingUp data-icon="inline-start" className="text-primary" />
						<span>Search Feeds</span>
					</CardTitle>
					<p className="text-muted-foreground text-sm">
						Search the web for feeds worth following
					</p>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex min-w-0 gap-2">
						<div className="relative min-w-0 flex-1">
							<Search
								data-icon="inline-start"
								className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								placeholder="e.g. machine learning, cooking, finance"
								value={feedSearch}
								onChange={(e) => {
									setFeedSearch(e.target.value);
									setSearchError("");
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleFeedSearch();
								}}
								className="w-full min-w-0 pl-9"
							/>
						</div>
						<Button
							onClick={handleFeedSearch}
							disabled={searching || !feedSearch.trim()}
						>
							{searching ? <Spinner className="size-4" /> : "Search"}
						</Button>
					</div>
					{searchError && (
						<p className="mb-3 text-red-500 text-sm">{searchError}</p>
					)}
					<div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
						{searchResults.map((feed) => (
							<FeedRow
								key={feed.url}
								feed={{
									name: feed.name,
									description: feed.description,
									url: feed.url,
									category: feed.category,
									icon: feed.icon,
								}}
								subscribed={isSubscribed(feed.url)}
								onToggle={() => handleToggleFeed(feed.url, feed.name)}
							/>
						))}
						{!searching && searchResults.length === 0 && !searchError && (
							<p className="col-span-full py-8 text-center text-muted-foreground text-sm">
								Search by topic to discover feeds you can follow.
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
