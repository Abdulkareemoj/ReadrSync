import { useMemo, useState } from "react";
import { useFeeds } from "@/hooks/use-feeds";

export function useRssPage(filter: string | null) {
	const [search, setSearch] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [isRefreshing, setIsRefreshing] = useState(false);

	const {
		feeds,
		articles: allArticles,
		toggleArticleRead,
		toggleArticleLike,
		toggleArticleSave,
		refreshFeed,
	} = useFeeds();

	const filteredByFeed = filter
		? allArticles.filter((a) => a.feedId === filter)
		: allArticles;

	const articles = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return filteredByFeed;
		return filteredByFeed.filter(
			(a) =>
				a.title?.toLowerCase().includes(q) ||
				a.contentSnippet?.toLowerCase().includes(q),
		);
	}, [filteredByFeed, search]);

	const mainTitle = filter
		? (feeds.find((f) => f.id === filter)?.title ?? "Articles")
		: "All Articles";

	const unreadCount = articles.filter((a) => !a.read).length;

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			if (filter) {
				await refreshFeed(filter);
			} else {
				await Promise.all(feeds.map((f) => refreshFeed(f.id)));
			}
		} finally {
			setIsRefreshing(false);
		}
	};

	return {
		feeds,
		articles,
		search,
		setSearch,
		viewMode,
		setViewMode,
		isRefreshing,
		mainTitle,
		unreadCount,
		toggleArticleRead,
		toggleArticleLike,
		toggleArticleSave,
		handleRefresh,
	};
}
