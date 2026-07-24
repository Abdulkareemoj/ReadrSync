import { Monitor, Moon, Sun } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FONT_SIZES, THEMES } from "./constants";
import SectionHeading from "./SectionHeading";
import ThemeOption from "./ThemeOption";

type Props = {
	theme: string;
	readerFontSize: string;
	onThemeChange: (value: string) => void;
	onFontSizeChange: (value: string) => void;
};

export default function AppearanceSection({
	theme,
	readerFontSize,
	onThemeChange,
	onFontSizeChange,
}: Props) {
	const themeIcons = { Sun, Moon, Monitor } as const;

	return (
		<section>
			<SectionHeading
				title="Appearance"
				description="Choose how the app looks and how text is sized for reading"
			/>

			<div className="flex flex-col gap-8">
				<div>
					<p className="mb-3 font-medium text-sm">Theme</p>
					<div className="grid grid-cols-3 gap-3">
						{THEMES.map((t) => (
							<ThemeOption
								key={t.value}
								value={t.value}
								label={t.label}
								icon={themeIcons[t.icon as keyof typeof themeIcons]}
								active={theme === t.value}
								onSelect={() => onThemeChange(t.value)}
							/>
						))}
					</div>
				</div>

				<div>
					<p className="mb-3 font-medium text-sm">Reading font size</p>
					<ToggleGroup
						type="single"
						value={readerFontSize}
						onValueChange={(v) => {
							if (v) onFontSizeChange(v);
						}}
						className="flex gap-2"
					>
						{FONT_SIZES.map((fs) => (
							<ToggleGroupItem
								key={fs.value}
								value={fs.value}
								className="flex flex-1 flex-col items-center gap-1.5 py-4 data-[state=on]:border-foreground data-[state=on]:ring-1 data-[state=on]:ring-foreground"
							>
								<span
									className="font-medium text-foreground"
									style={{ fontSize: fs.px }}
								>
									{fs.sample}
								</span>
								<span className="text-muted-foreground text-xs">
									{fs.label}
								</span>
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>
			</div>
		</section>
	);
}
