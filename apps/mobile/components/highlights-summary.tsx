import type { Highlight } from "@packages/store";
import { Trash2 } from "lucide-react-native";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";

interface HighlightsSummaryProps {
	highlights: Highlight[];
	onDeleteHighlight: (id: string) => void;
}

const COLOR_MAP: Record<string, string> = {
	yellow: "#fbbf24",
	green: "#86efac",
	blue: "#60a5fa",
	pink: "#f472b6",
};

export function HighlightsSummary({
	highlights,
	onDeleteHighlight,
}: HighlightsSummaryProps) {
	if (highlights.length === 0) return null;

	return (
		<View className="mt-6 border-border border-t pt-4">
			<Text className="mb-3 font-bold text-base text-foreground">
				Highlights ({highlights.length})
			</Text>
			<ScrollView>
				{highlights.map((highlight) => (
					<View
						key={highlight.id}
						className="mb-3 rounded-xl border-l-4 bg-muted/40 p-3"
						style={{ borderLeftColor: COLOR_MAP[highlight.color] ?? "#3b82f6" }}
					>
						<Text className="mb-2 text-foreground text-sm italic">
							"{highlight.text}"
						</Text>
						{highlight.annotations.length > 0 && (
							<View className="mb-2 gap-1 rounded-lg bg-card p-2">
								{highlight.annotations.map((annotation) => (
									<Text
										key={annotation.id}
										className="text-muted-foreground text-xs"
									>
										💬 {annotation.text}
									</Text>
								))}
							</View>
						)}
						<TouchableOpacity
							onPress={() => onDeleteHighlight(highlight.id)}
							className="self-end"
						>
							<Trash2 size={16} color="#ef4444" />
						</TouchableOpacity>
					</View>
				))}
			</ScrollView>
		</View>
	);
}
