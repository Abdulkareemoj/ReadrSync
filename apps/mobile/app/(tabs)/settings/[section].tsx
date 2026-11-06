import { Redirect, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	isSettingsSectionKey,
	SETTINGS_SECTIONS,
} from "@/components/settings/registry";
import { ScreenHeader } from "@/components/ui/screen-header";

export default function SettingsSectionPage() {
	const { section } = useLocalSearchParams<{ section: string }>();

	if (!isSettingsSectionKey(section)) {
		return <Redirect href="/(tabs)/settings" />;
	}
	const { label, component: SectionComponent } = SETTINGS_SECTIONS[section];

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			<ScreenHeader title={label} />

			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingTop: 16,
					paddingBottom: 28,
				}}
				showsVerticalScrollIndicator={false}
			>
				<SectionComponent />
			</ScrollView>
		</SafeAreaView>
	);
}
