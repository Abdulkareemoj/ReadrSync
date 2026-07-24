type Props = {
	totalBookmarks: number;
	totalFeeds: number;
	unreadArticles: number;
};

export default function RecentActivitySection({
	totalBookmarks,
	totalFeeds,
	unreadArticles,
}: Props) {
	return (
		<div className="mt-10">
			<h2 className="mb-4 font-semibold text-2xl text-foreground">
				Recent Activity
			</h2>
			<div className="rounded-lg border border-border bg-card p-6">
				<p className="text-muted-foreground">
					{totalBookmarks === 0 && totalFeeds === 0
						? "No recent activity yet. Start saving bookmarks or subscribing to feeds!"
						: `You have ${totalBookmarks} bookmarks and ${unreadArticles} unread articles across ${totalFeeds} feeds.`}
				</p>
			</div>
		</div>
	);
}
