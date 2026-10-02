import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/download")({
	head: () => ({
		meta: [
			{ title: "Download ReadrSync, Web, desktop and mobile" },
			{
				name: "description",
				content:
					"Use ReadrSync in any modern browser today. Desktop installers for Windows, macOS and Linux and an Android APK are generated for every release.",
			},
			{ property: "og:title", content: "Download ReadrSync" },
			{
				property: "og:description",
				content:
					"Use ReadrSync in any modern browser today. Desktop and Android builds ship with every release.",
			},
			{ property: "og:type", content: "website" },
			{ name: "twitter:card", content: "summary_large_image" },
		],
	}),
	component: Download,
});

const RELEASES_URL = "https://github.com/Abdulkareemoj/ReadrSync/releases";

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
		desc: "Native installer for Windows 10 and later, built with Tauri.",
		status: "release" as const,
	},
	{
		name: "macOS",
		desc: "Universal builds for Intel and Apple Silicon, built with Tauri.",
		status: "release" as const,
	},
	{
		name: "Linux",
		desc: "AppImage and .deb packages for Ubuntu and derivatives.",
		status: "release" as const,
	},
	{
		name: "Android",
		desc: "Side-loadable APK built with Expo for every release.",
		status: "release" as const,
	},
	{
		name: "iOS",
		desc: "iPhone and iPad app built with Expo.",
		status: "dev" as const,
	},
];

const groups = [
	{
		title: "Available now",
		items: platforms.filter((p) => p.status === "available"),
	},
	{
		title: "Desktop and Android",
		items: platforms.filter((p) =>
			["Windows", "macOS", "Linux", "Android"].includes(p.name),
		),
	},
	{
		title: "Mobile",
		items: platforms.filter((p) => ["iOS"].includes(p.name)),
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
				) : platform.status === "release" ? (
					<a href={RELEASES_URL} target="_blank" rel="noreferrer">
						<Button size="ctaNarrow">Get from Releases</Button>
					</a>
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
						The web app is live and ready to use. Desktop installers and an
						Android APK are generated for every release on GitHub.
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
						Every release, every platform
					</h2>
					<p className="mt-2 text-[14px] text-graphite leading-[20px]">
						Desktop installers and the Android APK are attached to each GitHub
						release automatically.
					</p>
					<div className="mt-6 flex justify-center">
						<a href={RELEASES_URL} target="_blank" rel="noreferrer">
							<Button size="ctaNarrow">View all releases</Button>
						</a>
					</div>
				</section>
			</div>
		</main>
	);
}
