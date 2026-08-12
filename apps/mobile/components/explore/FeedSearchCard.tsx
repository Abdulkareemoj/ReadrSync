import { Search, TrendingUp } from "lucide-react-native";
import {
	ActivityIndicator,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
	query: string;
	onQueryChange: (value: string) => void;
	loading: boolean;
	error: string;
	results: FeedItem[];
	subscribedFeeds: SubscribedFeed[];
	onSearch: () => void;
	onToggle: (url: string, name: string) => void;
};

export default function FeedSearchCard({
	query,
	onQueryChange,
	loading,
	error,
	results,
	subscribedFeeds,
	onSearch,
	onToggle,
}: Props) {
	const subscribedUrls = new Set(
		subscribedFeeds.map((f) => f.feedUrl.toLowerCase()),
	);

	return (
		<Card>
			<CardHeader>
				<View className="flex-row items-center gap-2">
					<TrendingUp size={16} className="text-primary" />
					<CardTitle>Search Feeds</CardTitle>
				</View>
				<CardDescription>
					Search the web for feeds worth following
				</CardDescription>
			</CardHeader>
			<CardContent>
				<View className="gap-2">
					<View className="flex-row items-center gap-2">
						<View className="flex-1 flex-row items-center rounded-lg border border-border bg-muted/40 px-3">
							<Search size={16} className="mr-2 text-muted-foreground" />
							<TextInput
								placeholder="e.g. machine learning, cooking, finance"
								placeholderTextColor="#9ca3af"
								value={query}
								onChangeText={onQueryChange}
								returnKeyType="search"
								onSubmitEditing={onSearch}
								autoCapitalize="none"
								autoCorrect={false}
								className="flex-1 py-2 text-foreground text-sm"
							/>
						</View>
						<TouchableOpacity
							onPress={onSearch}
							disabled={loading || !query.trim()}
							className={`rounded-lg px-4 py-2.5 ${
								loading || !query.trim()
									? "bg-muted"
									: "bg-primary active:opacity-80"
							}`}
						>
							{loading ? (
								<ActivityIndicator size="small" color="#fff" />
							) : (
								<Text
									className={`font-medium text-sm ${
										!query.trim()
											? "text-muted-foreground"
											: "text-primary-foreground"
									}`}
								>
									Search
								</Text>
							)}
						</TouchableOpacity>
					</View>
					{error ? <Text className="text-red-500 text-xs">{error}</Text> : null}
					{results.length > 0 ? (
						<View className="gap-2 pt-1">
							{results.map((feed) => (
								<FeedRow
									key={feed.url}
									feed={feed}
									alreadySubscribed={subscribedUrls.has(feed.url.toLowerCase())}
									onToggle={onToggle}
								/>
							))}
						</View>
					) : null}
					{!loading && results.length === 0 && !error ? (
						<Text className="py-4 text-center text-muted-foreground text-sm">
							Search by topic to discover feeds you can follow.
						</Text>
					) : null}
				</View>
			</CardContent>
		</Card>
	);
}
