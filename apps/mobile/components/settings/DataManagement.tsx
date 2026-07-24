import { Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { useClearCache } from "./hooks";

export default function DataManagement() {
	const { handleClearCache } = useClearCache();

	return (
		<Card className="mb-4">
			<View className="px-4 py-3">
				<Text className="mb-1 font-semibold text-foreground text-lg">
					Data Management
				</Text>
				<Text className="mb-4 text-muted-foreground text-sm">
					Manage local storage and cached content
				</Text>
				<Separator className="mb-4" />
				<Button
					onPress={handleClearCache}
					variant="destructive"
					className="w-full"
				>
					<Icon as={Trash2} size={16} className="mr-2" />
					<Text>Clear Cache</Text>
				</Button>
			</View>
		</Card>
	);
}
