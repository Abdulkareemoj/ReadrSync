import { MediaLightbox } from "@/components/media-lightbox";

const steps = [
	{
		number: "01",
		title: "Connect your library",
		body: "Point ReadrSync at your ebooks, audiobooks and reading accounts. Nothing is copied or uploaded — it reads where your books already live.",
		media: "Step one — an open laptop showing a library import in progress",
		mediaSrc: "/rss.png",
	},
	{
		number: "02",
		title: "Read anywhere",
		body: "Open the same title on your phone at lunch and your tablet at night. Position, highlights and notes travel with you in under a second.",
		media: "Step two — hands holding a tablet on a train at dusk",
		mediaSrc: "/home.jpeg",
	},
	{
		number: "03",
		title: "Stay in one place",
		body: "Switching between text and audio keeps a single page number. No bookmarks to reconcile, no guessing where you left off.",
		media:
			"Step three — over-the-shoulder shot of a phone resuming an audiobook",
		mediaSrc: "/bookmarks.png",
	},
];

export function HowItWorks() {
	return (
		<section id="how-it-works">
			{steps.map((step, index) => {
				const reversed = index % 2 === 1;
				return (
					<div
						key={step.number}
						className="relative isolate flex flex-col lg:min-h-[520px] lg:flex-row"
					>
						{/* Full-bleed media half */}
						<div
							className={`relative z-0 h-[46vh] w-full lg:absolute lg:inset-y-0 lg:h-auto lg:w-[54%] ${
								reversed ? "lg:right-0" : "lg:left-0"
							}`}
						>
							<MediaLightbox
								label={step.media}
								src={step.mediaSrc}
								className="h-full w-full"
							/>
						</div>

						{/* Copy half — overlaps the media edge on large screens */}
						<div
							className={`relative z-10 flex w-full items-center bg-background px-6 py-16 lg:min-h-[520px] lg:w-[52%] lg:px-16 ${
								reversed ? "lg:mr-auto" : "lg:ml-auto"
							}`}
						>
							<div className="max-w-[420px]">
								<span className="block font-medium text-[14px] text-pewter">
									{step.number}
								</span>
								<h2 className="mt-4 text-section">{step.title}</h2>
								<p className="mt-4 text-[14px] text-graphite leading-[20px]">
									{step.body}
								</p>
							</div>
						</div>
					</div>
				);
			})}
		</section>
	);
}
