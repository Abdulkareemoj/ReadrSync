import type { CollectionTreeNode } from "@packages/agents";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
	Archive,
	Bookmark,
	ChevronDown,
	Heart,
	MoreHorizontal,
	Pencil,
	Plus,
	Search,
	Tag,
	Trash2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useReaderStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface BookmarkSidebarProps {
	collectionTree: CollectionTreeNode[];
	flatCollections: { id: string; name: string; parentId: string | null }[];
	selectedCollectionId: string | null;
	onSelectCollection: (id: string | null) => void;
	onRemoveCollection: (id: string) => void;
	onAddCollection: (name: string) => void;
	onRenameCollection: (id: string, name: string) => void;
}

const navItems = [
	{ icon: Heart, label: "Favorites", href: "/bookmarks/favorites" },
	{ icon: Archive, label: "Archive", href: "/bookmarks/archive" },
];

function CollectionListItem({
	collection,
	selected,
	onSelect,
	onRename,
	onDelete,
}: {
	collection: { id: string; name: string };
	selected: boolean;
	onSelect: (id: string) => void;
	onRename: (id: string, name: string) => void;
	onDelete: (id: string) => void;
}) {
	const [renaming, setRenaming] = useState(false);
	const [renameInput, setRenameInput] = useState(collection.name);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleRename = () => {
		if (renameInput.trim() && renameInput !== collection.name) {
			onRename(collection.id, renameInput.trim());
		}
		setRenaming(false);
	};

	return (
		<div className="flex items-center justify-between rounded-md px-1 py-0.5 hover:bg-accent/50">
			{renaming ? (
				<Input
					ref={inputRef}
					autoFocus
					value={renameInput}
					onChange={(e) => setRenameInput(e.target.value)}
					onBlur={handleRename}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleRename();
						if (e.key === "Escape") setRenaming(false);
					}}
					className="h-6 flex-1 rounded bg-background px-1 text-sm outline-none ring-1 ring-border"
				/>
			) : (
				<Button
					variant="ghost"
					onClick={() => onSelect(collection.id)}
					className={cn(
						"flex min-w-0 flex-1 items-center gap-1.5 rounded px-1 py-0.5 text-left text-sm transition-colors",
						selected
							? "bg-accent font-medium text-accent-foreground"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					<Bookmark className="size-3.5 shrink-0 text-muted-foreground" />
					<span className="truncate">{collection.name}</span>
				</Button>
			)}
			{!renaming && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="flex size-5 shrink-0 items-center justify-center rounded opacity-0 hover:bg-accent group-hover:opacity-100">
							<MoreHorizontal className="size-3.5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuItem
							onClick={() => {
								setRenaming(true);
								setRenameInput(collection.name);
							}}
						>
							<Pencil className="mr-2 size-3.5" />
							Rename
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => onDelete(collection.id)}
						>
							<Trash2 className="mr-2 size-3.5" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
}

export function BookmarkSidebar({
	collectionTree,
	flatCollections,
	selectedCollectionId,
	onSelectCollection,
	onRemoveCollection,
	onAddCollection,
	onRenameCollection,
}: BookmarkSidebarProps) {
	const navigate = useNavigate();
	const location = useRouterState({ select: (s) => s.location });
	const [searchQuery, setSearchQuery] = useState("");
	const [showSearch, setShowSearch] = useState(false);
	const [newCollectionName, setNewCollectionName] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);

	// Read current tags from URL
	const tagsParam = ((location.search as any)?.tags as string) || "";
	const selectedTags = useMemo(() => {
		if (!tagsParam) return [];
		return tagsParam.split(",").filter(Boolean);
	}, [tagsParam]);

	// Collect all tags from bookmarks
	const bookmarks = useReaderStore((s) => s.bookmarks);
	const allTags = useMemo(() => {
		const tagMap = new Map<string, number>();
		bookmarks.forEach((b) => {
			if (b.tags && Array.isArray(b.tags)) {
				b.tags.forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1));
			}
		});
		return Array.from(tagMap.entries())
			.sort((a, b) => b[1] - a[1])
			.map(([name, count]) => ({ name, count }));
	}, [bookmarks]);

	const totalBookmarks = useMemo(() => {
		const count = (nodes: CollectionTreeNode[]): number =>
			nodes.reduce((sum, n) => sum + n.bookmarkCount + count(n.children), 0);
		return count(collectionTree);
	}, [collectionTree]);

	const handleAddCollection = () => {
		if (!newCollectionName.trim()) return;
		onAddCollection(newCollectionName.trim());
		setNewCollectionName("");
		setDialogOpen(false);
	};

	const toggleTag = (tag: string) => {
		const current = new Set(selectedTags);
		if (current.has(tag)) {
			current.delete(tag);
		} else {
			current.add(tag);
		}
		const next = Array.from(current);
		void navigate({
			search: (prev: any) => ({
				...prev,
				tags: next.length > 0 ? next.join(",") : undefined,
			}),
			replace: true,
		});
	};

	// Private collections (exclude virtual "all" and "inbox")
	const privateCollections = useMemo(
		() => flatCollections.filter((c) => c.id !== "all" && c.id !== "inbox"),
		[flatCollections],
	);

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		void navigate({
			search: (prev: any) => ({
				...prev,
				q: query || undefined,
			}),
			replace: true,
		});
	};

	return (
		<ScrollArea className="flex-1 px-4">
			<div className="flex flex-col gap-4 py-2">
				{/* Search */}
				{showSearch ? (
					<div className="relative">
						<Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
						<Input
							autoFocus
							placeholder="Search bookmarks..."
							className="h-9 pl-8"
							value={searchQuery}
							onChange={(e) => handleSearch(e.target.value)}
							onBlur={() => {
								if (!searchQuery) setShowSearch(false);
							}}
						/>
					</div>
				) : (
					<Button
						variant="ghost"
						className="w-full justify-start text-muted-foreground"
						onClick={() => setShowSearch(true)}
					>
						<Search className="mr-2 size-4" />
						Search bookmarks...
					</Button>
				)}

				{/* All Bookmarks */}
				<Button
					variant={selectedCollectionId === null ? "secondary" : "ghost"}
					className="w-full justify-start"
					onClick={() => onSelectCollection(null)}
				>
					<Bookmark data-icon="inline-start" />
					All Bookmarks
					<Badge
						variant="secondary"
						className={cn(
							"ml-auto",
							selectedCollectionId === null &&
								"bg-primary text-primary-foreground",
						)}
					>
						{totalBookmarks}
					</Badge>
				</Button>

				{/* Collections */}
				<Separator />
				<Collapsible defaultOpen className="flex flex-col gap-1">
					<div className="flex items-center justify-between px-2">
						<CollapsibleTrigger className="flex items-center gap-1 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
							<span>Collections</span>
							<ChevronDown className="size-3.5 ui-open:rotate-180 transition-transform" />
						</CollapsibleTrigger>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setDialogOpen(true)}
							className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
						>
							<Plus className="size-3.5" />
						</Button>
					</div>

					{/* New Collection Dialog */}
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogContent className="sm:max-w-106.25">
							<DialogHeader>
								<DialogTitle>New Collection</DialogTitle>
								<DialogDescription>
									Create a new collection to organize your bookmarks.
								</DialogDescription>
							</DialogHeader>
							<div className="py-2">
								<Input
									placeholder="Collection name..."
									value={newCollectionName}
									onChange={(e) => setNewCollectionName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleAddCollection();
									}}
								/>
							</div>
							<DialogFooter>
								<DialogClose asChild>
									<Button type="button" variant="outline">
										Cancel
									</Button>
								</DialogClose>
								<Button onClick={handleAddCollection}>Add</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<CollapsibleContent>
						{/* Collection List - Flat */}
						<div className="space-y-0.5">
							{privateCollections.map((collection) => (
								<CollectionListItem
									key={collection.id}
									collection={collection}
									selected={selectedCollectionId === collection.id}
									onSelect={onSelectCollection}
									onRename={onRenameCollection}
									onDelete={onRemoveCollection}
								/>
							))}
						</div>
					</CollapsibleContent>
				</Collapsible>

				{/* Tags */}
				{allTags.length > 0 && (
					<>
						<Separator />
						<Collapsible defaultOpen className="flex flex-col gap-1">
							<div className="flex items-center justify-between px-2">
								<CollapsibleTrigger className="flex items-center gap-1 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
									<span>Tags</span>
									<ChevronDown className="size-3.5 ui-open:rotate-180 transition-transform" />
								</CollapsibleTrigger>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setDialogOpen(true)}
									className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
								>
									<Plus className="size-3.5" />
								</Button>

								{selectedTags.length > 0 && (
									<button
										onClick={() => {
											void navigate({
												search: (prev: any) => ({
													...prev,
													tags: undefined,
												}),
												replace: true,
											});
										}}
										className="text-[10px] text-muted-foreground hover:text-foreground"
									>
										Clear
									</button>
								)}
							</div>

							<CollapsibleContent>
								<div className="flex flex-wrap gap-1.5 px-1">
									{allTags.map(({ name, count }) => {
										const isActive = selectedTags.includes(name);
										return (
											<button
												key={name}
												onClick={() => toggleTag(name)}
												className={cn(
													"inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-xs transition-colors",
													isActive
														? "bg-primary text-primary-foreground"
														: "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
												)}
											>
												<Tag className="size-3" />
												{name}
												<span className="opacity-60">({count})</span>
											</button>
										);
									})}
								</div>
							</CollapsibleContent>
						</Collapsible>
					</>
				)}

				{/* Navigation */}

				<Separator />
				<div className="flex flex-col gap-1">
					{navItems.map((item) => {
						const isActive = location.pathname === item.href.split("?")[0];
						return (
							<Button
								key={item.label}
								variant={isActive ? "secondary" : "ghost"}
								className="w-full justify-start"
								onClick={() => void navigate({ to: item.href as any })}
							>
								<item.icon className="mr-2 size-4" />
								{item.label}
							</Button>
						);
					})}
				</div>
			</div>
		</ScrollArea>
	);
}
