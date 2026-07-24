import { Text, View } from "react-native";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSettingsStore } from "@/lib/store";
import { FONT_SIZES } from "./constants";

export default function ReadingSettings() {
	const { readerFontSize, setReaderFontSize } = useSettingsStore();

	return (
		<Card className="mb-4">
			<View className="px-4 py-3">
				<Text className="mb-1 font-semibold text-foreground text-lg">
					Reading
				</Text>
				<Text className="mb-4 text-muted-foreground text-sm">
					Customize how articles are displayed
				</Text>
				<Separator className="mb-4" />
				<Text className="mb-3 font-medium text-sm">Font Size</Text>
				<Select
					value={{
						value: readerFontSize,
						label:
							FONT_SIZES.find((fs) => fs.value === readerFontSize)?.label ?? "",
					}}
					onValueChange={(option) => {
						if (option)
							setReaderFontSize(option.value as "sm" | "md" | "lg");
					}}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select font size" />
					</SelectTrigger>
					<SelectContent className="w-full">
						{FONT_SIZES.map((fs) => (
							<SelectItem key={fs.value} value={fs.value} label={fs.label}>
								{fs.desc}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</View>
		</Card>
	);
}
