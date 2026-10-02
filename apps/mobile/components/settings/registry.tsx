import type { LucideIcon } from "lucide-react-native";
import {
	ArrowDownUp,
	BookOpen,
	Cloud,
	Database,
	Info,
	Palette,
} from "lucide-react-native";
import type { ComponentType } from "react";
import AboutSection from "./AboutSection";
import CloudSyncSettings from "./CloudSyncSettings";
import DataManagement from "./DataManagement";
import DataSection from "./DataSection";
import ReadingSettings from "./ReadingSettings";
import ThemeSettings from "./ThemeSettings";

export const SETTINGS_SECTION_KEYS = [
	"appearance",
	"reader",
	"storage",
	"sync",
	"data",
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
		blurb: "Theme and appearance of the app",
		icon: Palette,
		component: ThemeSettings,
	},
	reader: {
		label: "Reader",
		blurb: "Font size and reading preferences",
		icon: BookOpen,
		component: ReadingSettings,
	},
	storage: {
		label: "Storage",
		blurb: "Manage local storage and cached content",
		icon: Database,
		component: DataManagement,
	},
	sync: {
		label: "Cloud Sync",
		blurb: "Connect Google Drive and sync across devices",
		icon: Cloud,
		component: CloudSyncSettings,
	},
	data: {
		label: "Import / Export",
		blurb: "Back up and restore your data (JSON, OPML, HTML)",
		icon: ArrowDownUp,
		component: DataSection,
	},
	about: {
		label: "About",
		blurb: "Version, licenses, and project links",
		icon: Info,
		component: AboutSection,
	},
};

/** Display order for the index link list. */
export const SETTINGS_SECTION_ORDER: SettingsSectionKey[] = [
	"appearance",
	"reader",
	"storage",
	"sync",
	"data",
	"about",
];
