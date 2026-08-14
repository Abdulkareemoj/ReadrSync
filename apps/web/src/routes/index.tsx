import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import ArticleGridSection from "@/components/home/ArticleGridSection";
import CollectionsSection from "@/components/home/CollectionsSection";
import { DashboardCard } from "@/components/home/dashboard-card";
import FromYourFeedsSection from "@/components/home/FromYourFeedsSection";
import { useHomeData } from "@/components/home/hooks";
import PinnedItemsSection from "@/components/home/PinnedItemsSection";
import ReadingStatsSection from "@/components/home/ReadingStatsSection";
import ReadingStreakSection from "@/components/home/ReadingStreakSection";
import RecentActivitySection from "@/components/home/RecentActivitySection";
import WeeklyActivity from "@/components/home/WeeklyActivity";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
	component: DashboardComponent,
});

function DashboardComponent() {
	const navigate = useNavigate();
	const d = useHomeData();

	return (
		<div className="p-4 md:p-8">
			<div className="mb-8 flex items-center justify-between">
				<div className="t-stagger is-shown">
					<h1 className="t-stagger-line t-stagger-line--1 font-bold text-3xl text-foreground">
						Dashboard
					</h1>
					<p className="t-stagger-line t-stagger-line--2 text-muted-foreground">
						A quick overview of your saved content and feeds.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						<Plus data-icon="inline-start" />
						Add Bookmark
					</Button>
					<Button size="sm">
						<Plus data-icon="inline-start" />
						Add Feed
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{d.dashboardData.map((item: any) => (
					<DashboardCard key={item.title} {...item} />
				))}
			</div>

			<div className="mt-10 flex flex-col gap-6">
				<WeeklyActivity
					title="Today's Activity"
					bookmarksCount={d.bookmarksToday.length}
					articlesCount={d.articlesToday.length}
				/>

				<WeeklyActivity
					title="This Week"
					bookmarksCount={d.bookmarksThisWeek.length}
					articlesCount={d.articlesThisWeek.length}
				/>

				<CollectionsSection collections={d.bookmarkCollections} />
				<ArticleGridSection
					title="Daily Highlights"
					articles={d.dailyHighlights}
					feeds={d.feeds}
					navigate={navigate}
				/>
				<ArticleGridSection
					title="Trending This Week"
					articles={d.trendingArticles}
					feeds={d.feeds}
					navigate={navigate}
				/>
				<ReadingStreakSection streak={d.currentStreak} />
				<ReadingStatsSection
					totalRead={d.totalRead}
					totalLiked={d.totalLiked}
					totalSaved={d.totalSaved}
				/>
				<PinnedItemsSection
					bookmarks={d.pinnedBookmarks}
					articles={d.pinnedArticles}
				/>
				<FromYourFeedsSection
					articlesByFeed={d.articlesByFeed}
					navigate={navigate}
				/>
			</div>

			<RecentActivitySection
				totalBookmarks={d.totalBookmarks}
				totalFeeds={d.totalFeeds}
				unreadArticles={d.unreadArticles}
			/>
		</div>
	);
}
