import { useCallback, useEffect, useRef, useState } from "react";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
	{
		label:
			"Product shot — ReadrSync library view on desktop, reading progress synced across shelves",
	},
	{
		label:
			"Product shot — phone and tablet side by side, resuming the same page mid-sentence",
	},
	{
		label: "Product shot — highlights and notes panel syncing in real time",
	},
];

const INTERVAL = 6000;

export default function Hero() {
	const [index, setIndex] = useState(0);
	const timer = useRef<ReturnType<typeof setInterval> | null>(null);

	const start = useCallback(() => {
		if (timer.current) clearInterval(timer.current);
		timer.current = setInterval(() => {
			setIndex((i) => (i + 1) % slides.length);
		}, INTERVAL);
	}, []);

	useEffect(() => {
		start();
		return () => {
			if (timer.current) clearInterval(timer.current);
		};
	}, [start]);

	const go = useCallback(
		(next: number) => {
			setIndex(((next % slides.length) + slides.length) % slides.length);
			start();
		},
		[start],
	);

	return (
		<section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-6 pt-28 pb-16">
			<div className="flex flex-col items-center text-center">
				<h1 className="text-foreground text-hero">ReadrSync</h1>
				<p className="mt-2 text-muted-foreground text-promo">
					Every book, every device, one page number
				</p>

				<div className="mt-8 flex w-full max-w-[420px] flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
					<a href="/download" className="w-full sm:w-auto">
						<Button size="cta">Get ReadrSync</Button>
					</a>
					<a href="#how-it-works" className="w-full sm:w-auto">
						<Button variant="secondary" size="cta">
							See how it works
						</Button>
					</a>
				</div>
			</div>

			<div className="mt-12 w-full max-w-[1100px]">
				<div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-light-ash sm:aspect-[16/9]">
					{slides.map((slide, i) => (
						<div
							key={slide.label}
							aria-hidden={i !== index}
							className={cn(
								"absolute inset-0 transition-tesla",
								i === index ? "opacity-100" : "opacity-0",
							)}
						>
							<MediaPlaceholder label={slide.label} />
						</div>
					))}
				</div>

				<div className="mt-4 flex items-center justify-center gap-2">
					{slides.map((slide, i) => (
						<button
							key={slide.label}
							type="button"
							onClick={() => go(i)}
							aria-label={`Show slide ${i + 1}`}
							aria-current={i === index}
							className={cn(
								"h-1.5 rounded-sm transition-tesla",
								i === index
									? "w-8 bg-foreground"
									: "w-4 bg-pale-silver hover:bg-silver-fog",
							)}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
