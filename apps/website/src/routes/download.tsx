import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/download")({
	head: () => ({
		meta: [
			{ title: "Download ReadrSync, Web, desktop and mobile" },
			{
				name: "description",
				content:
					"The ReadrSync web app is live today. Desktop builds for Windows, macOS and Linux and mobile builds for iOS and Android are in development.",
			},
			{ property: "og:title", content: "Download ReadrSync" },
			{
				property: "og:description",
				content:
					"Use ReadrSync in any modern browser today. Desktop and mobile apps are on the way.",
			},
			{ property: "og:type", content: "website" },
			{ name: "twitter:card", content: "summary_large_image" },
		],
	}),
	component: Download,
});

const platforms = [
	{
		name: "Web app",
		version: "v0.1",
		desc: "Use ReadrSync in any modern browser, no installation needed.",
		status: "available" as const,
		href: "/web",
	},
	{
		name: "Windows",
		desc: "Native app for Windows 10 and later, built with Tauri.",
		status: "dev" as const,
	},
	{
		name: "macOS",
		desc: "Universal binary for Intel and Apple Silicon.",
		status: "dev" as const,
	},
	{
		name: "Linux",
		desc: "AppImage and .deb packages for Ubuntu and derivatives.",
		status: "dev" as const,
	},
	{
		name: "iOS",
		desc: "iPhone and iPad app built with Expo.",
		status: "dev" as const,
	},
	{
		name: "Android",
		desc: "Android app built with Expo.",
		status: "dev" as const,
	},
];

const groups = [
	{
		title: "Available now",
		items: platforms.filter((p) => p.status === "available"),
	},
	{
		title: "Desktop",
		items: platforms.filter((p) =>
			["Windows", "macOS", "Linux"].includes(p.name),
		),
	},
	{
		title: "Mobile",
		items: platforms.filter((p) => ["iOS", "Android"].includes(p.name)),
	},
];

function PlatformRow({ platform }: { platform: (typeof platforms)[number] }) {
	return (
		<div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-cloud border-b py-5">
			<div className="min-w-0">
				<div className="flex items-baseline gap-3">
					<span className="font-medium text-[17px] text-carbon leading-[20px]">
						{platform.name}
					</span>
					{"version" in platform && platform.version && (
						<span className="text-[14px] text-pewter">{platform.version}</span>
					)}
				</div>
				<p className="mt-1 text-[14px] text-graphite leading-[20px]">
					{platform.desc}
				</p>
			</div>
			<div className="shrink-0">
				{platform.status === "available" ? (
					<Link to={platform.href ?? "/"}>
						<Button size="ctaNarrow">Open app</Button>
					</Link>
				) : (
					<span className="text-[14px] text-silver-fog">In development</span>
				)}
			</div>
		</div>
	);
}

function Download() {
	return (
		<main className="bg-background">
			<section className="px-6 pt-40 pb-16 text-center">
				<div className="mx-auto max-w-[520px]">
					<h1 className="text-hero">Get ReadrSync</h1>
					<p className="mt-4 text-[14px] text-graphite leading-[20px]">
						The web app is live and ready to use. Desktop and mobile apps are
						available as development builds from the source repository.
					</p>
				</div>
			</section>

			<div className="mx-auto max-w-[720px] px-6 pb-32">
				{groups.map((group) => (
					<section key={group.title} className="mb-16">
						<h2 className="font-medium text-[14px] text-pewter leading-[20px]">
							{group.title}
						</h2>
						<div className="mt-2">
							{group.items.map((platform) => (
								<PlatformRow key={platform.name} platform={platform} />
							))}
						</div>
					</section>
				))}

				<section className="bg-light-ash px-6 py-10 text-center">
					<h2 className="font-medium text-[17px] text-carbon leading-[20px]">
						Get notified when the desktop apps launch
					</h2>
					<p className="mt-2 text-[14px] text-graphite leading-[20px]">
						One email when each platform ships. No newsletters.
					</p>
					<form
						className="mx-auto mt-6 flex max-w-[420px] flex-col items-center gap-3 sm:flex-row sm:justify-center"
						onSubmit={(e) => e.preventDefault()}
					>
						<input
							type="email"
							placeholder="your@email.com"
							aria-label="Email address"
							className="h-10 w-full min-w-0 rounded-md border border-pale-silver bg-background px-4 text-[14px] text-carbon placeholder-silver-fog outline-none transition-tesla focus:border-primary sm:flex-1"
						/>
						<Button type="submit" size="ctaNarrow">
							Notify me
						</Button>
					</form>
				</section>
			</div>
		</main>
	);
}
