import { Plus } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

type FeedItem = {
	name: string;
	url: string;
	icon: string;
	category: string;
	description: string;
};

type Props = {
	feed: FeedItem;
	alreadySubscribed: boolean;
	onSubscribe: (url: string, name: string) => void;
};

export default function FeedRow({ feed, alreadySubscribed, onSubscribe }: Props) {
	return (
		<View className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-3">
			<View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
				<Text className="text-sm">{feed.icon}</Text>
			</View>
			<View className="flex-1">
				<View className="flex-row items-center gap-2">
					<Text className="flex-1 font-medium text-foreground text-sm">
						{feed.name}
					</Text>
					<View className="rounded-full bg-secondary px-2 py-0.5">
						<Text className="text-secondary-foreground text-[10px] font-medium">
							{feed.category}
						</Text>
					</View>
				</View>
				<Text className="mt-0.5 text-muted-foreground text-sm">
					{feed.description}
				</Text>
			</View>
			<Pressable
				className={`h-8 w-8 items-center justify-center rounded-lg border ${
					alreadySubscribed
						? "border-border bg-muted/40 opacity-50"
						: "border-border bg-muted/40 active:opacity-80"
				}`}
				disabled={alreadySubscribed}
				onPress={() => onSubscribe(feed.url, feed.name)}
			>
				<Icon as={Plus} size={16} className="text-muted-foreground" />
			</Pressable>
		</View>
	);
}
