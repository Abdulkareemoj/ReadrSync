import { LayoutGrid, List, RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
	mainTitle: string;
	unreadCount: number;
	search: string;
	onSearchChange: (value: string) => void;
	viewMode: "grid" | "list";
	onViewModeChange: (mode: "grid" | "list") => void;
	isRefreshing: boolean;
	onRefresh: () => void;
};

export default function RssHeader({
	mainTitle,
	unreadCount,
	search,
	onSearchChange,
	viewMode,
	onViewModeChange,
	isRefreshing,
	onRefresh,
}: Props) {
	return (
		<div className="sticky top-0 z-10 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex items-center justify-between gap-4 px-6 py-4">
				<div className="flex min-w-0 items-center gap-3">
					<h1 className="truncate font-semibold text-foreground text-xl">
						{mainTitle}
					</h1>
					{unreadCount > 0 && (
						<Badge variant="secondary" className="shrink-0 text-xs">
							{unreadCount} unread
						</Badge>
					)}
				</div>

				<div className="flex items-center gap-2">
					<div className="relative hidden sm:block">
						<Search
							data-icon="inline-start"
							className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							placeholder="Search articles..."
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
							className="h-8 w-48 border-transparent bg-muted/50 pl-8 text-sm focus:border-border focus:bg-background"
						/>
					</div>

					<div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
						<Button
							variant={viewMode === "grid" ? "secondary" : "ghost"}
							size="icon"
							className="size-7"
							onClick={() => onViewModeChange("grid")}
						>
							<LayoutGrid data-icon="inline-start" />
						</Button>
						<Button
							variant={viewMode === "list" ? "secondary" : "ghost"}
							size="icon"
							className="size-7"
							onClick={() => onViewModeChange("list")}
						>
							<List data-icon="inline-start" />
						</Button>
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={onRefresh}
						disabled={isRefreshing}
						className="h-8 gap-1.5"
					>
						<RefreshCw
							data-icon="inline-start"
							className={cn(isRefreshing && "animate-spin")}
						/>
						<span className="hidden sm:inline">Refresh</span>
					</Button>
				</div>
			</div>

			<div className="px-6 pb-3 sm:hidden">
				<div className="relative">
					<Search
						data-icon="inline-start"
						className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						placeholder="Search articles..."
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						className="h-8 bg-muted/50 pl-8 text-sm"
					/>
				</div>
			</div>
		</div>
	);
}
