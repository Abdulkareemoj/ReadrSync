import AppearanceSection from "./AppearanceSection";
import { useSettings } from "./hooks";

/** Registry adapter: feeds the existing prop-driven section from useSettings(). */
export function AppearanceSettingsSection() {
	const settings = useSettings();

	return (
		<AppearanceSection
			theme={settings.theme}
			readerFontSize={settings.readerFontSize}
			onThemeChange={settings.handleThemeChange}
			onFontSizeChange={settings.setReaderFontSize}
		/>
	);
}
