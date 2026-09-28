import { useCollectionsStore } from "@packages/store";
import {
	Link,
	useMatchRoute,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import { HelpCircleIcon, Search, Settings } from "lucide-react";
import { useMemo, useState } from "react";
import AnimatedTabs from "@/components/animated-tabs";
import { BookmarkSidebar } from "@/components/bookmarks/bookmark-sidebar";
import { NavItems } from "@/components/navitems";
import { FeedSidebar } from "@/components/rss/feed-sidebar";
import {
	SETTINGS_SECTION_ORDER,
	SETTINGS_SECTIONS,
} from "@/components/settings/registry";
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
import { useReaderStore } from "@/lib/store";
import { cn } from "@/lib/utils";
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

export function AppSidebar({
	variant = "web",
}: {
	variant?: "web" | "desktop";
}) {
	const isDesktop = variant === "desktop";
	const [showSearch, setShowSearch] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const matchRoute = useMatchRoute();
	const navigate = useNavigate();
	const location = useRouterState({ select: (s) => s.location });

	const { addBookmarkCollection, setBookmarkCollections } =
		useCollectionsStore();
	const { feeds, removeFeed } = useFeeds();
	const {
		collections: collectionTree,
		createCollection,
		renameCollection,
		deleteCollection,
	} = useReaderStore((state) => state);

	// Get current collection/feed ID from search params
	const currentCollectionId = (location.search as any)?.filter || null;

	// Build a flat list of all collections for parent picker
	const flatCollections = useMemo(() => {
		const result: {
			id: string;
			name: string;
			parentId: string | null;
			position: number;
		}[] = [];
		let position = 2;
		const walk = (nodes: typeof collectionTree) => {
			for (const n of nodes) {
				result.push({
					id: n.id,
					name: n.name,
					parentId: n.parentId,
					position: position++,
				});
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
			search: (query ? { q: query } : undefined) as any,
			replace: true,
		});
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
			// The settings menu is centralized here in the sidebar (driven by the
			// same registry as the routes); the page shows only the active section.
			return (
				<div className="px-2 py-1">
					{SETTINGS_SECTION_ORDER.map((key) => {
						const section = SETTINGS_SECTIONS[key];
						const active = location.pathname === `/settings/${key}`;
						return (
							<Link
								key={key}
								to="/settings/$section"
								params={{ section: key }}
								className={cn(
									"flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
									active
										? "bg-accent font-medium text-foreground"
										: "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
								)}
							>
								<section.icon className="size-4 shrink-0" />
								<span className="truncate">{section.label}</span>
							</Link>
						);
					})}
				</div>
			);
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
		<Sidebar
			collapsible={isDesktop ? "none" : "offcanvas"}
			className={
				isDesktop
					? "border-r-0! bg-transparent! text-foreground [--sidebar-width:15rem]"
					: undefined
			}
		>
			{/* Desktop shell renders its own drag strip with app identity above
			    the sidebar; web keeps the brand header. */}
			{!isDesktop && (
				<SidebarHeader>
					<SidebarBrand />
				</SidebarHeader>
			)}
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
											{matchRoute({ to: "/settings", fuzzy: true }) &&
												"Settings"}
										</h2>
										{/* Desktop shell: the panel header owns search */}
										<div className="flex items-center gap-2">
											{!isDesktop &&
												!matchRoute({ to: "/settings", fuzzy: true }) && (
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
			{!isDesktop && <SidebarRail />}
		</Sidebar>
	);
}
