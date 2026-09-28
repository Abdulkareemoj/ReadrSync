/**
 * Window-chrome geometry for the ZCode-style desktop shell: the main
 * content panel floats inside the window with a 4px inset, so its own
 * rounded corners and border stand in for the native window edge. The
 * radius relates to the platform's native window rounding — Windows 11
 * rounds at ~8px, so the inset panel uses 5px; macOS and browser preview
 * use 12px. Maximized windows keep the radius because the panel sits
 * inside its own inset, not on the window outline.
 */

/** True when the webview reports Windows, Tauri on Windows and Edge/Chrome alike. */

//This was made with a skill i personally use in other projects to easily give webapps decent looking windows
export function isWindowsPlatform(): boolean {
	if (typeof navigator === "undefined") return false;
	const uaData = (
		navigator as Navigator & { userAgentData?: { platform?: string } }
	).userAgentData;
	const platform = uaData?.platform ?? navigator.platform ?? "";
	return platform.startsWith("Win");
}

export function resolvePanelRadiusPx(): number {
	return isWindowsPlatform() ? 5 : 12;
}

/** Frame classes for the inset main panel (and any floating sibling panel). */
export function resolvePanelFrameClass(): string {
	return isWindowsPlatform()
		? "rounded-[5px] border border-border"
		: "rounded-xl border border-border";
}
