/**
 * Runtime platform detection for the shared web/desktop frontend.
 * The desktop app is Tauri; the browser preview is everything else.
 * i feel like i will  eventually need to rethink this
 */
export function isTauri(): boolean {
	if (typeof window === "undefined") return false;
	// Standard Tauri v2 injection, the withGlobalTauri global, and finally our
	// own desktop bootstrap flag — the desktop main.tsx injects the agents
	// before first render, so it is a reliable fallback if the internals
	// naming ever shifts across Tauri versions.
	return (
		"__TAURI_INTERNALS__" in window ||
		"__TAURI__" in window ||
		Boolean(
			(window as unknown as { __BOOKMARKREADER_AGENTS__?: unknown })
				.__BOOKMARKREADER_AGENTS__,
		)
	);
}
