import { Flame } from "lucide-react-native";
import { View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type Props = {
	currentStreak: number;
};

export default function ReadingStreakCard({ currentStreak }: Props) {
	if (currentStreak === 0) return null;

	return (
		<View className="mt-7">
			<Card>
				<CardHeader>
					<View className="flex-row items-center gap-2">
						<Flame size={20} className="text-orange-500" />
						<CardTitle>Reading Streak</CardTitle>
					</View>
				</CardHeader>
				<CardContent>
					<Text className="font-bold text-2xl text-primary">
						{currentStreak} day{currentStreak !== 1 ? "s" : ""}
					</Text>
					<Text className="text-muted-foreground text-sm">
						Keep up the great work!
					</Text>
				</CardContent>
			</Card>
		</View>
	);
}
