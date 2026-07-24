import { TrendingUp } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	categories: string[];
	selectedCategory: string;
	onCategoryChange: (value: string) => void;
	filteredFeeds: FeedItem[];
	subscribedFeeds: SubscribedFeed[];
	onSubscribe: (url: string, name: string) => void;
};

export default function FeedDirectoryCard({
	categories,
	selectedCategory,
	onCategoryChange,
	filteredFeeds,
	subscribedFeeds,
	onSubscribe,
}: Props) {
	return (
		<Card>
			<CardHeader>
				<View className="flex-row items-center gap-2">
					<TrendingUp size={16} className="text-primary" />
					<CardTitle>Feed Directory</CardTitle>
				</View>
				<CardDescription>
					Browse curated sources worth following
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs
					value={selectedCategory}
					onValueChange={onCategoryChange}
				>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						className="mb-4"
					>
						<TabsList>
							<TabsTrigger value="all">
								<Text className="text-xs font-medium">All</Text>
							</TabsTrigger>
							{categories.map((cat) => (
								<TabsTrigger key={cat} value={cat}>
									<Text className="text-xs font-medium">{cat}</Text>
								</TabsTrigger>
							))}
						</TabsList>
					</ScrollView>

					<TabsContent value={selectedCategory}>
						<View className="gap-2">
							{filteredFeeds.map((feed) => (
								<FeedRow
									key={feed.name}
									feed={feed}
									alreadySubscribed={subscribedFeeds.some(
										(f) => f.feedUrl === feed.url,
									)}
									onSubscribe={onSubscribe}
								/>
							))}
						</View>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
