import {
	DarkTheme,
	DefaultTheme,
	type Theme,
	ThemeProvider,
} from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { useUniwind } from "uniwind";
import { useFeeds } from "@/hooks/use-feeds";
import { THEME } from "@/lib/theme";

/**
 * Native tab bar on both platforms: system UITabBar (Liquid Glass on iOS 26)
 * and Material bottom navigation on Android. Colors resolve from the React
 * Navigation theme fed to ThemeProvider, so it is wired to the same uniwind
 * theme the rest of the app uses.
 */
export default function TabsLayout() {
	const { theme } = useUniwind();
	const colors = theme === "dark" ? THEME.dark : THEME.light;
	const { feeds } = useFeeds();
	const unread = feeds.reduce((sum, feed) => sum + (feed.unreadCount ?? 0), 0);

	const navFonts = (theme === "dark" ? DarkTheme : DefaultTheme).fonts;
	const navTheme = {
		dark: theme === "dark",
		colors: {
			primary: colors.primary,
			background: colors.background,
			card: colors.card,
			border: colors.border,
			text: colors.foreground,
			notification: colors.destructive,
		},
		fonts: navFonts,
	};

	return (
		<ThemeProvider value={navTheme as ReactNavigation.Theme}>
			<NativeTabs>
				<NativeTabs.Trigger name="index" labelVisibilityMode="labeled">
					<NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
					<NativeTabs.Trigger.Icon sf="house.fill" md="home" />
				</NativeTabs.Trigger>
				<NativeTabs.Trigger name="bookmarks" labelVisibilityMode="labeled">
					<NativeTabs.Trigger.Label>Bookmarks</NativeTabs.Trigger.Label>
					<NativeTabs.Trigger.Icon sf="bookmark.fill" md="bookmark" />
				</NativeTabs.Trigger>
				<NativeTabs.Trigger name="rss" labelVisibilityMode="labeled">
					<NativeTabs.Trigger.Label>RSS</NativeTabs.Trigger.Label>
					<NativeTabs.Trigger.Icon
						sf="dot.radiowaves.left.and.right"
						md="rss_feed"
					/>
					{unread > 0 && (
						<NativeTabs.Trigger.Badge>
							{String(unread)}
						</NativeTabs.Trigger.Badge>
					)}
				</NativeTabs.Trigger>
				<NativeTabs.Trigger name="explore" labelVisibilityMode="labeled">
					<NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
					<NativeTabs.Trigger.Icon sf="safari" md="explore" />
				</NativeTabs.Trigger>
				<NativeTabs.Trigger name="settings" labelVisibilityMode="labeled">
					<NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
					<NativeTabs.Trigger.Icon sf="gear" md="settings" />
				</NativeTabs.Trigger>
			</NativeTabs>
		</ThemeProvider>
	);
}
