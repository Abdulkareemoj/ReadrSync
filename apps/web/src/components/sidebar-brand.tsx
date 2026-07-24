import { BookOpenText } from "lucide-react";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function SidebarBrand() {
	const { state, toggleSidebar } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					onClick={toggleSidebar}
					tooltip={isCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
					className="cursor-pointer justify-center hover:bg-sidebar-accent/60"
				>
					<div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
						{/* swap for <img src="/logo.svg" className="size-5" /> once you have a mark */}
						<BookOpenText className="size-4" />
					</div>

					{!isCollapsed && (
						<span className="truncate text-sm font-semibold tracking-tight">
							ReadrSync
						</span>
					)}
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}