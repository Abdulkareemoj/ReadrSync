import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface CollectionTabsProps {
	collections: Array<{ id: string; label: string }>;
	activeCollection: string;
	onCollectionChange: (id: string) => void;
}

export function CollectionTabs({
	collections,
	activeCollection,
	onCollectionChange,
}: CollectionTabsProps) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			className="border-gray-100 border-b bg-white"
		>
			<View className="flex-row px-4 py-2">
				{collections.map((collection) => (
					<TouchableOpacity
						key={collection.id}
						onPress={() => onCollectionChange(collection.id)}
						className={`mr-2 rounded-full px-4 py-2 ${
							activeCollection === collection.id ? "bg-blue-500" : "bg-gray-100"
						}`}
					>
						<Text
							className={`font-medium capitalize ${
								activeCollection === collection.id
									? "text-white"
									: "text-gray-700"
							}`}
						>
							{collection.label}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		</ScrollView>
	);
}
