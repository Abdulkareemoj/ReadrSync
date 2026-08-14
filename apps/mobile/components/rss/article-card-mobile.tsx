import type { Bookmark } from "@packages/store";
import { Heart, Share2, Trash2 } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";

interface ArticleCardMobileProps {
	bookmark: Bookmark;
	onLike: (id: string) => void;
	onShare: (id: string) => void;
	onDelete: (id: string) => void;
	onPress: (id: string) => void;
}

export function ArticleCardMobile({
	bookmark,
	onLike,
	onShare,
	onDelete,
	onPress,
}: ArticleCardMobileProps) {
	return (
		<TouchableOpacity
			onPress={() => onPress(bookmark.id)}
			className="border-border border-b px-4 py-3"
		>
			<Text
				className="font-semibold text-base text-foreground"
				numberOfLines={2}
			>
				{bookmark.title}
			</Text>

			{bookmark.description ? (
				<Text className="mt-1 text-muted-foreground text-sm" numberOfLines={2}>
					{bookmark.description}
				</Text>
			) : null}

			{/* URL */}
			<Text className="mt-1 text-muted-foreground text-xs" numberOfLines={1}>
				{bookmark.url}
			</Text>

			{/* Tags */}
			{bookmark.tags && bookmark.tags.length > 0 && (
				<View className="mt-2 flex-row flex-wrap gap-2">
					{bookmark.tags.slice(0, 3).map((tag) => (
						<View key={tag} className="rounded-full bg-primary/10 px-2 py-0.5">
							<Text className="text-primary text-xs">{tag}</Text>
						</View>
					))}
				</View>
			)}

			{/* Actions */}
			<View className="mt-3 flex-row justify-end gap-3">
				<TouchableOpacity onPress={() => onLike(bookmark.id)}>
					<Heart
						size={18}
						color={bookmark.liked ? "#ef4444" : "#9ca3af"}
						fill={bookmark.liked ? "#ef4444" : "none"}
					/>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => onShare(bookmark.id)}>
					<Share2 size={18} color="#9ca3af" />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => onDelete(bookmark.id)}>
					<Trash2 size={18} color="#9ca3af" />
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	);
}
