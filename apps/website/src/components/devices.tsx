import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Device mockup frames — pure CSS/DOM, theme-token driven, no shadows.
 * Each frame is a fixed-aspect shell; `children` is the screen content
 * (a MediaPlaceholder today, a real <img>/<video> later).
 */

function Screen({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("relative h-full w-full overflow-hidden", className)}>
			{children}
		</div>
	);
}

export function IPhone({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("relative aspect-[9/19.5] w-full", className)}>
			<div className="h-full w-full rounded-[2rem] bg-carbon p-[3px]">
				<div className="relative h-full w-full overflow-hidden rounded-[1.85rem] bg-light-ash">
					<div className="absolute top-2 left-1/2 z-10 h-[18px] w-[70px] -translate-x-1/2 rounded-full bg-carbon" />
					<Screen>{children}</Screen>
				</div>
			</div>
		</div>
	);
}

export function Android({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("relative aspect-[9/19] w-full", className)}>
			<div className="h-full w-full rounded-[1.5rem] bg-carbon p-[3px]">
				<div className="relative h-full w-full overflow-hidden rounded-[1.35rem] bg-light-ash">
					<div className="absolute top-2 left-1/2 z-10 h-[8px] w-[8px] -translate-x-1/2 rounded-full bg-carbon" />
					<Screen>{children}</Screen>
				</div>
			</div>
		</div>
	);
}

export function IPad({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("relative aspect-[4/3] w-full", className)}>
			<div className="h-full w-full rounded-[1.25rem] bg-carbon p-[10px]">
				<div className="relative h-full w-full overflow-hidden rounded-[0.65rem] bg-light-ash">
					<Screen>{children}</Screen>
				</div>
			</div>
		</div>
	);
}

export function MacbookPro({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("relative w-full", className)}>
			<div className="rounded-t-[0.9rem] bg-carbon p-[8px] pb-[6px]">
				<div className="relative aspect-[16/10] w-full overflow-hidden rounded-[0.35rem] bg-light-ash">
					<div className="absolute top-1 left-1/2 z-10 h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-graphite" />
					<Screen>{children}</Screen>
				</div>
			</div>
			{/* Base */}
			<div className="relative left-1/2 h-[10px] w-[108%] -translate-x-1/2 rounded-b-[0.5rem] bg-pale-silver" />
			<div className="mx-auto h-[3px] w-[16%] rounded-b-[0.35rem] bg-silver-fog" />
		</div>
	);
}

function Chrome({
	url,
	variant,
}: {
	url: string;
	variant: "safari" | "browser";
}) {
	return (
		<div className="flex h-9 shrink-0 items-center gap-3 border-border border-b bg-cloud px-3">
			<div className="flex gap-[6px]">
				<span className="h-[10px] w-[10px] rounded-full bg-pale-silver" />
				<span className="h-[10px] w-[10px] rounded-full bg-pale-silver" />
				<span className="h-[10px] w-[10px] rounded-full bg-pale-silver" />
			</div>
			<div
				className={cn(
					"flex h-[22px] flex-1 items-center bg-background px-3 text-[11px] text-pewter",
					variant === "safari"
						? "mx-auto max-w-[300px] justify-center rounded-md"
						: "rounded-full",
				)}
			>
				{url}
			</div>
		</div>
	);
}

export function Safari({
	children,
	url = "readrsync.app/library",
	className,
}: {
	children: ReactNode;
	url?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex w-full flex-col overflow-hidden rounded-xl border border-border bg-background",
				className,
			)}
		>
			<Chrome url={url} variant="safari" />
			<div className="relative aspect-[16/10] w-full">
				<Screen>{children}</Screen>
			</div>
		</div>
	);
}

export function Browser({
	children,
	url = "readrsync.app",
	className,
}: {
	children: ReactNode;
	url?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex w-full flex-col overflow-hidden rounded-xl border border-border bg-background",
				className,
			)}
		>
			<Chrome url={url} variant="browser" />
			<div className="relative aspect-[16/10] w-full">
				<Screen>{children}</Screen>
			</div>
		</div>
	);
}
