import { Cloud, LogOut, RefreshCw } from "lucide-react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Row from "./Row";
import SectionHeading from "./SectionHeading";
import StatusDot from "./StatusDot";

type Props = {
	isAuthenticated: boolean;
	authEmail: string | null;
	syncStatus: "connected" | "syncing" | "error" | "idle";
	statusLabel: string;
	lastSync: string | null;
	showConnectDialog: boolean;
	onConnectDialogChange: (open: boolean) => void;
	onSignIn: () => void;
	onSignOut: () => void;
	onSyncNow: () => void;
};

export default function CloudSyncSection({
	isAuthenticated,
	authEmail,
	syncStatus,
	statusLabel,
	lastSync,
	showConnectDialog,
	onConnectDialogChange,
	onSignIn,
	onSignOut,
	onSyncNow,
}: Props) {
	return (
		<section>
			<SectionHeading
				title="Cloud sync"
				description="Keep bookmarks, feeds, and reading progress in sync across your devices"
			/>

			<div className="rounded-xl border border-border p-4">
				{isAuthenticated ? (
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
								<Cloud className="size-5 text-primary" />
							</div>
							<div>
								<p className="text-sm font-medium">Google Drive</p>
								{authEmail && (
									<p className="text-muted-foreground text-xs">{authEmail}</p>
								)}
							</div>
						</div>
						<Button onClick={onSignOut} variant="outline" size="sm">
							<LogOut data-icon="inline-start" />
							Disconnect
						</Button>
					</div>
				) : (
					<div className="flex items-center justify-between">
						<p className="text-muted-foreground text-sm">
							Connect Google Drive to sync across devices
						</p>
						<AlertDialog
							open={showConnectDialog}
							onOpenChange={onConnectDialogChange}
						>
							<AlertDialogTrigger asChild>
								<Button size="sm">
									<Cloud data-icon="inline-start" />
									Connect
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogMedia>
										<Cloud className="size-8" />
									</AlertDialogMedia>
									<AlertDialogTitle>Connect Google Drive</AlertDialogTitle>
									<AlertDialogDescription>
										Link your Google Drive to sync bookmarks, feeds, and
										reading progress across devices. You'll be redirected to
										Google to authorize access.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel
										onClick={() => onConnectDialogChange(false)}
									>
										Cancel
									</AlertDialogCancel>
									<Button onClick={onSignIn}>
										<Cloud data-icon="inline-start" />
										Continue
									</Button>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				)}
			</div>

			{isAuthenticated && (
				<div className="mt-4">
					<Row
						label="Sync status"
						description={
							lastSync
								? `Last synced ${new Date(lastSync).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
								: undefined
						}
						last
					>
						<div className="flex items-center gap-3">
							<span className="inline-flex items-center gap-1.5 font-medium text-xs text-muted-foreground">
								<StatusDot status={syncStatus} />
								{statusLabel}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={onSyncNow}
								disabled={syncStatus === "syncing"}
							>
								<RefreshCw
									data-icon="inline-start"
									className={syncStatus === "syncing" ? "animate-spin" : ""}
								/>
								Sync now
							</Button>
						</div>
					</Row>
				</div>
			)}
		</section>
	);
}
