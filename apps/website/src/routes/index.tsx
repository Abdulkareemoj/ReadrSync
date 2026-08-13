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
			{ title: "ReadrSync, One page number across every device" },
			{
				name: "description",
				content:
					"ReadrSync keeps your ebooks and audiobooks on the same page across phone, tablet and desktop. Sub-second sync, offline first, free in beta.",
			},
			{
				property: "og:title",
				content: "ReadrSync, One page number across every device",
			},
			{
				property: "og:description",
				content:
					"Keep your reading position, highlights and notes in sync across every device. Free while in beta.",
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
