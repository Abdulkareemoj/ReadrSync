import { useRouter } from "expo-router";
import { ArrowLeft, Search, X } from "lucide-react-native";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

/**
 * The one mobile header pattern: a compact border-bottom row — back chevron
 * when the screen is pushed, title left, at most one action right. Rendered
 * inside the screen's SafeAreaView (edges={["top"]}).
 *
 * Pass `search` to get the expand-in-place search input: the search button
 * swaps the title for a text input and calls back on every keystroke.
 */
export function ScreenHeader({
	title,
	back = true,
	right,
	search,
}: {
	title?: string;
	back?: boolean;
	right?: ReactNode;
	search?: { value: string; onChange: (q: string) => void };
}) {
	const router = useRouter();
	const [editing, setEditing] = useState(false);

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
			{search && editing ? (
				<Input
					value={search.value}
					onChangeText={search.onChange}
					placeholder={`Search ${title ?? ""}...`.trim()}
					autoFocus
					className="h-9 flex-1"
				/>
			) : (
				title && (
					<Text
						className="font-semibold text-foreground text-lg"
						numberOfLines={1}
					>
						{title}
					</Text>
				)
			)}
			<View className="flex-1" />
			{search && (
				<Pressable
					onPress={() => {
						if (editing) search.onChange("");
						setEditing((prev) => !prev);
					}}
					className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
					hitSlop={8}
				>
					{editing ? (
						<X size={20} className="text-foreground" />
					) : (
						<Search size={20} className="text-muted-foreground" />
					)}
				</Pressable>
			)}
			{right}
		</View>
	);
}
