import { router } from "expo-router";
import { Bookmark, Rss, TrendingUp } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { DashboardCardMobile } from "@/components/home/dashboard-card-mobile";
import { Text } from "@/components/ui/text";
import ArticleCardSection from "@/components/explore/ArticleCardSection";
import FeedDirectoryCard from "@/components/explore/FeedDirectoryCard";
import { useExploreData } from "@/components/explore/hooks";
import SurpriseMeCard from "@/components/explore/SurpriseMeCard";
import YouTubeSubscribeCard from "@/components/explore/YouTubeSubscribeCard";

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

				<SurpriseMeCard
					feeds={d.randomFeeds}
					subscribedFeeds={d.feeds}
					onSubscribe={d.handleAddFeed}
					onShuffle={d.handleRandomFeeds}
				/>

				<FeedDirectoryCard
					categories={d.categories}
					selectedCategory={d.selectedCategory}
					onCategoryChange={d.setSelectedCategory}
					filteredFeeds={d.filteredFeeds}
					subscribedFeeds={d.feeds}
					onSubscribe={d.handleAddFeed}
				/>
			</View>
		</ScrollView>
	);
}
