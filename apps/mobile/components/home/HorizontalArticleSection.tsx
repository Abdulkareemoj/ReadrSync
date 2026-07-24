import type React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import HomeArticleCard from "./HomeArticleCard";

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

type Feed = {
	id: string;
	title: string;
	siteUrl?: string;
};

type Props = {
	title: string;
	icon: React.ComponentType<{ size?: number; className?: string }>;
	iconClass?: string;
	articles: Article[];
	feeds: Feed[];
};

export default function HorizontalArticleSection({
	title,
	icon: Icon,
	iconClass,
	articles,
	feeds,
}: Props) {
	if (articles.length === 0) return null;

	return (
		<View className="mt-7">
			<View className="mb-3 flex-row items-center justify-between">
				<Text className="font-semibold text-lg">{title}</Text>
				{Icon && <Icon size={18} className={iconClass} />}
			</View>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ gap: 12 }}
			>
				{articles.map((article) => (
					<HomeArticleCard
						key={article.id}
						article={article}
						feed={feeds.find((f) => f.id === article.feedId)}
					/>
				))}
			</ScrollView>
		</View>
	);
}
