import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
	{
		q: "Where does my data live?",
		a: "On your device, in a local SQLite database. Optional Google Drive sync stores a copy of your library in your own Drive. We run no servers.",
	},
	{
		q: "Can I import my existing bookmarks and feeds?",
		a: "Yes. Import HTML bookmarks and OPML feed lists from any browser or reader. JSON export is supported too, so your library is never locked in.",
	},
	{
		q: "What happens if I use the app offline on two devices?",
		a: "Both devices keep their changes and reconcile when you reconnect. Google Drive sync resolves conflicts with the newest edit winning.",
	},
	{
		q: "Is there a native desktop or mobile app?",
		a: "Yes. Windows, macOS and Linux installers and an Android APK are generated for each release, see the download page. iOS is in development.",
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
