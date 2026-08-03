import { Highlighter, MessageCircle, X } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface HighlightMenuMobileProps {
	onHighlight: (color: string) => void;
	onAnnotate: () => void;
	onClose: () => void;
}

export function HighlightMenuMobile({
	onHighlight,
	onAnnotate,
	onClose,
}: HighlightMenuMobileProps) {
	const colors = [
		{ name: "yellow", hex: "#fbbf24" },
		{ name: "green", hex: "#86efac" },
		{ name: "blue", hex: "#60a5fa" },
		{ name: "pink", hex: "#f472b6" },
	];

	return (
		<View className="mx-4 mb-4 rounded-lg bg-white p-4 shadow-lg">
			<View className="mb-3 flex-row items-center justify-between">
				<Text className="font-semibold text-gray-900">Highlight</Text>
				<TouchableOpacity onPress={onClose}>
					<X size={20} color="#6b7280" />
				</TouchableOpacity>
			</View>

			<View className="mb-3 flex-row gap-2">
				{colors.map((color) => (
					<TouchableOpacity
						key={color.name}
						onPress={() => onHighlight(color.name)}
						className="flex-1 rounded-lg py-2"
						style={{ backgroundColor: color.hex }}
					>
						<Highlighter size={20} color="white" />
					</TouchableOpacity>
				))}
			</View>

			<TouchableOpacity
				onPress={onAnnotate}
				className="flex-row items-center justify-center rounded-lg bg-gray-100 py-2"
			>
				<MessageCircle size={18} color="#6b7280" />
				<Text className="ml-2 font-medium text-gray-700">Add Note</Text>
			</TouchableOpacity>
		</View>
	);
}
