import { Badge } from "@/components/ui/badge";

type Collection = {
	id: string;
	name: string;
};

type Props = {
	collections: Collection[];
};

export default function CollectionsSection({ collections }: Props) {
	if (collections.length <= 2) return null;

	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<h2 className="mb-4 font-semibold text-foreground text-xl">
				Collections
			</h2>
			<div className="flex flex-wrap gap-2">
				{collections.slice(0, 6).map((collection) => (
					<Badge
						key={collection.id}
						variant="secondary"
						className="rounded-full px-3 py-1 font-medium text-sm"
					>
						{collection.name}
					</Badge>
				))}
				{collections.length > 6 && (
					<span className="inline-flex rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground text-sm">
						+{collections.length - 6} more
					</span>
				)}
			</div>
		</div>
	);
}
