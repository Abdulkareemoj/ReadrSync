// Google Drive API client for the sync file. Pure REST over fetch works in
// the browser, the Tauri webview, and React Native. Callers pass a valid
// access token (resolve it via IAuthAgent.getAccessToken()).

import type { SyncData } from "@packages/agents";

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";
export const DRIVE_SYNC_FILENAME = "bookmark-reader-sync.json";
const SYNC_MIME = "application/json";

interface DriveFile {
	id: string;
	name: string;
	mimeType: string;
	modifiedTime: string;
}

async function api<T>(
	accessToken: string,
	url: string,
	options: RequestInit = {},
): Promise<T> {
	const res = await fetch(url, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${accessToken}`,
		},
	});
	if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
	return res.json();
}

async function findSyncFile(accessToken: string): Promise<DriveFile | null> {
	try {
		const params = new URLSearchParams({
			q: `name='${DRIVE_SYNC_FILENAME}' and trashed=false`,
			spaces: "drive",
			fields: "files(id, name, mimeType, modifiedTime)",
			pageSize: "1",
		});
		const data = await api<{ files: DriveFile[] }>(
			accessToken,
			`${DRIVE_API_BASE}/files?${params}`,
		);
		return data.files?.[0] ?? null;
	} catch {
		return null;
	}
}

export async function downloadSyncData(
	accessToken: string,
): Promise<SyncData | null> {
	const file = await findSyncFile(accessToken);
	if (!file) return null;

	try {
		const res = await fetch(`${DRIVE_API_BASE}/files/${file.id}?alt=media`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		if (!res.ok) return null;
		return (await res.json()) as SyncData;
	} catch {
		return null;
	}
}

export async function uploadSyncData(
	accessToken: string,
	data: SyncData,
): Promise<boolean> {
	const existing = await findSyncFile(accessToken);

	try {
		if (existing) {
			const res = await fetch(
				`${DRIVE_UPLOAD_BASE}/files/${existing.id}?uploadType=media`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": SYNC_MIME,
					},
					body: JSON.stringify(data),
				},
			);
			return res.ok;
		}

		// Create new file
		const boundary = "drive_sync_boundary";
		const delimiter = `--${boundary}\r\n`;
		const closeDelimiter = `\r\n--${boundary}--`;
		const metadata = JSON.stringify({
			name: DRIVE_SYNC_FILENAME,
			mimeType: SYNC_MIME,
		});
		const body =
			delimiter +
			"Content-Type: application/json; charset=UTF-8\r\n\r\n" +
			metadata +
			"\r\n" +
			delimiter +
			`Content-Type: ${SYNC_MIME}\r\n\r\n` +
			JSON.stringify(data) +
			closeDelimiter;

		const res = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": `multipart/related; boundary=${boundary}`,
			},
			body,
		});
		return res.ok;
	} catch {
		return false;
	}
}
