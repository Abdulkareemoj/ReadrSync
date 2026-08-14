import { X } from "lucide-react";
import { Button } from "../ui/button";

type Props = {
	tags: string[];
	onRemoveTag: (tag: string) => void;
	onClearAll: () => void;
};

export default function FilterChips({ tags, onRemoveTag, onClearAll }: Props) {
	if (tags.length === 0) return null;

	return (
		<div className="flex flex-wrap items-center gap-2 border-b px-6 py-2">
			<span className="font-medium text-muted-foreground text-xs">
				Filters:
			</span>
			{tags.map((tag) => (
				<span
					key={tag}
					className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 font-medium text-primary text-xs"
				>
					{tag}
					<Button
						type="button"
						onClick={() => onRemoveTag(tag)}
						className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
					>
						<X className="size-3" />
					</Button>
				</span>
			))}
			<Button
				type="button"
				onClick={onClearAll}
				className="ml-1 text-muted-foreground text-xs hover:text-foreground"
			>
				Clear all
			</Button>
		</div>
	);
}
