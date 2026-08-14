import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import type { CollectionTreeNode } from "@packages/agents";
import { router } from "expo-router";
import {
	Archive,
	Bookmark,
	ChevronRight,
	Folder,
	Heart,
	Home,
	Inbox,
	Star,
	X,
} from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useCollectionsStore, useReaderStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AddBookmarkModal } from "./bookmarks/add-bookmark-modal";

interface CollectionsBottomSheetProps {
	isOpen: boolean;
	onClose: () => void;
	activeTab: string;
	onTabChange: (tab: string) => void;
}

export function CollectionsBottomSheet({
	isOpen,
	onClose,
	activeTab,
	onTabChange,
}: CollectionsBottomSheetProps) {
	const { bookmarkCollections } = useCollectionsStore();
	const { addBookmark } = useBookmarks();
	const collectionTree = useReaderStore((s) => s.collections);
	const bottomSheetRef = useRef<BottomSheet>(null);

	const snapPoints = useMemo(() => ["60%", "80%"], []);

	const handleSheetChanges = useCallback(
		(index: number) => {
			if (index === -1) {
				onClose();
			}
		},
		[onClose],
	);

	React.useEffect(() => {
		const ref = bottomSheetRef.current;
		if (!ref) return;
		if (isOpen) {
			ref.snapToIndex(0);
		} else {
			ref.close();
		}
	}, [isOpen]);

	const navigateTo = (href: "/bookmarks/favorites" | "/bookmarks/archive") => {
		onClose();
		router.navigate(href);
	};

	const getCollectionIcon = (id: string, depth: number) => {
		if (depth > 0) return ChevronRight;
		switch (id) {
			case "all":
				return Home;
			case "inbox":
				return Inbox;
			case "liked":
				return Heart;
			case "saved":
				return Bookmark;
			default:
				return Folder;
		}
	};

	const navItems = [
		{
			id: "favorites",
			name: "Favorites",
			icon: Star,
			href: "/bookmarks/favorites" as const,
		},
		{
			id: "archive",
			name: "Archive",
			icon: Archive,
			href: "/bookmarks/archive" as const,
		},
	];

	// Flatten tree into a list with depth info for display
	const treeItems = useMemo(() => {
		const items: { id: string; name: string; depth: number }[] = [];
		const walk = (nodes: CollectionTreeNode[], depth: number) => {
			for (const n of nodes) {
				items.push({ id: n.id, name: n.name, depth });
				walk(n.children, depth + 1);
			}
		};
		if (collectionTree.length > 0) {
			walk(collectionTree, 0);
		} else {
			// Fallback to persist store
			for (const c of bookmarkCollections) {
				if (c.id !== "all") items.push({ id: c.id, name: c.name, depth: 0 });
			}
		}
		return items;
	}, [collectionTree, bookmarkCollections]);

	const collections = [
		{ id: "all", name: "All Bookmarks", depth: 0 },
		{ id: "liked", name: "Liked", depth: 0 },
		{ id: "saved", name: "Saved", depth: 0 },
		...treeItems.filter(
			(c) => c.id !== "all" && c.id !== "liked" && c.id !== "saved",
		),
	];

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={-1}
			snapPoints={snapPoints}
			enablePanDownToClose={true}
			onChange={handleSheetChanges}
			backgroundStyle={{
				backgroundColor: "hsl(var(--background))",
			}}
			handleIndicatorStyle={{
				backgroundColor: "hsl(var(--muted-foreground))",
				width: 40,
				height: 4,
			}}
			handleStyle={{
				paddingTop: 8,
				paddingBottom: 4,
			}}
		>
			<BottomSheetView className="flex-1">
				<View className="flex-row justify-center py-2">
					<View className="h-1 w-12 rounded-full bg-muted-foreground/30" />
				</View>

				<View className="flex-row items-center justify-between border-border border-b px-6 py-4">
					<Text className="font-bold text-foreground text-xl">Collections</Text>
					<TouchableOpacity
						onPress={onClose}
						className="rounded-full bg-accent p-2"
					>
						<X size={20} className="text-muted-foreground" />
					</TouchableOpacity>
				</View>

				<ScrollView className="flex-1 px-4 py-4">
					<Text className="mb-4 px-2 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
						Views
					</Text>
					{navItems.map((item) => {
						const Icon = item.icon;
						return (
							<TouchableOpacity
								key={item.id}
								onPress={() => navigateTo(item.href)}
								className="mb-2 flex-row items-center rounded-xl px-4 py-3 active:bg-accent"
							>
								<Icon size={20} className="text-muted-foreground" />
								<Text className="ml-3 font-semibold text-foreground">
									{item.name}
								</Text>
							</TouchableOpacity>
						);
					})}

					<Text className="mt-6 mb-4 px-2 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
						Filters
					</Text>
					{collections.map((collection) => {
						const Icon = getCollectionIcon(
							collection.id,
							(collection as any).depth ?? 0,
						);
						const isActive = activeTab === collection.id;
						const depth = (collection as any).depth ?? 0;

						return (
							<TouchableOpacity
								key={collection.id}
								onPress={() => {
									onTabChange(collection.id);
									onClose();
								}}
								style={{ paddingLeft: 16 + depth * 16 }}
								className={cn(
									"mb-2 flex-row items-center rounded-xl px-4 py-3",
									isActive ? "bg-primary/10" : "active:bg-accent",
								)}
							>
								<Icon
									size={20}
									className={cn(
										isActive ? "text-primary" : "text-muted-foreground",
									)}
								/>
								<Text
									className={cn(
										"ml-3 font-semibold",
										isActive ? "text-primary" : "text-foreground",
									)}
								>
									{collection.name}
								</Text>
							</TouchableOpacity>
						);
					})}

					<View className="mt-6">
						<Text className="mb-3 font-medium text-foreground">
							Add New Bookmark
						</Text>
						<AddBookmarkModal
							onAddBookmark={(data) => {
								addBookmark({
									...data,
									tags: [],
								});
								onClose();
							}}
						/>
					</View>
				</ScrollView>
			</BottomSheetView>
		</BottomSheet>
	);
}
