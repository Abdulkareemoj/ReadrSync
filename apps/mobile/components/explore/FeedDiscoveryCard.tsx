import type { DiscoveredFeed } from "@packages/utils";
import { Link2 } from "lucide-react-native";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import FeedRow from "./FeedRow";

type SubscribedFeed = {
	feedUrl: string;
};

type Props = {
	url: string;
	onUrlChange: (text: string) => void;
	loading: boolean;
	error: string;
	discoveredFeeds: DiscoveredFeed[];
	subscribedFeeds: SubscribedFeed[];
	onDiscover: () => void;
	onToggle: (url: string, name: string) => void;
};

export default function FeedDiscoveryCard({
	url,
	onUrlChange,
	loading,
	error,
	discoveredFeeds,
	subscribedFeeds,
	onDiscover,
	onToggle,
}: Props) {
	const subscribedUrls = new Set(
		subscribedFeeds.map((f) => f.feedUrl.toLowerCase()),
	);

	return (
		<Card>
			<CardHeader>
				<View className="flex-row items-center gap-2">
					<Link2 size={16} className="text-primary" />
					<CardTitle>Discover Feeds</CardTitle>
				</View>
				<CardDescription>
					Paste any site URL and we'll auto-detect its RSS, Atom, or JSON feeds
				</CardDescription>
			</CardHeader>
			<CardContent>
				<View className="gap-2">
					<Input
						placeholder="e.g. https://www.theverge.com"
						value={url}
						onChangeText={onUrlChange}
						returnKeyType="done"
						onSubmitEditing={onDiscover}
						autoCapitalize="none"
						autoCorrect={false}
						keyboardType="url"
					/>
					<TouchableOpacity
						onPress={onDiscover}
						disabled={loading || !url.trim()}
						className={`rounded-lg px-4 py-2.5 ${
							loading || !url.trim()
								? "bg-muted"
								: "bg-primary active:opacity-80"
						}`}
					>
						{loading ? (
							<View className="flex-row items-center justify-center gap-2">
								<ActivityIndicator size="small" color="#fff" />
								<Text className="text-center font-medium text-primary-foreground text-sm">
									Discovering...
								</Text>
							</View>
						) : (
							<Text
								className={`text-center font-medium text-sm ${
									!url.trim()
										? "text-muted-foreground"
										: "text-primary-foreground"
								}`}
							>
								Discover
							</Text>
						)}
					</TouchableOpacity>
					{error ? <Text className="text-red-500 text-xs">{error}</Text> : null}
					{discoveredFeeds.length > 0 ? (
						<View className="gap-2 pt-1">
							{discoveredFeeds.map((feed) => (
								<FeedRow
									key={feed.url}
									feed={{
										name: feed.title,
										description: feed.url,
										url: feed.url,
										category: feed.type.toUpperCase(),
										icon: feed.type === "atom" ? "📄" : "📡",
									}}
									alreadySubscribed={subscribedUrls.has(feed.url.toLowerCase())}
									onToggle={onToggle}
								/>
							))}
						</View>
					) : null}
				</View>
			</CardContent>
		</Card>
	);
}
