import { MediaLightbox } from "@/components/media-lightbox";

const features = [
	{
		title: "Local-first",
		body: "Everything lives in SQLite on your device. The app works fully offline; the cloud is optional, never required.",
	},
	{
		title: "Full-text search",
		body: "Search every bookmark and article in milliseconds, powered by SQLite full-text search with graceful fallbacks.",
	},
	{
		title: "Highlights that travel",
		body: "Highlight any passage and keep your notes with it. Highlights sync to your other devices alongside read state.",
	},
	{
		title: "Feeds, simplified",
		body: "RSS and Atom subscriptions with offline reading, feed discovery by URL or keyword, and YouTube channel support.",
	},
	{
		title: "Sync on your terms",
		body: "Optional Google Drive sync through your own account. Last-write-wins merging, no servers of ours in the path.",
	},
	{
		title: "Every platform",
		body: "Web today. Native Windows, macOS, Linux and Android builds are generated for every release.",
	},
];

const categories = [
	{
		label: "Bookmarks",
		media: "Screenshot, the bookmark library on desktop with collections and tags",
		src: "/screens/desktop-bookmarks-dark.png",
	},
	{
		label: "Feeds",
		media: "Screenshot, the RSS article grid on desktop in dark mode",
		src: "/screens/desktop-rss-articles-dark.png",
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

		<div id="screens" className="bg-background px-6 py-24">
			<div className="mx-auto grid max-w-[1383px] gap-4 lg:grid-cols-2">
				{categories.map((category) => (
					<div
						key={category.label}
						className="relative aspect-[2/1] overflow-hidden rounded-xl"
					>
						<MediaLightbox
							label={category.media}
							src={category.src}
							className="h-full w-full"
						/>
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
