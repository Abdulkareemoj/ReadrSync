import { Stack } from "expo-router";
import { Flame, Pin, Plus, TrendingUp } from "lucide-react-native";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import CollectionsSection from "@/components/home/CollectionsSection";
import { DashboardCardMobile } from "@/components/home/dashboard-card-mobile";
import FromYourFeedsSection from "@/components/home/FromYourFeedsSection";
import HorizontalArticleSection from "@/components/home/HorizontalArticleSection";
import { useHomeData } from "@/components/home/hooks";
import ReadingStatsCard from "@/components/home/ReadingStatsCard";
import ReadingStreakCard from "@/components/home/ReadingStreakCard";
import RecentActivityCard from "@/components/home/RecentActivityCard";
import TagCloud from "@/components/home/TagCloud";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

export default function Home() {
	const [refreshing, setRefreshing] = useState(false);
	const data = useHomeData();

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingTop: 16,
					paddingBottom: 28,
				}}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={async () => {
							setRefreshing(true);
							await data.onRefresh();
							setRefreshing(false);
						}}
					/>
				}
			>
				<Stack.Screen options={{ title: "Home" }} />

				<Text className="mb-5 text-muted-foreground">
					A quick overview of your saved content and feeds.
				</Text>

				<View className="flex-row flex-wrap">
					{data.dashboardData.map((item) => (
						<View key={item.title} className="basis-1/2 p-1">
							<DashboardCardMobile {...item} />
						</View>
					))}
				</View>

				{data.hasTodayActivity && (
					<View className="mt-7">
						<Card>
							<CardHeader>
								<CardTitle>Today's Activity</CardTitle>
							</CardHeader>
							<CardContent>
								<Text className="text-muted-foreground text-sm">
									{data.bookmarksTodayCount > 0 &&
										`${data.bookmarksTodayCount} bookmark${data.bookmarksTodayCount !== 1 ? "s" : ""} added`}
									{data.bookmarksTodayCount > 0 &&
										data.articlesTodayCount > 0 &&
										" • "}
									{data.articlesTodayCount > 0 &&
										`${data.articlesTodayCount} article${data.articlesTodayCount !== 1 ? "s" : ""} published`}
								</Text>
							</CardContent>
						</Card>
					</View>
				)}

				{data.hasThisWeekActivity && (
					<View className="mt-4">
						<Card>
							<CardHeader>
								<CardTitle>This Week</CardTitle>
							</CardHeader>
							<CardContent>
								<Text className="text-muted-foreground text-sm">
									{data.bookmarksThisWeekCount > 0 &&
										`${data.bookmarksThisWeekCount} bookmark${data.bookmarksThisWeekCount !== 1 ? "s" : ""}`}
									{data.bookmarksThisWeekCount > 0 &&
										data.articlesThisWeekCount > 0 &&
										" • "}
									{data.articlesThisWeekCount > 0 &&
										`${data.articlesThisWeekCount} article${data.articlesThisWeekCount !== 1 ? "s" : ""}`}
								</Text>
							</CardContent>
						</Card>
					</View>
				)}

				<HorizontalArticleSection
					title="Daily Highlights"
					icon={Flame}
					iconClass="text-orange-500"
					articles={data.dailyHighlights}
					feeds={data.feeds}
				/>

				<HorizontalArticleSection
					title="Trending This Week"
					icon={TrendingUp}
					iconClass="text-green-500"
					articles={data.trendingArticles}
					feeds={data.feeds}
				/>

				<ReadingStreakCard currentStreak={data.currentStreak} />
				<ReadingStatsCard
					readCount={data.readCount}
					savedCount={data.savedCount}
					unreadCount={data.unreadArticles}
				/>

				<HorizontalArticleSection
					title="Pinned Items"
					icon={Pin}
					iconClass="text-blue-500"
					articles={data.pinnedItems}
					feeds={data.feeds}
				/>

				<FromYourFeedsSection articlesByFeed={data.articlesByFeed} />
				<TagCloud tags={data.sortedTags} />
				<CollectionsSection collections={data.bookmarkCollections} />

				<RecentActivityCard
					totalBookmarks={data.totalBookmarks}
					totalFeeds={data.totalFeeds}
					unreadArticles={data.unreadArticles}
				/>
			</ScrollView>

			<View className="absolute right-6 bottom-6">
				<Pressable
					className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
					onPress={() => console.log("Quick action pressed")}
				>
					<Plus size={24} className="text-primary-foreground" />
				</Pressable>
			</View>
		</View>
	);
}
