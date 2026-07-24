import { Rss } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import HomeArticleCard from "./HomeArticleCard";

type Feed = {
	id: string;
	title: string;
	siteUrl?: string;
};

type Article = {
	id: string;
	title: string;
	feedId: string;
	contentSnippet?: string;
	content?: string;
	imageUrl?: string;
	pubDate?: string;
	readTime?: number;
};

type Props = {
	articlesByFeed: { feed: Feed; articles: Article[] }[];
};

export default function FromYourFeedsSection({ articlesByFeed }: Props) {
	const hasArticles = articlesByFeed.some((f) => f.articles.length > 0);
	if (!hasArticles) return null;

	return (
		<View className="mt-7">
			<View className="mb-3 flex-row items-center justify-between">
				<Text className="font-semibold text-lg">From Your Feeds</Text>
				<Rss size={18} className="text-purple-500" />
			</View>
			{articlesByFeed.map(
				({ feed, articles }) =>
					articles.length > 0 && (
						<View key={feed.id} className="mb-4">
							<Text className="mb-2 font-semibold text-sm">
								{feed.title}
							</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={{ gap: 12 }}
							>
								{articles.map((article) => (
									<HomeArticleCard
										key={article.id}
										article={article}
										feed={feed}
									/>
								))}
							</ScrollView>
						</View>
					),
			)}
		</View>
	);
}
