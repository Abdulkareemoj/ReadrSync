import { Separator } from "@/components/ui/separator";

type Props = {
	label: string;
	description?: string;
	children: React.ReactNode;
	last?: boolean;
};

export default function Row({ label, description, children, last }: Props) {
	return (
		<>
			<div className="flex items-center justify-between gap-6 py-4">
				<div className="min-w-0">
					<p className="font-medium text-sm text-foreground">{label}</p>
					{description && (
						<p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
					)}
				</div>
				<div className="shrink-0">{children}</div>
			</div>
			{!last && <Separator />}
		</>
	);
}
