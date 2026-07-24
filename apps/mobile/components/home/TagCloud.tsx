import { Tag } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

type Props = {
	tags: { tag: string; count: number }[];
};

export default function TagCloud({ tags }: Props) {
	if (tags.length === 0) return null;

	return (
		<View className="mt-7">
			<View className="mb-3 flex-row items-center justify-between">
				<Text className="font-semibold text-lg">Popular Tags</Text>
				<Tag size={18} className="text-blue-500" />
			</View>
			<View className="flex flex-wrap gap-2">
				{tags.map(({ tag, count }) => (
					<View
						key={tag}
						className="rounded-full bg-secondary px-3 py-1.5"
					>
						<Text className="font-medium text-secondary-foreground text-xs">
							{tag} ({count})
						</Text>
					</View>
				))}
			</View>
		</View>
	);
}
