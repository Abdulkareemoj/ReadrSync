type Props = {
	streak: number;
};

export default function ReadingStreakSection({ streak }: Props) {
	if (streak === 0) return null;

	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<h2 className="mb-4 font-semibold text-foreground text-xl">
				Reading Streak
			</h2>
			<div className="font-bold text-2xl text-primary">
				{streak} day{streak !== 1 ? "s" : ""}
			</div>
			<p className="mt-1 text-muted-foreground text-sm">
				Keep up the momentum!
			</p>
		</div>
	);
}
