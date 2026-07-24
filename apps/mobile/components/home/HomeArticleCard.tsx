import { Image } from "expo-image";
import { router } from "expo-router";
import { Rss } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

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
	article: Article;
	feed?: Feed;
};

export default function HomeArticleCard({ article, feed }: Props) {
	return (
		<Pressable
			onPress={() => router.push(`/(tabs)/rss/${article.id}`)}
			className="w-72 overflow-hidden rounded-lg border border-border bg-card"
		>
			{article.imageUrl ? (
				<Image
					source={{ uri: article.imageUrl }}
					className="h-32 w-full"
					contentFit="cover"
				/>
			) : (
				<View className="h-32 w-full items-center justify-center bg-muted/50">
					<View className="flex-col items-center gap-1">
						<Rss size={28} className="text-muted-foreground/60" />
						<Text className="text-muted-foreground/40 text-xs">No image</Text>
					</View>
				</View>
			)}

			<View className="p-3">
				<View className="mb-2 flex-row items-center gap-2">
					<View className="rounded-full bg-primary/10 px-2 py-1">
						<Text className="font-medium text-primary text-xs">
							{feed?.title || "RSS"}
						</Text>
					</View>
					<Text className="text-muted-foreground text-xs">
						{article.readTime || 5} min read
					</Text>
				</View>

				<Text
					className="mb-1 font-semibold text-base"
					numberOfLines={2}
				>
					{article.title}
				</Text>

				<Text
					className="mb-2 text-muted-foreground text-xs"
					numberOfLines={2}
				>
					{article.contentSnippet || article.content || ""}
				</Text>

				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center gap-2">
						{feed?.siteUrl ? (
							<Image
								source={{
									uri: `https://www.google.com/s2/favicons?domain=${new URL(feed.siteUrl).hostname}&sz=64`,
								}}
								className="h-5 w-5 rounded-full"
								contentFit="cover"
							/>
						) : (
							<View className="h-5 w-5 items-center justify-center rounded-full bg-primary/20">
								<Text className="font-medium text-[8px] text-primary">
									{(feed?.title || "U").charAt(0).toUpperCase()}
								</Text>
							</View>
						)}
						<View>
							<Text className="font-medium text-foreground text-xs">
								{feed?.title || "Unknown"}
							</Text>
							<Text className="text-muted-foreground text-xs">
								{article.pubDate
									? new Date(article.pubDate).toLocaleDateString()
									: ""}
							</Text>
						</View>
					</View>
				</View>
			</View>
		</Pressable>
	);
}
