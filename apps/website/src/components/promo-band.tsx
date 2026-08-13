import {
	Android,
	Browser,
	IPad,
	IPhone,
	MacbookPro,
	Safari,
} from "@/components/devices";
import { Zoomable } from "@/components/media-lightbox";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { Button } from "@/components/ui/button";

const shots = {
	mac: "ReadrSync on macOS — library grid with continue-reading shelf",
	safari: "ReadrSync web app in Safari — reader view with synced highlights",
	browser: "ReadrSync web app — notes panel exporting to Markdown",
	ipad: "ReadrSync on iPad — two-page reader with margin notes",
	iphone: "ReadrSync on iPhone — resuming an audiobook at the same page",
	android: "ReadrSync on Android — offline library with pending sync badge",
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

				{/* Device showcase — every frame opens fullscreen */}
				<div className="mt-16 grid gap-6 lg:grid-cols-12">
					<div className="lg:col-span-7">
						<Zoomable
							contentClassName="max-w-[1100px]"
							className="block w-full"
						>
							<MacbookPro>
								<MediaPlaceholder label={shots.mac} />
							</MacbookPro>
						</Zoomable>
					</div>

					<div className="grid grid-cols-2 items-end gap-6 lg:col-span-5">
						<Zoomable
							contentClassName="max-w-[380px]"
							className="mx-auto block w-full max-w-[200px]"
						>
							<IPhone>
								<MediaPlaceholder label={shots.iphone} />
							</IPhone>
						</Zoomable>
						<Zoomable
							contentClassName="max-w-[380px]"
							className="mx-auto block w-full max-w-[200px]"
						>
							<Android>
								<MediaPlaceholder label={shots.android} />
							</Android>
						</Zoomable>
					</div>

					<div className="lg:col-span-5">
						<Zoomable contentClassName="max-w-[900px]" className="block w-full">
							<IPad>
								<MediaPlaceholder label={shots.ipad} />
							</IPad>
						</Zoomable>
					</div>

					<div className="lg:col-span-7">
						<Zoomable
							contentClassName="max-w-[1100px]"
							className="block w-full"
						>
							<Safari>
								<MediaPlaceholder label={shots.safari} />
							</Safari>
						</Zoomable>
					</div>

					<div className="lg:col-span-12">
						<Zoomable
							contentClassName="max-w-[1200px]"
							className="block w-full"
						>
							<Browser>
								<MediaPlaceholder label={shots.browser} />
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
