import { View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type Props = {
	readCount: number;
	savedCount: number;
	unreadCount: number;
};

export default function ReadingStatsCard({
	readCount,
	savedCount,
	unreadCount,
}: Props) {
	return (
		<View className="mt-4">
			<Card>
				<CardHeader>
					<CardTitle>Reading Stats</CardTitle>
				</CardHeader>
				<CardContent>
					<View className="flex-row justify-between">
						<View>
							<Text className="font-bold text-2xl text-primary">
								{readCount}
							</Text>
							<Text className="text-muted-foreground text-xs">Read</Text>
						</View>
						<View>
							<Text className="font-bold text-2xl text-primary">
								{savedCount}
							</Text>
							<Text className="text-muted-foreground text-xs">Saved</Text>
						</View>
						<View>
							<Text className="font-bold text-2xl text-primary">
								{unreadCount}
							</Text>
							<Text className="text-muted-foreground text-xs">Unread</Text>
						</View>
					</View>
				</CardContent>
			</Card>
		</View>
	);
}
