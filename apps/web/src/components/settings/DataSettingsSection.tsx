import DataSection from "./DataSection";
import { useSettings } from "./hooks";

/** Registry adapter: feeds the existing prop-driven section from useSettings(). */
export function DataSettingsSection() {
	const settings = useSettings();

	return (
		<DataSection
			exportFormat={settings.exportFormat}
			importMode={settings.importMode}
			onExportFormatChange={settings.setExportFormat}
			onImportModeChange={settings.setImportMode}
			onExport={settings.handleExport}
			onImport={settings.handleImport}
			onClearCache={settings.handleClearCache}
		/>
	);
}
