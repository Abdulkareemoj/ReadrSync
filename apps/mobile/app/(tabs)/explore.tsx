import { router } from "expo-router";
import { Bookmark, Rss, TrendingUp } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import ArticleCardSection from "@/components/explore/ArticleCardSection";
import FeedDiscoveryCard from "@/components/explore/FeedDiscoveryCard";
import FeedSearchCard from "@/components/explore/FeedSearchCard";
import { useExploreData } from "@/components/explore/hooks";
import YouTubeSubscribeCard from "@/components/explore/YouTubeSubscribeCard";
import { DashboardCardMobile } from "@/components/home/dashboard-card-mobile";
import { Text } from "@/components/ui/text";

export default function Explore() {
	const d = useExploreData();

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerStyle={{
				paddingHorizontal: 16,
				paddingTop: 16,
				paddingBottom: 28,
			}}
			showsVerticalScrollIndicator={false}
			keyboardShouldPersistTaps="handled"
		>
			<Text className="mb-5 text-muted-foreground">
				Discover content and insights from your reading patterns.
			</Text>

			<View className="pb-2">
				<View className="flex-row flex-wrap gap-3">
					{d.stats.map((s) => (
						<View key={s.label} className="w-[48%]">
							<DashboardCardMobile
								title={s.label}
								value={s.value}
								icon={s.icon}
								to={s.to}
								colorClass={s.colorClass}
							/>
						</View>
					))}
				</View>
			</View>

			<View className="gap-4 pt-3">
				<ArticleCardSection
					icon={Rss}
					iconClass="text-primary"
					title="Best of your feeds"
					description="Latest unread articles across all sources"
					articleIds={d.bestArticleIds}
					emptyTitle="No feeds yet"
					emptyDesc="Add some feeds to see articles here"
					emptyAction={{
						label: "Add feed",
						onPress: () => router.push("/(tabs)/rss/sources"),
					}}
				/>

				<ArticleCardSection
					icon={TrendingUp}
					iconClass="text-primary"
					title="Read more like this"
					description="Personalised recommendations from your activity"
					articleIds={d.recommendedIds}
					emptyTitle="Nothing yet"
					emptyDesc="Like some articles to get personalised recommendations"
				/>

				<ArticleCardSection
					icon={Bookmark}
					iconClass="text-primary"
					title="Your backlog"
					description="Saved articles you haven't read yet"
					articleIds={d.backlogIds}
					emptyTitle="All caught up"
					emptyDesc="No unread saved articles — you're on top of it"
				/>

				<YouTubeSubscribeCard
					url={d.youtubeUrl}
					onUrlChange={(text) => {
						d.setYoutubeUrl(text);
						d.setYoutubeError("");
					}}
					loading={d.youtubeLoading}
					error={d.youtubeError}
					onSubscribe={d.handleYouTubeSubscribe}
				/>

				<FeedDiscoveryCard
					url={d.discoverUrl}
					onUrlChange={(text) => {
						d.setDiscoverUrl(text);
						d.setDiscoverError("");
					}}
					loading={d.discovering}
					error={d.discoverError}
					discoveredFeeds={d.discoveredFeeds}
					subscribedFeeds={d.feeds}
					onDiscover={d.handleDiscover}
					onToggle={d.handleToggleFeed}
				/>

				<FeedSearchCard
					query={d.searchQuery}
					onQueryChange={(text) => {
						d.setSearchQuery(text);
						d.setSearchError("");
					}}
					loading={d.searching}
					error={d.searchError}
					results={d.searchResults.map((f) => ({
						name: f.name,
						description: f.description,
						url: f.url,
						category: f.category,
						icon: f.icon,
					}))}
					subscribedFeeds={d.feeds}
					onSearch={d.handleFeedSearch}
					onToggle={d.handleToggleFeed}
				/>
			</View>
		</ScrollView>
	);
}
