import type { SyncFileStore } from "@packages/sync";
import { appDataDir } from "@tauri-apps/api/path";
import { mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

const SYNC_FILENAME = "sync.json";

/** Tauri-backed storage for the local sync file in the app data directory. */
export function createDesktopFileStore(): SyncFileStore {
	let cachedPath: string | null = null;

	async function resolvePath(): Promise<string> {
		if (cachedPath) return cachedPath;
		const dir = await appDataDir();
		try {
			await mkdir(dir, { recursive: true });
		} catch {
			// dir may already exist
		}
		cachedPath = `${dir}/${SYNC_FILENAME}`;
		return cachedPath;
	}

	return {
		readTextFile: (path) => readTextFile(path),
		writeTextFile: (path, data) => writeTextFile(path, data),
		resolvePath,
		cachedPath: () => cachedPath,
	};
}
