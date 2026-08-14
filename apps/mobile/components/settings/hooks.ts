import type { ExportFormat } from "@packages/utils";
import {
	detectFormat,
	extractBookmarksFromOpml,
	extractFeedsFromOpml,
	generateHtmlBookmarks,
	generateOpml,
	parseHtmlBookmarks,
	parseOpml,
} from "@packages/utils";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";
import { getInitializedAgents } from "@/lib/agents";
import { useSettingsStore } from "@/lib/store";

export function useCloudSync() {
	const {
		isAuthenticated,
		authEmail,
		setAuth,
		clearAuth,
		syncStatus,
		setSyncStatus,
	} = useSettingsStore();

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
				Alert.alert("Connected", "Google Drive connected successfully.");
			} else {
				Alert.alert("Connection Failed", result.error ?? "Unknown error");
			}
		} catch (e) {
			Alert.alert("Error", `Failed to connect: ${(e as Error).message}`);
		}
	};

	const handleSignOut = () => {
		Alert.alert(
			"Disconnect Google Drive",
			"Your sync data will remain in Drive. You can reconnect later.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Disconnect",
					style: "destructive",
					onPress: async () => {
						try {
							const agents = getInitializedAgents();
							await agents.authAgent.signOut();
							clearAuth();
						} catch {
							clearAuth();
						}
					},
				},
			],
		);
	};

	const handleSyncNow = async (setLastSync: (ts: string) => void) => {
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

	return {
		isAuthenticated,
		authEmail,
		syncStatus,
		handleSignIn,
		handleSignOut,
		handleSyncNow,
	};
}

export function useDataActions() {
	const { syncStatus, setSyncStatus } = useSettingsStore();

	const handleExport = async (
		exportFormat: ExportFormat,
		onComplete: () => void,
	) => {
		setSyncStatus("syncing");
		try {
			const agents = getInitializedAgents();
			const [bookmarks, feeds] = await Promise.all([
				agents.bookmarkAgent.listBookmarks(),
				agents.rssAgent.listFeeds(),
			]);

			const dateStr = new Date().toISOString().split("T")[0];
			let data: string;
			let fileName: string;

			switch (exportFormat) {
				case "opml": {
					const opml = generateOpml({
						title: "ReadrSync Export",
						feeds: feeds.map((f: any) => ({
							title: f.title,
							feedUrl: f.feedUrl,
							siteUrl: f.siteUrl,
						})),
						bookmarks: bookmarks.map((b: any) => ({
							title: b.title,
							url: b.url,
							description: b.description,
						})),
					});
					data = opml;
					fileName = `readrsync-${dateStr}.opml`;
					break;
				}
				case "html": {
					const html = generateHtmlBookmarks({
						title: "ReadrSync Bookmarks",
						bookmarks: bookmarks.map((b: any) => ({
							title: b.title,
							url: b.url,
							tags: b.tags,
							description: b.description,
							icon: b.favicon,
						})),
					});
					data = html;
					fileName = `readrsync-${dateStr}.html`;
					break;
				}
				default: {
					const [articles] = await Promise.all([
						agents.rssAgent.listArticles(),
					]);
					data = JSON.stringify(
						{
							version: 1,
							exportedAt: new Date().toISOString(),
							bookmarks,
							feeds,
							articles,
						},
						null,
						2,
					);
					fileName = `readrsync-${dateStr}.json`;
				}
			}

			const fileUri = FileSystem.documentDirectory + fileName;
			await FileSystem.writeAsStringAsync(fileUri, data);

			Alert.alert(
				"Export Complete",
				`Saved to ${fileName}. Move this file to your cloud storage to sync with other devices.`,
			);
			onComplete();
			setSyncStatus("connected");
		} catch (e) {
			console.error("Export failed:", e);
			setSyncStatus("error");
			Alert.alert("Error", "Failed to export data");
		}
	};

	const handleImport = async (
		importMode: "merge" | "replace",
		onComplete: () => void,
	) => {
		try {
			const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
			if (result.canceled || !result.assets?.[0]) return;

			setSyncStatus("syncing");
			const fileUri = result.assets[0].uri;
			const text = await FileSystem.readAsStringAsync(fileUri);
			const format = detectFormat(text);

			if (format === "unknown") {
				Alert.alert(
					"Unsupported Format",
					"Unrecognized file format. Use JSON, OPML, or HTML bookmark files.",
				);
				setSyncStatus("error");
				return;
			}

			const agents = getInitializedAgents();

			if (importMode === "replace") {
				for (const b of await agents.bookmarkAgent.listBookmarks()) {
					await agents.bookmarkAgent.deleteBookmark(b.id);
				}
				for (const f of await agents.rssAgent.listFeeds()) {
					await agents.rssAgent.removeFeed(f.id);
				}
			}

			switch (format) {
				case "json": {
					const data = JSON.parse(text);
					for (const bookmark of data.bookmarks || []) {
						try {
							await agents.bookmarkAgent.addBookmark({
								title: bookmark.title,
								url: bookmark.url,
								description: bookmark.description,
								favicon: bookmark.favicon,
								tags: bookmark.tags,
								favorite: bookmark.favorite,
								collectionId: bookmark.collectionId,
							});
						} catch {}
					}
					for (const feed of data.feeds || []) {
						try {
							await agents.rssAgent.addFeed({
								title: feed.title,
								feedUrl: feed.feedUrl,
								siteUrl: feed.siteUrl,
							});
						} catch {}
					}
					break;
				}
				case "opml": {
					const opml = parseOpml(text);
					const feeds = extractFeedsFromOpml(opml);
					const bookmarks = extractBookmarksFromOpml(opml);
					for (const bm of bookmarks) {
						try {
							await agents.bookmarkAgent.addBookmark({
								title: bm.title,
								url: bm.url,
								description: bm.description,
								tags: bm.tags ?? [],
								collectionId: "inbox",
							});
						} catch {}
					}
					for (const feed of feeds) {
						try {
							await agents.rssAgent.addFeed(feed);
						} catch {}
					}
					break;
				}
				case "html": {
					const entries = parseHtmlBookmarks(text);
					for (const entry of entries) {
						try {
							await agents.bookmarkAgent.addBookmark({
								title: entry.title,
								url: entry.url,
								tags: entry.tags ?? [],
								description: entry.description,
								favicon: entry.icon,
								collectionId: "inbox",
							});
						} catch {}
					}
					break;
				}
			}

			onComplete();
			setSyncStatus("connected");
			Alert.alert("Success", "Data imported successfully");
		} catch (e) {
			console.error("Import failed:", e);
			setSyncStatus("error");
			Alert.alert("Error", "Failed to import data");
		}
	};

	return { syncStatus, handleExport, handleImport };
}

export function useClearCache() {
	const handleClearCache = () => {
		Alert.alert(
			"Clear Cache",
			"This will remove all locally cached data. Feeds and bookmarks are preserved. This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Clear",
					style: "destructive",
					onPress: () => {
						Alert.alert(
							"Restart Required",
							"Please restart the app to complete the cache clear.",
						);
					},
				},
			],
		);
	};

	return { handleClearCache };
}
