import { Link } from "@tanstack/react-router";
import { Cloud, Info, Sun } from "lucide-react";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const settingsItems = [
	{
		name: "Theme",
		url: "/settings",
		hash: "theme",
		icon: Sun,
	},
	{
		name: "Sync",
		url: "/settings",
		hash: "sync",
		icon: Cloud,
	},
	{
		name: "About",
		url: "/settings",
		hash: "about",
		icon: Info,
	},
];

export function SettingsSidebar() {
	return (
		<SidebarGroup>
			<SidebarMenu>
				{settingsItems.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton asChild>
							<Link to={item.url} hash={item.hash}>
								<span className="font-semibold">{item.name}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
