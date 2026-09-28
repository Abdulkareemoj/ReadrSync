import CloudSyncSection from "./CloudSyncSection";
import ErrorDialog from "./ErrorDialog";
import { useSettings } from "./hooks";

/** Registry adapter: feeds the existing prop-driven section from useSettings().
 *  Owns the connect-flow error dialog (raised by handleSignIn/handleSignOut). */
export function SyncSettingsSection() {
	const settings = useSettings();

	return (
		<>
			<CloudSyncSection
				isAuthenticated={settings.isAuthenticated}
				authEmail={settings.authEmail}
				syncStatus={settings.syncStatus}
				statusLabel={settings.statusLabel}
				lastSync={settings.lastSync}
				showConnectDialog={settings.showConnectDialog}
				onConnectDialogChange={settings.setShowConnectDialog}
				onSignIn={settings.handleSignIn}
				onSignOut={settings.handleSignOut}
				onSyncNow={settings.handleSyncNow}
			/>
			<ErrorDialog
				error={settings.errorDialog}
				onClose={() => settings.setErrorDialog(null)}
			/>
		</>
	);
}
