import type { ExportFormat } from "@packages/utils";
import { Download, Upload } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useDataActions } from "./hooks";

export default function DataSection() {
	const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
	const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
	const { syncStatus, handleExport, handleImport } = useDataActions();

	return (
		<View className="mb-4">
			<Text className="mb-3 px-1 font-semibold text-foreground text-lg">
				Data
			</Text>
			<Text className="mb-4 px-1 text-muted-foreground text-sm">
				Export, import, or manage data stored on this device
			</Text>

			{/* Export card */}
			<Card className="mb-3">
				<View className="p-4">
					<View className="flex-row items-center justify-between">
						<View className="shrink-1 pr-3">
							<Text className="font-medium text-sm">Export data</Text>
							<Text className="mt-0.5 text-muted-foreground text-xs">
								Download your data as JSON, OPML, or HTML
							</Text>
						</View>
						<View className="flex-row items-center gap-2">
							<View className="w-28">
								<Select
									value={exportFormat}
									onValueChange={(v: any) => v && setExportFormat(v.value ?? v)}
								>
									<SelectTrigger>
										<SelectValue placeholder={""} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="json" label="JSON">
											JSON
										</SelectItem>
										<SelectItem value="opml" label="OPML">
											OPML
										</SelectItem>
										<SelectItem value="html" label="HTML">
											HTML
										</SelectItem>
									</SelectContent>
								</Select>
							</View>
							<Button
								onPress={() => handleExport(exportFormat, () => {})}
								disabled={syncStatus === "syncing"}
								variant="outline"
								size="sm"
							>
								<Icon as={Download} size={16} className="mr-2" />
								<Text>Export</Text>
							</Button>
						</View>
					</View>
				</View>
			</Card>

			{/* Import card */}
			<Card>
				<View className="p-4">
					<View className="mb-4 flex-row items-center justify-between">
						<View className="shrink-1 pr-3">
							<Text className="font-medium text-sm">Import data</Text>
							<Text className="mt-0.5 text-muted-foreground text-xs">
								Load from JSON, OPML, or HTML bookmark files
							</Text>
						</View>
						<Button
							onPress={() => handleImport(importMode, () => {})}
							disabled={syncStatus === "syncing"}
							variant="outline"
							size="sm"
						>
							<Icon as={Upload} size={16} className="mr-2" />
							<Text>Import</Text>
						</Button>
					</View>
					<Separator className="mb-4" />
					<View>
						<Text className="mb-3 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
							Import mode
						</Text>
						<RadioGroup
							value={importMode}
							onValueChange={(v) => setImportMode(v as "merge" | "replace")}
						>
							<View className="flex-row gap-3">
								<View
									className={cn(
										"flex-1 flex-row items-start gap-2 rounded-xl border p-3",
										importMode === "merge"
											? "border-primary bg-primary/10"
											: "border-border",
									)}
								>
									<RadioGroupItem
										value="merge"
										id="merge-mob"
										className="mt-0.5"
									/>
									<View className="min-w-0 shrink-1">
										<Text className="font-medium text-foreground text-sm">
											Merge
										</Text>
										<Text className="mt-0.5 text-muted-foreground text-xs">
											Add alongside existing data
										</Text>
									</View>
								</View>
								<View
									className={cn(
										"flex-1 flex-row items-start gap-2 rounded-xl border p-3",
										importMode === "replace"
											? "border-primary bg-primary/10"
											: "border-border",
									)}
								>
									<RadioGroupItem
										value="replace"
										id="replace-mob"
										className="mt-0.5"
									/>
									<View className="min-w-0 shrink-1">
										<Text className="font-medium text-foreground text-sm">
											Replace
										</Text>
										<Text className="mt-0.5 text-muted-foreground text-xs">
											Replace existing with imported
										</Text>
									</View>
								</View>
							</View>
						</RadioGroup>
					</View>
				</View>
			</Card>
		</View>
	);
}
