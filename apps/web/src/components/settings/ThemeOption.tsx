import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type Props = {
	value: string;
	label: string;
	icon: React.ElementType;
	active: boolean;
	onSelect: () => void;
};

export default function ThemeOption({
	value,
	label,
	icon: Icon,
	active,
	onSelect,
}: Props) {
	const isDark = value === "dark";

	return (
		<Button
			type="button"
			onClick={onSelect}
			className={cn(
				"group relative flex flex-col gap-3 rounded-xl border p-3 text-left transition-all",
				active
					? "border-foreground ring-1 ring-foreground"
					: "border-border hover:border-foreground/40",
			)}
		>
			<div
				className={cn(
					"relative h-16 w-full overflow-hidden rounded-lg",
					value === "system"
						? "bg-gradient-to-br from-[oklch(0.92_0.01_260)] to-[oklch(0.18_0.02_260)]"
						: isDark
							? "bg-[oklch(0.16_0.015_260)]"
							: "bg-[oklch(0.94_0.005_260)]",
				)}
			>
				<div
					className={cn(
						"absolute top-2.5 left-2.5 h-1.5 w-7 rounded-full",
						isDark || value === "system" ? "bg-white/20" : "bg-black/15",
					)}
				/>
				<div className="absolute top-5.5 left-2.5 flex flex-col gap-1">
					<div
						className={cn(
							"h-1 w-10 rounded-full",
							isDark || value === "system" ? "bg-white/15" : "bg-black/10",
						)}
					/>
					<div
						className={cn(
							"h-1 w-7 rounded-full",
							isDark || value === "system" ? "bg-white/15" : "bg-black/10",
						)}
					/>
				</div>
			</div>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1.5">
					<Icon className="size-3.5 text-muted-foreground" />
					<span className="font-medium text-xs">{label}</span>
				</div>
				{active && (
					<div className="flex size-4 items-center justify-center rounded-full bg-foreground">
						<Check className="size-2.5 text-background" />
					</div>
				)}
			</div>
		</Button>
	);
}
