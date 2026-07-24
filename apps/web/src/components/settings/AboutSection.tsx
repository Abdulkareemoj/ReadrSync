import Row from "./Row";
import SectionHeading from "./SectionHeading";

export default function AboutSection() {
	return (
		<section>
			<SectionHeading
				title="About"
				description="App version and build information"
			/>
			<div>
				<Row label="Version">
					<span className="text-muted-foreground text-sm">1.0.0</span>
				</Row>
				<Row label="Build" last>
					<span className="text-muted-foreground text-sm">2024.04.12</span>
				</Row>
			</div>
		</section>
	);
}
