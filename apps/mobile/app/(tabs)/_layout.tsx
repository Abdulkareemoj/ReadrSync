import { router, useFocusEffect } from "expo-router";
import Tabs from "expo-router/tabs";
import {
	Bookmark,
	Compass,
	Home,
	Radio,
	Search,
	Settings,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";

export default function TabsLayout() {
	const [showSearchInput, setShowSearchInput] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { theme } = useUniwind();
	const colors = theme === "dark" ? THEME.dark : THEME.light;

	useFocusEffect(
		useCallback(() => {
			return () => {
				setShowSearchInput(false);
				setSearchQuery("");
				router.setParams({ searchQuery: undefined });
			};
		}, []),
	);

	const { top } = useSafeAreaInsets();

	return (
		<Tabs
			screenOptions={{
				headerShown: true,
				tabBarStyle: {
					backgroundColor: colors.background,
					borderTopColor: colors.border,
					borderTopWidth: 1,
					height: Platform.OS === "ios" ? 88 : 70,
					paddingBottom: Platform.OS === "ios" ? 28 : 8,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					marginTop: 4,
					fontWeight: "600",
				},
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.mutedForeground,
				header: ({ route, options }) => (
					<View
						style={{ paddingTop: top + 7 }}
						className="flex-row items-center justify-between border-border border-b bg-background px-4 pb-3"
					>
						<View className="flex-1 flex-row items-center gap-3">
							{showSearchInput ? (
								<Input
									placeholder={`Search ${route.name}...`}
									value={searchQuery}
									onChangeText={(text) => {
										setSearchQuery(text);
										router.setParams({ searchQuery: text });
									}}
									className="mr-2 h-10 flex-1"
									autoFocus
								/>
							) : (
								<Text className="font-bold text-foreground text-xl">
									{options.title}
								</Text>
							)}
						</View>

						<Pressable
							onPress={() => setShowSearchInput((prev) => !prev)}
							className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
						>
							<Search
								size={20}
								className={
									showSearchInput ? "text-primary" : "text-muted-foreground"
								}
							/>
						</Pressable>
					</View>
				),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => <Home size={24} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="bookmarks"
				options={{
					title: "Bookmarks",
					tabBarIcon: ({ color }: any) => <Bookmark size={24} color={color} />,
				}}
			/>

			<Tabs.Screen
				name="rss"
				options={{
					title: "RSS",
					tabBarIcon: ({ color }: any) => <Radio size={24} color={color} />,
				}}
			/>

			<Tabs.Screen
				name="explore"
				options={{
					title: "Explore",
					tabBarIcon: ({ color }) => <Compass size={24} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
				}}
			/>
		</Tabs>
	);
}
