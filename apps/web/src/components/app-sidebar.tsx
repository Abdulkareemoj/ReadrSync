import {
	Link,
	useMatchRoute,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import {
	HelpCircleIcon,
	Search,
	Settings,
} from "lucide-react";
import { useMemo, useState } from "react";
import AnimatedTabs from "@/components/animated-tabs";
import { BookmarkSidebar } from "@/components/bookmarks/bookmark-sidebar";
import { NavItems } from "@/components/navitems";
import { FeedSidebar } from "@/components/rss/feed-sidebar";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useFeeds } from "@/hooks/use-feeds";
import { useCollectionsStore } from "@packages/store";
import { useReaderStore } from "@/lib/store";
import { ExploreSidebar } from "./explore-sidebar";
import { SidebarBrand } from "./sidebar-brand";

const navSecondary = [
	{
		title: "Settings",
		url: "/settings",
		icon: Settings,
	},
	{
		title: "Get Help",
		url: "#",
		icon: HelpCircleIcon,
	},
];

export function AppSidebar() {
	const [showSearch, setShowSearch] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const matchRoute = useMatchRoute();
	const navigate = useNavigate();
	const location = useRouterState({ select: (s) => s.location });

	const {
		bookmarkCollections,
		addBookmarkCollection,
		removeBookmarkCollection,
		setBookmarkCollections,
	} = useCollectionsStore();
	const { feeds, removeFeed } = useFeeds();
	const {
		bookmarks,
		collections: collectionTree,
		createCollection,
		renameCollection,
		deleteCollection,
		moveCollection,
	} = useReaderStore((state) => state);

	// Get current collection/feed ID from search params
	const currentCollectionId = (location.search as any)?.filter || null;

	// Build a flat list of all collections for parent picker
	const flatCollections = useMemo(() => {
		const result: { id: string; name: string; parentId: string | null }[] = [];
		const walk = (nodes: typeof collectionTree) => {
			for (const n of nodes) {
				result.push({ id: n.id, name: n.name, parentId: n.parentId });
				walk(n.children);
			}
		};
		walk(collectionTree);
		return result;
	}, [collectionTree]);

	// Sync DB-backed collections into the zustand persist store (for backward compat)
	useMemo(() => {
		if (collectionTree.length > 0) {
			const flat = flatCollections;
			// Add virtual "all" entry at the front
			setBookmarkCollections([
				{ id: "all", name: "All Bookmarks", parentId: null, position: 0 },
				{ id: "inbox", name: "Inbox", parentId: null, position: 1 },
				...flat.filter((c) => c.id !== "all" && c.id !== "inbox"),
			]);
		}
	}, [collectionTree]);

	function setCollectionParam(collectionId: string | null) {
		const currentPath = location.pathname;
		const targetPath = currentPath.startsWith("/bookmarks")
			? "/bookmarks"
			: currentPath.startsWith("/rss")
				? "/rss"
				: "/";

		void navigate({
			to: targetPath as any,
			search: collectionId ? ({ filter: collectionId } as any) : undefined,
			replace: true,
		});
	}

	function handleSearch(query: string) {
		setSearchQuery(query);
		const currentPath = location.pathname;
		const targetPath = currentPath.startsWith("/bookmarks")
			? "/bookmarks"
			: currentPath.startsWith("/rss")
				? "/rss"
				: "/";

		void navigate({
			to: targetPath as any,
			search: query ? { q: query } : undefined,
			replace: true,
		});
	}

	function slugify(input: string): string {
		return input
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");
	}

	function handleAddCollection(name: string) {
		if (!name.trim()) return;
		createCollection(name.trim());
		// Also add to the legacy persist store for backward compat
		addBookmarkCollection(name.trim());
	}

	function handleRenameCollection(id: string, name: string) {
		renameCollection(id, name);
	}

	function handleDeleteCollection(id: string) {
		deleteCollection(id);
	}

	const renderCollectionList = () => {
		if (matchRoute({ to: "/bookmarks", fuzzy: true })) {
			return (
				<BookmarkSidebar
					collectionTree={collectionTree}
					flatCollections={flatCollections}
					selectedCollectionId={currentCollectionId}
					onSelectCollection={setCollectionParam}
					onRemoveCollection={handleDeleteCollection}
					onAddCollection={handleAddCollection}
					onRenameCollection={handleRenameCollection}
				/>
			);
		}

		if (matchRoute({ to: "/rss", fuzzy: true })) {
			return (
				<FeedSidebar
					feeds={feeds}
					selectedFeedId={currentCollectionId}
					onSelectFeed={setCollectionParam}
					onRemoveFeed={removeFeed}
				/>
			);
		}

		if (matchRoute({ to: "/settings", fuzzy: true })) {
			return <SettingsSidebar />;
		}

		if (matchRoute({ to: "/explore" })) {
			return <ExploreSidebar />;
		}

		return (
			<div className="flex items-center justify-center py-8 text-muted-foreground">
				<p className="text-sm">Select a tab to view collections.</p>
			</div>
		);
	};

	return (
		<Sidebar collapsible="offcanvas">
			<SidebarHeader>
					<SidebarBrand />
			</SidebarHeader>
			<SidebarContent>
				<div className="p-2">
					<AnimatedTabs />
				</div>
				<SidebarMenu>
					{/* Only show header controls for non-bookmarks routes (bookmarks sidebar handles its own) */}
					{matchRoute({ to: "/rss", fuzzy: true }) ||
					matchRoute({ to: "/settings", fuzzy: true }) ||
					matchRoute({ to: "/explore", fuzzy: true }) ||
					matchRoute({ to: "/", fuzzy: true }) ? (
						<SidebarGroup>
							<div className="flex items-center justify-between px-4">
								{showSearch ? (
									<div className="relative w-full">
										<Search className="absolute top-2.5 left-2.5 size-5 text-muted-foreground" />
										<Input
											autoFocus
											type="search"
											placeholder="Search..."
											className="w-full rounded-lg bg-background pl-8"
											value={searchQuery}
											onChange={(e) => handleSearch(e.target.value)}
											onBlur={() => setShowSearch(false)}
										/>
									</div>
								) : (
									<>
										<h2 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
											{matchRoute({ to: "/", fuzzy: true }) && "Home"}
											{matchRoute({ to: "/rss", fuzzy: true }) && "Sources"}
											{matchRoute({ to: "/explore", fuzzy: true }) && "Explore"}
											{matchRoute({ to: "/settings", fuzzy: true }) && "Settings"}
										</h2>
										<div className="flex items-center gap-2">
											{!matchRoute({ to: "/settings", fuzzy: true }) && (
												<Button
													variant="ghost"
													size="icon"
													onClick={() => setShowSearch(true)}
													className="size-6 text-muted-foreground hover:text-foreground"
												>
													<Search className="size-5" />
												</Button>
											)}
										</div>
									</>
								)}
							</div>
						</SidebarGroup>
					) : null}
					{/* Render the appropriate content based on the active tab */}
					<SidebarMenuItem className="p-0">
						{renderCollectionList()}
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>
			<SidebarFooter>
				<NavItems items={navSecondary} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
