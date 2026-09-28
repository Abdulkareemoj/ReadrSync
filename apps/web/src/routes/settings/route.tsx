import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
	head: () => ({ meta: [{ title: "Settings" }] }),
	component: SettingsLayout,
});

// The section menu lives in the app sidebar (app-sidebar.tsx, settings
// branch); this layout only positions the active section's content.
function SettingsLayout() {
	return (
		<div className="mx-auto w-full max-w-3xl px-6 py-8">
			<Outlet />
		</div>
	);
}
