import { View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type Collection = {
	id: string;
	name: string;
};

type Props = {
	collections: Collection[];
};

export default function CollectionsSection({ collections }: Props) {
	if (collections.length <= 2) return null;

	return (
		<View className="mt-4">
			<Card>
				<CardHeader>
					<CardTitle>Collections</CardTitle>
				</CardHeader>
				<CardContent>
					<View className="flex flex-wrap gap-2">
						{collections.slice(0, 4).map((collection) => (
							<View
								key={collection.id}
								className="rounded-full bg-secondary px-3 py-1.5"
							>
								<Text className="font-medium text-secondary-foreground text-xs">
									{collection.name}
								</Text>
							</View>
						))}
						{collections.length > 4 && (
							<View className="rounded-full bg-muted px-3 py-1.5">
								<Text className="font-medium text-muted-foreground text-xs">
									+{collections.length - 4} more
								</Text>
							</View>
						)}
					</View>
				</CardContent>
			</Card>
		</View>
	);
}
