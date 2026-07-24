import { useState } from "react";
import {
	Bookmark,
	BookOpen,
	Heart,
	Rss,
} from "lucide-react-native";
import {
	curatedFeedsByCategory,
	getAllCuratedFeeds,
	getCategories,
	getRandomFeeds,
	discoverYouTubeChannelFeed,
	parseYouTubeChannelUrl,
	resolveYouTubeHandle,
	extractYouTubeHandle,
} from "@packages/utils";
import { useReaderStore } from "@/lib/store";

export function useExploreData() {
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);
	const addFeed = useReaderStore((state) => state.addFeed);
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [youtubeLoading, setYoutubeLoading] = useState(false);
	const [youtubeError, setYoutubeError] = useState("");
	const [randomFeeds, setRandomFeeds] = useState(getRandomFeeds(6));
	const [selectedCategory, setSelectedCategory] = useState<string | "all">(
		"all",
	);

	const readArticles = articles.filter((a) => a.read).length;
	const likedArticlesCount = articles.filter((a) => a.liked).length;
	const savedArticlesCount = articles.filter((a) => a.saved).length;
	const totalArticles = articles.length;

	const stats = [
		{
			icon: BookOpen,
			label: "Articles read",
			value: readArticles,
			to: "/rss",
			colorClass: "text-blue-500",
		},
		{
			icon: Heart,
			label: "Articles liked",
			value: likedArticlesCount,
			to: "/rss",
			colorClass: "text-red-500",
		},
		{
			icon: Bookmark,
			label: "Articles saved",
			value: savedArticlesCount,
			to: "/bookmarks",
			colorClass: "text-green-500",
		},
		{
			icon: Rss,
			label: "Total articles",
			value: totalArticles,
			to: "/rss",
			colorClass: "text-purple-500",
		},
	];

	const bestArticleIds = articles
		.filter((a) => !a.read)
		.sort(
			(a, b) =>
				new Date(b.pubDate || 0).getTime() -
				new Date(a.pubDate || 0).getTime(),
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

	const categories = getCategories();

	const filteredFeeds =
		selectedCategory === "all"
			? getAllCuratedFeeds()
			: curatedFeedsByCategory[selectedCategory] || [];

	const handleAddFeed = async (url: string, title: string) => {
		try {
			await addFeed({ feedUrl: url, title });
		} catch (e) {
			console.error("Failed to add feed:", e);
		}
	};

	const handleRandomFeeds = () => {
		setRandomFeeds(getRandomFeeds(6));
	};

	const handleYouTubeSubscribe = async () => {
		setYoutubeError("");
		const { normalizedUrl, isValid } = parseYouTubeChannelUrl(youtubeUrl);
		if (!isValid || !normalizedUrl) {
			setYoutubeError("Invalid YouTube channel URL");
			return;
		}
		setYoutubeLoading(true);
		try {
			const result = await discoverYouTubeChannelFeed(normalizedUrl);
			if (!result) {
				setYoutubeError("Could not find RSS feed for this channel");
				return;
			}

			let feedUrl = result.feedUrl;
			if (result.requiresChannelId) {
				const handle = extractYouTubeHandle(normalizedUrl);
				if (handle) {
					const channelId = await resolveYouTubeHandle(handle);
					if (channelId) {
						feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
					} else {
						setYoutubeError(
							"Could not resolve this YouTube handle. Try pasting the channel URL in /channel/UC... format instead.",
						);
						setYoutubeLoading(false);
						return;
					}
				}
			}

			await handleAddFeed(feedUrl, result.title);
			setYoutubeUrl("");
		} catch (e) {
			const msg = e instanceof Error ? e.message : "Failed to subscribe";
			setYoutubeError(
				`${msg} Try the channel URL in /channel/UC... format instead.`,
			);
		} finally {
			setYoutubeLoading(false);
		}
	};

	return {
		feeds,
		stats,
		bestArticleIds,
		recommendedIds,
		backlogIds,
		categories,
		filteredFeeds,
		randomFeeds,
		selectedCategory,
		setSelectedCategory,
		youtubeUrl,
		setYoutubeUrl,
		youtubeLoading,
		youtubeError,
		setYoutubeError,
		handleAddFeed,
		handleRandomFeeds,
		handleYouTubeSubscribe,
	};
}
