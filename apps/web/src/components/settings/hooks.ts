import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { getInitializedAgents } from "@/lib/agents";
import { useSettingsStore } from "@/lib/store";
import type { ExportFormat } from "@/lib/sync";
import { detectFormat, exportSyncData, importSyncData } from "@/lib/sync";

export function useSettings() {
	const { theme, setTheme } = useTheme();
	const setReaderTheme = useSettingsStore((state) => state.setTheme);
	const {
		syncStatus,
		setSyncStatus,
		readerFontSize,
		setReaderFontSize,
		isAuthenticated,
		authEmail,
		setAuth,
		clearAuth,
	} = useSettingsStore();

	const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
	const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
	const [lastSync, setLastSync] = useState<string | null>(null);
	const [showConnectDialog, setShowConnectDialog] = useState(false);
	const [errorDialog, setErrorDialog] = useState<{
		title: string;
		message: string;
	} | null>(null);

	const handleThemeChange = (value: string) => {
		setTheme(value as "light" | "dark" | "system");
		if (value !== "system") {
			setReaderTheme(value as "light" | "dark");
		}
	};

	const handleExport = async () => {
		setSyncStatus("syncing");
		try {
			const result = await exportSyncData(exportFormat);
			const blob = new Blob([result.data], { type: result.mime });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = result.filename;
			a.click();
			URL.revokeObjectURL(url);
			setLastSync(new Date().toISOString());
			setSyncStatus("connected");
		} catch (e) {
			console.error("Export failed:", e);
			setSyncStatus("error");
		}
	};

	const handleImport = async () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json,.opml,.html,.htm";
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			setSyncStatus("syncing");
			try {
				const text = await file.text();
				const format = detectFormat(text);
				if (format === "unknown") {
					throw new Error(
						"Unrecognized file format. Use JSON, OPML, or HTML bookmark files.",
					);
				}
				await importSyncData(text, format, importMode);
				setLastSync(new Date().toISOString());
				setSyncStatus("connected");
				window.location.reload();
			} catch (err) {
				console.error("Import failed:", err);
				setSyncStatus("error");
			}
		};
		input.click();
	};

	const handleClearCache = () => {
		if (typeof indexedDB !== "undefined") {
			const req = indexedDB.deleteDatabase("bookmark_tool_web");
			req.onsuccess = () => window.location.reload();
			req.onerror = () => console.error("Failed to clear cache");
		}
	};

	const handleSignIn = async () => {
		try {
			const agents = getInitializedAgents();
			const result = await agents.authAgent.signIn("gdrive");
			if (result.success) {
				const info = await agents.authAgent.getUserInfo();
				setAuth({
					isAuthenticated: true,
					provider: "gdrive",
					email: info?.email ?? null,
				});
			} else {
				setErrorDialog({
					title: "Unable to connect",
					message:
						result.error ??
						"Connection failed. Google Drive sync is only available on the desktop app.",
				});
			}
		} catch (e) {
			setErrorDialog({
				title: "Connection error",
				message: (e as Error).message,
			});
		}
	};

	const handleSignOut = async () => {
		try {
			const agents = getInitializedAgents();
			await agents.authAgent.signOut();
		} catch {
			/* ignore */
		}
		clearAuth();
	};

	const handleSyncNow = async () => {
		setSyncStatus("syncing");
		try {
			const { getReaderStore } = await import("@packages/store");
			const store = getReaderStore();
			if (!store) throw new Error("Store not initialized");
			const result = await store.getState().triggerSync();
			setSyncStatus(result.success ? "connected" : "error");
			if (result.syncedAt) setLastSync(result.syncedAt);
		} catch (e) {
			console.error("Sync failed:", e);
			setSyncStatus("error");
		}
	};

	useEffect(() => {
		if (isAuthenticated) return;
		const agents = getInitializedAgents();
		agents.authAgent.isSignedIn().then((signedIn) => {
			if (!signedIn) return;
			agents.authAgent.getUserInfo().then((info) => {
				setAuth({
					isAuthenticated: true,
					provider: "gdrive",
					email: info?.email ?? null,
				});
			});
		});
	}, []);

	const statusLabel =
		syncStatus === "connected"
			? "Connected"
			: syncStatus === "syncing"
				? "Syncing"
				: syncStatus === "error"
					? "Error"
					: "Idle";

	return {
		theme,
		readerFontSize,
		setReaderFontSize,
		importMode,
		setImportMode,
		exportFormat,
		setExportFormat,
		lastSync,
		isAuthenticated,
		authEmail,
		syncStatus,
		showConnectDialog,
		setShowConnectDialog,
		errorDialog,
		setErrorDialog,
		statusLabel,
		handleThemeChange,
		handleExport,
		handleImport,
		handleClearCache,
		handleSignIn,
		handleSignOut,
		handleSyncNow,
	};
}
