import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
	{
		q: "Does ReadrSync store my books?",
		a: "No. ReadrSync indexes where your books live and syncs your reading position, highlights and notes. The files stay with you.",
	},
	{
		q: "Which formats are supported?",
		a: "EPUB and PDF for text, plus M4B and MP3 audiobooks. DRM-free files only.",
	},
	{
		q: "What happens if I read offline on two devices?",
		a: "Both positions are kept and reconciled when you reconnect. ReadrSync resolves to the furthest position and keeps the other as a bookmark.",
	},
	{
		q: "Is there a native desktop or mobile app?",
		a: "The web app is available today. Desktop builds for Windows, macOS and Linux and mobile builds for iOS and Android are in development.",
	},
	{
		q: "What does it cost?",
		a: "Nothing during the beta, and no account is required to try it. Pricing will be announced before the beta ends.",
	},
];

export function FAQSection() {
	return (
		<section className="bg-light-ash px-6 py-24">
			<div className="mx-auto grid max-w-345.75 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
				<h2 className="text-section">Questions</h2>
				<Accordion type="single" collapsible className="w-full">
					{faqs.map((faq) => (
						<AccordionItem
							key={faq.q}
							value={faq.q}
							className="border-pale-silver border-b"
						>
							<AccordionTrigger className="py-5 text-left font-medium text-[17px] text-carbon leading-6 hover:no-underline">
								{faq.q}
							</AccordionTrigger>
							<AccordionContent className="pb-5 text-[14px] text-graphite leading-5">
								{faq.a}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
