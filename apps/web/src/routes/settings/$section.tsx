import { createFileRoute, Navigate } from "@tanstack/react-router";
import {
	isSettingsSectionKey,
	SETTINGS_SECTIONS,
} from "@/components/settings/registry";

export const Route = createFileRoute("/settings/$section")({
	head: () => ({ meta: [{ title: "Settings" }] }),
	component: SettingsSectionPage,
});

function SettingsSectionPage() {
	const { section } = Route.useParams();
	if (!isSettingsSectionKey(section)) {
		// beforeLoad-style guard would also work; this is the type-narrowing backstop.
		return (
			<Navigate to="/settings/$section" params={{ section: "appearance" }} />
		);
	}
	const {
		label,
		blurb,
		component: SectionComponent,
	} = SETTINGS_SECTIONS[section];
	return (
		<div className="min-w-0">
			<h1 className="font-semibold text-2xl text-foreground">{label}</h1>
			<p className="mt-1 text-muted-foreground text-sm">{blurb}</p>
			<div className="mt-6">
				<SectionComponent />
			</div>
		</div>
	);
}
