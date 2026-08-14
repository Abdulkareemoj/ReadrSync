import { createFileRoute } from "@tanstack/react-router";
import AboutSection from "@/components/settings/AboutSection";
import AppearanceSection from "@/components/settings/AppearanceSection";
import CloudSyncSection from "@/components/settings/CloudSyncSection";
import DataSection from "@/components/settings/DataSection";
import ErrorDialog from "@/components/settings/ErrorDialog";
import { useSettings } from "@/components/settings/hooks";
import YouTubeSection from "@/components/settings/YouTubeSection";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/settings")({
	component: SettingsComponent,
});

function SettingsComponent() {
	const s = useSettings();

	return (
		<div className="min-h-screen bg-background">
			<div className="border-border border-b px-6 py-6">
				<h1 className="font-semibold text-2xl text-foreground">Settings</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Manage your reading experience and data
				</p>
			</div>

			<div className="mx-auto max-w-3xl px-6 py-8">
				<div className="flex flex-col gap-12">
					<AppearanceSection
						theme={s.theme}
						readerFontSize={s.readerFontSize}
						onThemeChange={s.handleThemeChange}
						onFontSizeChange={s.setReaderFontSize}
					/>

					<Separator />

					<DataSection
						exportFormat={s.exportFormat}
						importMode={s.importMode}
						onExportFormatChange={s.setExportFormat}
						onImportModeChange={s.setImportMode}
						onExport={s.handleExport}
						onImport={s.handleImport}
						onClearCache={s.handleClearCache}
					/>

					<Separator />

					<CloudSyncSection
						isAuthenticated={s.isAuthenticated}
						authEmail={s.authEmail}
						syncStatus={s.syncStatus}
						statusLabel={s.statusLabel}
						lastSync={s.lastSync}
						showConnectDialog={s.showConnectDialog}
						onConnectDialogChange={s.setShowConnectDialog}
						onSignIn={s.handleSignIn}
						onSignOut={s.handleSignOut}
						onSyncNow={s.handleSyncNow}
					/>

					<Separator />

					<YouTubeSection />

					<Separator />

					<AboutSection />
				</div>
			</div>

			<ErrorDialog
				error={s.errorDialog}
				onClose={() => s.setErrorDialog(null)}
			/>
		</div>
	);
}
