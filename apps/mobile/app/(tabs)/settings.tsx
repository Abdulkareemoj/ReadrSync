import { ScrollView } from "react-native";
import AboutSection from "@/components/settings/AboutSection";
import CloudSyncSettings from "@/components/settings/CloudSyncSettings";
import DataManagement from "@/components/settings/DataManagement";
import DataSection from "@/components/settings/DataSection";
import ReadingSettings from "@/components/settings/ReadingSettings";
import ThemeSettings from "@/components/settings/ThemeSettings";

export default function Settings() {
	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerStyle={{
				paddingHorizontal: 16,
				paddingTop: 16,
				paddingBottom: 28,
			}}
			showsVerticalScrollIndicator={false}
		>
			<ThemeSettings />
			<ReadingSettings />
			<DataManagement />
			<CloudSyncSettings />
			<DataSection />
			<AboutSection />
		</ScrollView>
	);
}
