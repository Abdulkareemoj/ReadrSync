import { useMemo } from "react";
import { Bookmark, Clock, Compass, Rss } from "lucide-react-native";
import { useCollectionsStore } from "@packages/store";
import { useReaderStore } from "@/lib/store";

export function useHomeData() {
	const bookmarks = useReaderStore((state) => state.bookmarks);
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);
	const refreshFeed = useReaderStore((state) => state.refreshFeed);
	const bookmarkCollections = useCollectionsStore(
		(state) => state.bookmarkCollections,
	);

	const totalBookmarks = bookmarks.length;
	const unreadArticles = articles.filter((a) => !a.read).length;
	const totalFeeds = feeds.length;

	const onRefresh = async () => {
		await Promise.all(feeds.map((feed) => refreshFeed(feed.id)));
	};

	const totalReadingTime = articles
		.filter((a) => !a.read)
		.reduce((acc, a) => acc + (a.readTime || 0), 0);

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
			icon: Clock,
			to: "/rss",
			colorClass: "text-purple-500",
		},
		{
			title: "RSS Feeds",
			value: totalFeeds,
			icon: Compass,
			to: "/rss",
			colorClass: "text-green-500",
		},
	];

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

	const hasTodayActivity = bookmarksToday.length > 0 || articlesToday.length > 0;
	const bookmarksTodayCount = bookmarksToday.length;
	const articlesTodayCount = articlesToday.length;

	const hasThisWeekActivity =
		bookmarksThisWeek.length > 0 || articlesThisWeek.length > 0;
	const bookmarksThisWeekCount = bookmarksThisWeek.length;
	const articlesThisWeekCount = articlesThisWeek.length;

	const dailyHighlights = articles
		.filter((a) => !a.read)
		.sort((a, b) => {
			if (a.liked && !b.liked) return -1;
			if (!a.liked && b.liked) return 1;
			return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
		})
		.slice(0, 3);

	const trendingArticles = articles
		.filter((a) => a.pubDate >= weekAgo && a.liked)
		.slice(0, 3);

	const readDates = articles
		.filter((a) => a.read)
		.map((a) => new Date(a.pubDate).toDateString());
	const uniqueReadDates = Array.from(new Set(readDates));
	let currentStreak = 0;
	for (let i = 0; i < 7; i++) {
		const checkDate = new Date();
		checkDate.setDate(checkDate.getDate() - i);
		if (uniqueReadDates.indexOf(checkDate.toDateString()) !== -1) {
			currentStreak++;
		} else if (i > 0) {
			break;
		}
	}

	const readCount = articles.filter((a) => a.read).length;
	const savedCount = articles.filter((a) => a.saved).length;

	const pinnedItems = articles.filter((a) => a.saved).slice(0, 3);

	const articlesByFeed = feeds.map((feed) => ({
		feed,
		articles: articles
			.filter((a) => a.feedId === feed.id && !a.read)
			.slice(0, 3),
	}));

	const tagCounts: Record<string, number> = {};
	bookmarks.forEach((b) => {
		b.tags?.forEach((tag: string) => {
			tagCounts[tag] = (tagCounts[tag] || 0) + 1;
		});
	});
	const sortedTags = Object.keys(tagCounts)
		.map((key) => ({ tag: key, count: tagCounts[key] }))
		.filter((item) => typeof item.count === "number")
		.sort((a, b) => (b.count as number) - (a.count as number))
		.slice(0, 8);

	return {
		bookmarks,
		articles,
		feeds,
		onRefresh,
		dashboardData,
		totalBookmarks,
		totalFeeds,
		unreadArticles,
		hasTodayActivity,
		bookmarksTodayCount,
		articlesTodayCount,
		hasThisWeekActivity,
		bookmarksThisWeekCount,
		articlesThisWeekCount,
		dailyHighlights,
		trendingArticles,
		currentStreak,
		readCount,
		savedCount,
		pinnedItems,
		articlesByFeed,
		sortedTags,
		bookmarkCollections,
	};
}
