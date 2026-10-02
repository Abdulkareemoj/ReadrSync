import { createFileRoute } from "@tanstack/react-router";
import { FAQSection } from "@/components/faq-section";
import { FeaturesSection } from "@/components/features";
import Hero from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { PromoBand } from "@/components/promo-band";
import { TestimonialsSection } from "@/components/testimonials";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: "ReadrSync, Bookmarks and RSS, everywhere you read" },
			{
				name: "description",
				content:
					"ReadrSync keeps your links and feeds on every device. Local-first, offline-ready, optional Google Drive sync. Free in beta.",
			},
			{
				property: "og:title",
				content: "ReadrSync, Bookmarks and RSS, everywhere you read",
			},
			{
				property: "og:description",
				content:
					"Save links, follow feeds and read anywhere. Local-first with optional Google Drive sync. Free while in beta.",
			},
			{ property: "og:type", content: "website" },
			{ name: "twitter:card", content: "summary_large_image" },
		],
	}),
	component: App,
});

function App() {
	return (
		<main>
			<Hero />
			<HowItWorks />
			<FeaturesSection />
			<TestimonialsSection />
			<PromoBand />
			<FAQSection />
		</main>
	);
}
