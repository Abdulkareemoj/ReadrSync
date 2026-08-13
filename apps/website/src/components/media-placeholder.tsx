import { cn } from "@/lib/utils";

/**
 * Stand-in for the photography that carries this design system.
 * Swap each one for a real <img className="h-full w-full object-cover" /> —
 * `label` describes the shot the slot is composed for.
 */
export function MediaPlaceholder({
	label,
	className,
	tone = "light",
}: {
	label: string;
	className?: string;
	tone?: "light" | "dark";
}) {
	return (
		<div
			role="img"
			aria-label={label}
			className={cn(
				"flex h-full w-full items-end justify-start overflow-hidden p-6",
				tone === "dark" ? "bg-carbon dark:bg-card" : "bg-light-ash",
				className,
			)}
		>
			<span
				className={cn(
					"max-w-[420px] text-left font-normal text-[12px]",
					tone === "dark"
						? "text-background/40 dark:text-silver-fog"
						: "text-silver-fog",
				)}
			>
				{label}
			</span>
		</div>
	);
}
