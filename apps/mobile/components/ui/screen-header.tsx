import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

/**
 * The one mobile header pattern: a compact border-bottom row — back chevron
 * when the screen is pushed, title left, at most one action right. Rendered
 * inside the screen's SafeAreaView (edges={["top"]}).
 */
export function ScreenHeader({
	title,
	back = true,
	right,
}: {
	title?: string;
	back?: boolean;
	right?: ReactNode;
}) {
	const router = useRouter();

	return (
		<View className="flex-row items-center gap-2 border-border border-b px-4 py-2.5">
			{back && (
				<Pressable
					onPress={() => router.back()}
					className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
					hitSlop={8}
				>
					<ArrowLeft size={20} className="text-foreground" />
				</Pressable>
			)}
			{title && (
				<Text
					className="font-semibold text-foreground text-lg"
					numberOfLines={1}
				>
					{title}
				</Text>
			)}
			<View className="flex-1" />
			{right}
		</View>
	);
}
