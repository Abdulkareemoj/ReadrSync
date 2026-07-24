import { useCollectionsStore } from "@packages/store";
import { Bookmark, Compass, Rss } from "lucide-react";
import { useReaderStore } from "@/lib/store";

export function useHomeData() {
	const bookmarks = useReaderStore((state) => state.bookmarks);
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);
	const bookmarkCollections = useCollectionsStore(
		(state) => state.bookmarkCollections,
	);

	const totalBookmarks = bookmarks.length;
	const unreadArticles = articles.filter((a) => !a.read).length;
	const totalFeeds = feeds.length;

	const totalReadingTime = articles
		.filter((a) => !a.read)
		.reduce((acc, a) => acc + (a.readTime || 0), 0);

	const today = new Date();
	const todayStart = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	).toISOString();
	const weekAgo = new Date(
		today.getTime() - 7 * 24 * 60 * 60 * 1000,
	).toISOString();

	const bookmarksToday = bookmarks.filter((b) => b.createdAt >= todayStart);
	const articlesToday = articles.filter((a) => a.pubDate >= todayStart);
	const bookmarksThisWeek = bookmarks.filter((b) => b.createdAt >= weekAgo);
	const articlesThisWeek = articles.filter((a) => a.pubDate >= weekAgo);

	const dailyHighlights = articles
		.filter((a) => !a.read)
		.sort((a, b) => {
			if (a.liked && !b.liked) return -1;
			if (!a.liked && b.liked) return 1;
			return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
		})
		.slice(0, 5);

	const trendingArticles = articles
		.filter((a) => a.pubDate >= weekAgo)
		.sort(
			(a, b) =>
				(b.liked ? 1 : 0) -
				(a.liked ? 1 : 0) +
				(b.saved ? 1 : 0) -
				(a.saved ? 1 : 0),
		)
		.slice(0, 5);

	const readArticlesByDate = new Map<string, number>();
	articles
		.filter((a) => a.read && a.readAt)
		.forEach((a) => {
			const date = a.readAt?.split("T")[0] || "";
			readArticlesByDate.set(date, (readArticlesByDate.get(date) || 0) + 1);
		});

	let currentStreak = 0;
	for (let i = 0; i < 30; i++) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().split("T")[0];
		if (readArticlesByDate.has(dateStr)) {
			currentStreak++;
		} else if (i > 0) {
			break;
		}
	}

	const totalRead = articles.filter((a) => a.read).length;
	const totalLiked = articles.filter((a) => a.liked).length;
	const totalSaved = articles.filter((a) => a.saved).length;

	const pinnedBookmarks = bookmarks.filter((b) => b.pinned);
	const pinnedArticles = articles.filter((a) => a.pinned);

	const articlesByFeed = feeds.slice(0, 3).map((feed) => ({
		feed,
		articles: articles
			.filter((a) => a.feedId === feed.id && !a.read)
			.slice(0, 3),
	}));

	const allTags = bookmarks.flatMap((b) => b.tags || []);
	const tagCounts = allTags.reduce(
		(acc, tag) => {
			acc[tag] = (acc[tag] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);
	const topTags = Object.entries(tagCounts)
		.filter(([_, count]) => typeof count === "number")
		.map(([tag, count]) => [tag, count as number])
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);

	const dashboardData = [
		{
			title: "Total Bookmarks",
			value: totalBookmarks,
			icon: Bookmark,
			to: "/bookmarks",
			colorClass: "text-blue-500",
		},
		{
			title: "Unread Articles",
			value: unreadArticles,
			icon: Rss,
			to: "/rss",
			colorClass: "text-orange-500",
		},
		{
			title: "Reading Time",
			value: totalReadingTime,
			icon: Compass,
			to: "/rss",
			colorClass: "text-purple-500",
		},
		{
			title: "RSS Feeds",
			value: totalFeeds,
			icon: Rss,
			to: "/rss",
			colorClass: "text-green-500",
		},
	];

	return {
		feeds,
		dailyHighlights,
		trendingArticles,
		articlesByFeed,
		dashboardData,
		totalBookmarks,
		totalFeeds,
		unreadArticles,
		bookmarksToday,
		articlesToday,
		bookmarksThisWeek,
		articlesThisWeek,
		currentStreak,
		totalRead,
		totalLiked,
		totalSaved,
		pinnedBookmarks,
		pinnedArticles,
		bookmarkCollections,
		topTags,
	};
}
