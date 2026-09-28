import type { LucideIcon } from "lucide-react";
import { Cloud, Database, Info, MonitorPlay, Palette } from "lucide-react";
import type { ComponentType } from "react";
import AboutSection from "./AboutSection";
import { AppearanceSettingsSection } from "./AppearanceSettingsSection";
import { DataSettingsSection } from "./DataSettingsSection";
import { SyncSettingsSection } from "./SyncSettingsSection";
import YouTubeSection from "./YouTubeSection";

export const SETTINGS_SECTION_KEYS = [
	"appearance",
	"data",
	"sync",
	"youtube",
	"about",
] as const;

export type SettingsSectionKey = (typeof SETTINGS_SECTION_KEYS)[number];

export function isSettingsSectionKey(
	value: string,
): value is SettingsSectionKey {
	return (SETTINGS_SECTION_KEYS as readonly string[]).includes(value);
}

export interface SettingsSection {
	label: string;
	blurb: string;
	icon: LucideIcon;
	component: ComponentType;
}

export const SETTINGS_SECTIONS: Record<SettingsSectionKey, SettingsSection> = {
	appearance: {
		label: "Appearance",
		blurb: "Theme and reading typography",
		icon: Palette,
		component: AppearanceSettingsSection,
	},
	data: {
		label: "Data",
		blurb: "Export, import, and clear cached data",
		icon: Database,
		component: DataSettingsSection,
	},
	sync: {
		label: "Cloud Sync",
		blurb: "Connect Google Drive and sync across devices",
		icon: Cloud,
		component: SyncSettingsSection,
	},
	youtube: {
		label: "YouTube",
		blurb: "API key for resolving YouTube channel feeds",
		icon: MonitorPlay,
		component: YouTubeSection,
	},
	about: {
		label: "About",
		blurb: "Version, licenses, and project links",
		icon: Info,
		component: AboutSection,
	},
};

/** Display order for the nav / index list. */
export const SETTINGS_SECTION_ORDER: SettingsSectionKey[] = [
	"appearance",
	"data",
	"sync",
	"youtube",
	"about",
];
