import { Input } from "@/components/ui/input";
import SectionHeading from "./SectionHeading";

export default function YouTubeSection() {
	return (
		<section>
			<SectionHeading
				title="YouTube"
				description="Optional YouTube Data API key for handle resolution (future feature — works without one today)"
			/>
			<div className="rounded-xl border border-border p-4">
				<Input type="password" disabled placeholder="AIzaSy..." />
				<p className="mt-2 text-muted-foreground text-xs">
					Not yet implemented. The app resolves YouTube handles automatically
					without an API key.
				</p>
			</div>
		</section>
	);
}
