import { useId } from "react";
import { Text, View } from "react-native";
import { Uniwind, useUniwind } from "uniwind";
import { Monitor, Moon, Sun } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettingsStore } from "@/lib/store";

const THEMES = [
	{ value: "light", label: "Light", desc: "Bright and clean", icon: Sun, iconClass: "text-yellow-500" },
	{ value: "dark", label: "Dark", desc: "Easy on the eyes", icon: Moon, iconClass: "text-blue-500" },
	{ value: "system", label: "System", desc: "Follows device", icon: Monitor, iconClass: "text-muted-foreground" },
] as const;

export default function ThemeSettings() {
	const { theme } = useUniwind();
	const setReaderTheme = useSettingsStore((state) => state.setTheme);
	const id = useId();

	const handleChange = (value: string) => {
		Uniwind.setTheme(value as "light" | "dark" | "system");
		if (value !== "system") {
			setReaderTheme(value as "light" | "dark");
		}
	};

	return (
		<Card className="mb-4">
			<View className="px-4 py-3">
				<Text className="mb-4 font-semibold text-foreground text-lg">
					Theme
				</Text>
				<RadioGroup value={theme} onValueChange={handleChange}>
					{THEMES.map((t) => (
						<View
							key={t.value}
							className="relative mb-3 flex flex-row items-center justify-between rounded-lg border border-input p-3 last:mb-0"
						>
							<View className="flex-row items-center gap-3">
								<Icon as={t.icon} size={20} className={t.iconClass} />
								<View>
									<Label className="font-medium">{t.label}</Label>
									<Text className="text-muted-foreground text-sm">
										{t.desc}
									</Text>
								</View>
							</View>
							<RadioGroupItem value={t.value} id={`${id}-${t.value}`} />
						</View>
					))}
				</RadioGroup>
			</View>
		</Card>
	);
}
