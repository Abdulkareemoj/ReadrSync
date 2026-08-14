import { Download, GitMerge, RotateCcw, Trash2, Upload } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { ExportFormat } from "@/lib/sync";
import { cn } from "@/lib/utils";
import Row from "./Row";
import SectionHeading from "./SectionHeading";

type Props = {
	exportFormat: ExportFormat;
	importMode: "merge" | "replace";
	onExportFormatChange: (v: ExportFormat) => void;
	onImportModeChange: (v: "merge" | "replace") => void;
	onExport: () => void;
	onImport: () => void;
	onClearCache: () => void;
};

export default function DataSection({
	exportFormat,
	importMode,
	onExportFormatChange,
	onImportModeChange,
	onExport,
	onImport,
	onClearCache,
}: Props) {
	const id = useId();

	return (
		<section>
			<SectionHeading
				title="Data"
				description="Export, import, or clear data stored on this device"
			/>

			<div className="flex flex-col gap-4">
				<div className="rounded-xl border border-border p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-sm">Export data</p>
							<p className="mt-0.5 text-muted-foreground text-xs">
								Download your data as JSON, OPML, or HTML
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Select
								value={exportFormat}
								onValueChange={(v) => onExportFormatChange(v as ExportFormat)}
							>
								<SelectTrigger className="w-28">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="json">JSON</SelectItem>
									<SelectItem value="opml">OPML</SelectItem>
									<SelectItem value="html">HTML</SelectItem>
								</SelectContent>
							</Select>
							<Button variant="outline" size="sm" onClick={onExport}>
								<Download data-icon="inline-start" />
								Export
							</Button>
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-border p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-sm">Import data</p>
							<p className="mt-0.5 text-muted-foreground text-xs">
								Load from JSON, OPML, or HTML bookmark files
							</p>
						</div>
						<Button variant="outline" size="sm" onClick={onImport}>
							<Upload data-icon="inline-start" />
							Import
						</Button>
					</div>
					<Separator className="my-4" />
					<div>
						<p className="mb-3 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
							Import mode
						</p>
						<RadioGroup
							value={importMode}
							onValueChange={(value) =>
								onImportModeChange(value as "merge" | "replace")
							}
							className="grid grid-cols-2 gap-3"
						>
							<label
								htmlFor={`${id}-merge`}
								className={cn(
									"group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all",
									importMode === "merge"
										? "border-primary bg-primary/10 shadow-sm"
										: "border-border bg-background hover:border-foreground/50",
								)}
							>
								<RadioGroupItem
									value="merge"
									id={`${id}-merge`}
									className="mt-0.5 size-4 shrink-0"
									aria-describedby={`${id}-merge-description`}
								/>
								<div className="min-w-0">
									<div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
										<GitMerge className="size-3.5" />
										Merge
									</div>
									<p
										id={`${id}-merge-description`}
										className="mt-0.5 text-muted-foreground text-xs"
									>
										Add imported data alongside existing content.
									</p>
								</div>
							</label>
							<label
								htmlFor={`${id}-replace`}
								className={cn(
									"group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all",
									importMode === "replace"
										? "border-primary bg-primary/10 shadow-sm"
										: "border-border bg-background hover:border-foreground/50",
								)}
							>
								<RadioGroupItem
									value="replace"
									id={`${id}-replace`}
									className="mt-0.5 size-4 shrink-0"
									aria-describedby={`${id}-replace-description`}
								/>
								<div className="min-w-0">
									<div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
										<RotateCcw className="size-3.5" />
										Replace
									</div>
									<p
										id={`${id}-replace-description`}
										className="mt-0.5 text-muted-foreground text-xs"
									>
										Replace existing data with the imported file.
									</p>
								</div>
							</label>
						</RadioGroup>
					</div>
				</div>

				<Row
					label="Clear cache"
					description="Remove locally cached data, feeds and bookmarks are preserved"
					last
				>
					<Button
						variant="outline"
						size="sm"
						onClick={onClearCache}
						className="text-destructive hover:bg-destructive/10 hover:text-destructive"
					>
						<Trash2 data-icon="inline-start" />
						Clear
					</Button>
				</Row>
			</div>
		</section>
	);
}
