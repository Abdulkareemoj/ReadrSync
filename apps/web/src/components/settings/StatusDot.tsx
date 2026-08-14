import { cn } from "@/lib/utils";

const colors = {
	connected: "bg-green-500",
	error: "bg-destructive",
	syncing: "bg-amber-500 animate-pulse",
	idle: "bg-muted-foreground/40",
} as const;

export default function StatusDot({ status }: { status: keyof typeof colors }) {
	return (
		<span
			className={cn("inline-block size-1.5 rounded-full", colors[status])}
		/>
	);
}
