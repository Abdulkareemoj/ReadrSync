import { MediaLightbox } from "@/components/media-lightbox";

const steps = [
	{
		number: "01",
		title: "Save what matters",
		body: "Clip any page into your library. Titles, descriptions and favicons are fetched automatically, then organized with collections and tags.",
		media: "Step one, the bookmark library on desktop with collections and tags",
		mediaSrc: "/screens/desktop-bookmarks-dark.png",
	},
	{
		number: "02",
		title: "Follow your feeds",
		body: "Subscribe to RSS and Atom feeds, including YouTube channels. New articles land on every device, ready to read offline.",
		media: "Step two, the RSS reader on desktop in dark mode",
		mediaSrc: "/screens/desktop-rss-dark.png",
	},
	{
		number: "03",
		title: "Read anywhere",
		body: "Phone at lunch, desktop at your desk. Highlights, saved articles and read state travel with you through optional Google Drive sync.",
		media: "Step three, ReadrSync on Android, saved links and feeds in your pocket",
		mediaSrc: "/screens/mobile-rss-light.png",
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

						{/* Copy half, overlaps the media edge on large screens */}
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
