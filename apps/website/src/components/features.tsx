import { MediaLightbox } from "@/components/media-lightbox";

const features = [
	{
		title: "Sub-second sync",
		body: "Position updates land on every signed-in device before you finish putting your phone down.",
	},
	{
		title: "Text and audio, unified",
		body: "One progress marker shared between the ebook and the audiobook edition of the same title.",
	},
	{
		title: "Offline first",
		body: "Read on a plane, sync on landing. Conflicts resolve to the furthest honest position.",
	},
	{
		title: "Highlights that travel",
		body: "Notes, highlights and bookmarks are portable and exportable in plain Markdown.",
	},
	{
		title: "Private by default",
		body: "Your library index stays on your devices. We sync positions, not your books.",
	},
	{
		title: "Every platform",
		body: "Web today, with native desktop and mobile builds in active development.",
	},
];

const categories = [
	{
		label: "Fiction",
		media: "Category card — a paperback open on a sunlit bench",
	},
	{
		label: "Non-fiction",
		media: "Category card — a desk with annotated hardcovers",
	},
];

export function FeaturesSection() {
	return (
		<section id="features">
			<div className="flex min-h-screen items-center bg-light-ash px-6 py-12">
				<div className="mx-auto w-full max-w-[1383px]">
					<h2 className="max-w-[520px] text-section">
						Built so you never lose your place
					</h2>
					<div className="mt-16 grid gap-x-16 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((feature) => (
							<div key={feature.title} className="max-w-[340px]">
								<h3 className="font-medium text-[17px] leading-[20px]">
									{feature.title}
								</h3>
								<p className="mt-3 text-[14px] text-graphite leading-[20px]">
									{feature.body}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			<div id="library" className="bg-background px-6 py-24">
				<div className="mx-auto grid max-w-[1383px] gap-4 lg:grid-cols-2">
					{categories.map((category) => (
						<div
							key={category.label}
							className="relative aspect-[2/1] overflow-hidden rounded-xl"
						>
							<MediaLightbox label={category.media} />
							<span className="absolute top-6 left-6 font-medium text-[16px] text-background">
								{category.label}
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
