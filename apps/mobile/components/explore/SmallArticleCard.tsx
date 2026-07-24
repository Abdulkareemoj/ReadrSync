import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useReaderStore } from "@/lib/store";

export default function SmallArticleCard({ articleId }: { articleId: string }) {
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);
	const article = articles.find((a) => a.id === articleId);
	if (!article) return null;
	const feed = feeds.find((f) => f.id === article.feedId);

	return (
		<Pressable
			onPress={() => router.push(`/(tabs)/rss/${article.id}`)}
			className="mb-2 overflow-hidden rounded-xl border border-border bg-card"
		>
			{article.imageUrl && (
				<Image
					source={{ uri: article.imageUrl }}
					className="h-28 w-full"
					contentFit="cover"
				/>
			)}
			<View className="p-3">
				<View className="mb-1 flex-row items-center gap-2">
					<View className="rounded-full bg-primary/10 px-2 py-0.5">
						<Text className="text-primary text-[10px] font-medium">
							{feed?.title || "RSS"}
						</Text>
					</View>
					<Text className="text-muted-foreground text-[10px]">
						{article.readTime || 3} min
					</Text>
				</View>
				<Text className="font-semibold text-sm" numberOfLines={2}>
					{article.title}
				</Text>
				<Text className="mt-1 text-muted-foreground text-xs" numberOfLines={2}>
					{article.contentSnippet || article.content || ""}
				</Text>
			</View>
		</Pressable>
	);
}
