import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		if (theme === "dark") {
			setTheme("light");
		} else {
			setTheme("dark");
		}
	};

	return (
		<Button variant="ghost" className="w-9 px-0" onClick={toggleTheme}>
			{theme === "dark" ? (
				<SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
			) : (
				<MoonIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
			)}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
