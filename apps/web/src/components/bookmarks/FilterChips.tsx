import { X } from "lucide-react";

type Props = {
	tags: string[];
	onRemoveTag: (tag: string) => void;
	onClearAll: () => void;
};

export default function FilterChips({ tags, onRemoveTag, onClearAll }: Props) {
	if (tags.length === 0) return null;

	return (
		<div className="flex flex-wrap items-center gap-2 border-b px-6 py-2">
			<span className="text-xs text-muted-foreground font-medium">
				Filters:
			</span>
			{tags.map((tag) => (
				<span
					key={tag}
					className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
				>
					{tag}
					<button
						onClick={() => onRemoveTag(tag)}
						className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
					>
						<X className="size-3" />
					</button>
				</span>
			))}
			<button
				onClick={onClearAll}
				className="ml-1 text-xs text-muted-foreground hover:text-foreground"
			>
				Clear all
			</button>
		</div>
	);
}
