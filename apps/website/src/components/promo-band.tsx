import {
	Android,
	Browser,
	IPad,
	IPhone,
	MacbookPro,
	Safari,
} from "@/components/devices";
import { Zoomable } from "@/components/media-lightbox";
import { Button } from "@/components/ui/button";

const shots = {
	mac: "ReadrSync on macOS, dashboard with reading stats and pinned items",
	safari: "ReadrSync web app, immersive article reader in dark mode",
	browser: "ReadrSync web app, the RSS article grid on desktop",
	ipad: "ReadrSync on iPad, the bookmark library with collections and tags",
	iphone: "ReadrSync on iPhone, dashboard with saved links and reading stats",
	android: "ReadrSync on Android, RSS feeds and articles offline",
};

export function PromoBand() {
	return (
		<section className="relative overflow-hidden bg-carbon px-6 py-24 dark:bg-card">
			<div className="mx-auto w-full max-w-[1383px]">
				<div className="flex flex-col items-center text-center">
					<h2 className="text-background text-hero dark:text-foreground">
						Free while in beta
					</h2>
					<p className="mt-2 text-primary text-promo">No account required</p>
				</div>

				{/* Device showcase, every frame opens fullscreen */}
				<div className="mt-16 grid gap-6 lg:grid-cols-12">
					<div className="lg:col-span-7">
						<Zoomable
							contentClassName="max-w-[1100px]"
							className="block w-full"
						>
							<MacbookPro>
								<img
									src="/screens/desktop-home-dark.png"
									alt={shots.mac}
									className="h-full w-full object-cover object-top"
								/>
							</MacbookPro>
						</Zoomable>
					</div>

					<div className="grid grid-cols-2 items-end gap-6 lg:col-span-5">
						<Zoomable
							contentClassName="max-w-[380px]"
							className="mx-auto block w-full max-w-[200px]"
						>
							<IPhone>
								<img
									src="/screens/mobile-home-light.png"
									alt={shots.iphone}
									className="h-full w-full object-cover object-top"
								/>
							</IPhone>
						</Zoomable>
						<Zoomable
							contentClassName="max-w-[380px]"
							className="mx-auto block w-full max-w-[200px]"
						>
							<Android>
								<img
									src="/screens/mobile-rss-light.png"
									alt={shots.android}
									className="h-full w-full object-cover object-top"
								/>
							</Android>
						</Zoomable>
					</div>

					<div className="lg:col-span-5">
						<Zoomable contentClassName="max-w-[900px]" className="block w-full">
							<IPad>
								<img
									src="/screens/desktop-bookmarks-dark.png"
									alt={shots.ipad}
									className="h-full w-full object-cover object-top"
								/>
							</IPad>
						</Zoomable>
					</div>

					<div className="lg:col-span-7">
						<Zoomable
							contentClassName="max-w-[1100px]"
							className="block w-full"
						>
							<Safari>
								<img
									src="/screens/desktop-reader-dark.png"
									alt={shots.safari}
									className="h-full w-full object-cover object-top"
								/>
							</Safari>
						</Zoomable>
					</div>

					<div className="lg:col-span-12">
						<Zoomable
							contentClassName="max-w-[1200px]"
							className="block w-full"
						>
							<Browser>
								<img
									src="/screens/desktop-rss-articles-dark.png"
									alt={shots.browser}
									className="h-full w-full object-cover object-top"
								/>
							</Browser>
						</Zoomable>
					</div>
				</div>

				<div className="mt-16 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
					<a href="/web" className="w-full sm:w-auto">
						<Button size="cta">Open the web app</Button>
					</a>
					<a href="/download" className="w-full sm:w-auto">
						<Button variant="overlay" size="ctaNarrow">
							Download
						</Button>
					</a>
				</div>
			</div>
		</section>
	);
}
