import { useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpenText, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import SearchBar from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./ui/sidebar";

export default function Toolbar() {
	const { theme, setTheme } = useTheme();
	const { state, toggleSidebar } = useSidebar();
	const toggleTheme = () => {
		if (theme === "dark") {
			setTheme("light");
		} else {
			setTheme("dark");
		}
	};
	const navigate = useNavigate();
	const location = useRouterState({ select: (s) => s.location });

	return (
		<header className="border-border border-b bg-background">
			<div className="flex h-16 items-center justify-between px-4 md:px-6">
				{/* Left Section */}
				<div className="...">
					{state === "collapsed" && (
						<Button
							onClick={toggleSidebar}
							aria-label="Open sidebar"
							title="Open sidebar (⌘B)"
							className="cursor-pointer transition-opacity hover:opacity-80"
						>
							<BookOpenText className="size-4" />
						</Button>
					)}
				</div>

				{/* Center Section - Search */}
				<div className="mx-4 hidden max-w-md flex-1 md:flex">
					<SearchBar
						placeholder="Search..."
						onSearch={(q) => {
							void navigate({
								to: location.pathname as any,
								search: (prev: any) => ({ ...prev, q }),
								replace: true,
							});
						}}
					/>
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-2">
					<Button variant="ghost" className="w-9 px-0" onClick={toggleTheme}>
						<div
							className="t-icon-swap"
							data-state={theme === "dark" ? "a" : "b"}
						>
							<Sun data-icon="a" className="t-icon h-[1.2rem] w-[1.2rem]" />
							<Moon data-icon="b" className="t-icon h-[1.2rem] w-[1.2rem]" />
						</div>
						<span className="sr-only">Toggle theme</span>
					</Button>
					{/* <Button variant="outline" size="sm" title="Settings">
						<Settings className="size-5" />
					</Button> */}
				</div>
			</div>
		</header>
	);
}
