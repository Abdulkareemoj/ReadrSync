import { type Href, useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import {
	SETTINGS_SECTION_ORDER,
	SETTINGS_SECTIONS,
} from "@/components/settings/registry";
import { Text } from "@/components/ui/text";

export default function SettingsIndex() {
	const router = useRouter();

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingTop: 16,
					paddingBottom: 28,
				}}
				showsVerticalScrollIndicator={false}
			>
				{SETTINGS_SECTION_ORDER.map((key) => {
					const section = SETTINGS_SECTIONS[key];
					return (
						<Pressable
							key={key}
							onPress={() => router.push(`/(tabs)/settings/${key}` as Href)}
							className="mb-3 flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 active:opacity-80"
						>
							<View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
								<section.icon size={18} className="text-primary" />
							</View>
							<View className="min-w-0 flex-1">
								<Text className="font-semibold text-foreground">
									{section.label}
								</Text>
								<Text
									className="mt-0.5 text-muted-foreground text-xs"
									numberOfLines={1}
								>
									{section.blurb}
								</Text>
							</View>
							<ChevronRight size={16} className="text-muted-foreground" />
						</Pressable>
					);
				})}
			</ScrollView>
		</View>
	);
}
