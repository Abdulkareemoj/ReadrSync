import { Rss } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";

type Props = {
	title: string;
	desc: string;
	action?: { label: string; onPress: () => void };
};

export default function EmptyCard({ title, desc, action }: Props) {
	return (
		<View className="flex flex-col items-center justify-center gap-2 py-10">
			<View className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/40">
				<Rss size={16} className="text-muted-foreground" />
			</View>
			<Text className="text-center font-medium text-foreground text-sm">
				{title}
			</Text>
			<Text className="max-w-[240px] text-center text-muted-foreground text-sm leading-relaxed">
				{desc}
			</Text>
			{action && (
				<TouchableOpacity
					onPress={action.onPress}
					className="mt-2 rounded-lg bg-primary px-4 py-2 active:opacity-70"
				>
					<Text className="font-medium text-primary-foreground text-sm">
						{action.label}
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}
