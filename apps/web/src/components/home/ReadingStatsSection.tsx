type Props = {
	totalRead: number;
	totalLiked: number;
	totalSaved: number;
};

export default function ReadingStatsSection({
	totalRead,
	totalLiked,
	totalSaved,
}: Props) {
	if (totalRead === 0) return null;

	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<h2 className="mb-4 font-semibold text-foreground text-xl">
				Reading Stats
			</h2>
			<div className="flex flex-col gap-2">
				<div className="flex justify-between">
					<span className="text-muted-foreground text-sm">Articles Read</span>
					<span className="font-semibold text-sm">{totalRead}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground text-sm">Liked</span>
					<span className="font-semibold text-sm">{totalLiked}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground text-sm">Saved</span>
					<span className="font-semibold text-sm">{totalSaved}</span>
				</div>
			</div>
		</div>
	);
}
