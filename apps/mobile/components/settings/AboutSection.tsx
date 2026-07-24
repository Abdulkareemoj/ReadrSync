import { Text, View } from "react-native";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutSection() {
	return (
		<Card>
			<View className="px-4 py-3">
				<Text className="mb-3 font-semibold text-foreground text-lg">
					About
				</Text>
				<Separator className="mb-4" />
				<View className="gap-3">
					<View className="flex-row justify-between">
						<Text className="text-muted-foreground">Version</Text>
						<Text className="font-medium">1.0.0</Text>
					</View>
					<View className="flex-row justify-between">
						<Text className="text-muted-foreground">Build</Text>
						<Text className="font-medium">2024.04.12</Text>
					</View>
				</View>
			</View>
		</Card>
	);
}
