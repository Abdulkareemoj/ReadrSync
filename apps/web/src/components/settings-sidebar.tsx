import { Link } from "@tanstack/react-router";
import { Cloud, Info, Sun } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const settingsItems = [
	{
		name: "Theme",
		url: "/settings#theme",
		icon: Sun,
	},
	{
		name: "Sync",
		url: "/settings#sync",
		icon: Cloud,
	},
	{
		name: "About",
		url: "/settings#about",
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
							<Link to={item.url}>
								<span className="font-semibold">{item.name}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
