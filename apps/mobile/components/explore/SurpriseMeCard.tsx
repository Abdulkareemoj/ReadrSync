import { Shuffle } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import FeedRow from "./FeedRow";

type FeedItem = {
	name: string;
	url: string;
	icon: string;
	category: string;
	description: string;
};

type SubscribedFeed = {
	feedUrl: string;
};

type Props = {
	feeds: FeedItem[];
	subscribedFeeds: SubscribedFeed[];
	onSubscribe: (url: string, name: string) => void;
	onShuffle: () => void;
};

export default function SurpriseMeCard({
	feeds,
	subscribedFeeds,
	onSubscribe,
	onShuffle,
}: Props) {
	return (
		<Card>
			<CardHeader>
				<View className="flex-row items-center gap-2">
					<Shuffle size={16} className="text-primary" />
					<CardTitle>Surprise Me</CardTitle>
				</View>
				<CardDescription>
					Not sure what to follow? Try a random pick
				</CardDescription>
			</CardHeader>
			<CardContent>
				{feeds.map((feed) => (
					<View key={feed.name} className="mb-2">
						<FeedRow
							feed={feed}
							alreadySubscribed={subscribedFeeds.some(
								(f) => f.feedUrl === feed.url,
							)}
							onSubscribe={onSubscribe}
						/>
					</View>
				))}
				<TouchableOpacity
					onPress={onShuffle}
					className="mt-2 flex-row items-center justify-center gap-2 rounded-lg border border-border py-2.5"
				>
					<Shuffle size={16} className="text-muted-foreground" />
					<Text className="text-muted-foreground text-sm font-medium">
						Shuffle
					</Text>
				</TouchableOpacity>
			</CardContent>
		</Card>
	);
}
