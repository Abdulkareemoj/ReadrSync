import { View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type Props = {
	totalBookmarks: number;
	totalFeeds: number;
	unreadArticles: number;
};

export default function RecentActivityCard({
	totalBookmarks,
	totalFeeds,
	unreadArticles,
}: Props) {
	return (
		<View className="mt-7">
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<Text className="text-muted-foreground text-sm">
						{totalBookmarks === 0 && totalFeeds === 0
							? "No recent activity yet. Start saving bookmarks or subscribing to feeds!"
							: `You have ${totalBookmarks} bookmarks and ${unreadArticles} unread articles across ${totalFeeds} feeds.`}
					</Text>
				</CardContent>
			</Card>
		</View>
	);
}
