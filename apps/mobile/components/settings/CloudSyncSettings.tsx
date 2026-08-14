import { Cloud, LogOut } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { useCloudSync } from "./hooks";

export default function CloudSyncSettings() {
	const [lastSync, setLastSync] = useState<string | null>(null);
	const {
		isAuthenticated,
		authEmail,
		syncStatus,
		handleSignIn,
		handleSignOut,
		handleSyncNow,
	} = useCloudSync();

	return (
		<Card className="mb-4">
			<View className="px-4 py-3">
				<View className="mb-1">
					<Text className="font-semibold text-foreground text-lg">
						Cloud sync
					</Text>
					<Text className="text-muted-foreground text-sm">
						Keep bookmarks, feeds, and reading progress in sync across your
						devices
					</Text>
				</View>
				<Separator className="mb-4" />
				<View className="rounded-xl border border-border p-4">
					{isAuthenticated ? (
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center gap-3">
								<View className="flex size-10 items-center justify-center rounded-full bg-primary/10">
									<Icon as={Cloud} size={20} className="text-primary" />
								</View>
								<View>
									<Text className="font-medium text-sm">Google Drive</Text>
									{authEmail && (
										<Text className="text-muted-foreground text-xs">
											{authEmail}
										</Text>
									)}
								</View>
							</View>
							<Button onPress={handleSignOut} variant="outline" size="sm">
								<Icon as={LogOut} size={16} className="mr-2" />
								<Text>Disconnect</Text>
							</Button>
						</View>
					) : (
						<View className="flex-row items-center justify-between">
							<Text className="shrink-1 pr-3 text-muted-foreground text-sm">
								Connect Google Drive to sync across devices
							</Text>
							<Button onPress={handleSignIn} size="sm">
								<Icon as={Cloud} size={16} className="mr-2" />
								<Text className="text-primary-foreground">Connect</Text>
							</Button>
						</View>
					)}
				</View>
				{isAuthenticated && (
					<View className="mt-4 flex-row items-center justify-between">
						<View>
							<Text className="font-medium text-sm">Sync status</Text>
							{lastSync && (
								<Text className="text-muted-foreground text-xs">
									Last synced{" "}
									{new Date(lastSync).toLocaleDateString(undefined, {
										month: "short",
										day: "numeric",
										hour: "numeric",
										minute: "2-digit",
									})}
								</Text>
							)}
						</View>
						<View className="flex-row items-center gap-2">
							<Badge
								variant={
									syncStatus === "connected"
										? "default"
										: syncStatus === "error"
											? "destructive"
											: "secondary"
								}
							>
								<Text className="text-xs">
									{syncStatus === "connected"
										? "Connected"
										: syncStatus === "syncing"
											? "Syncing"
											: syncStatus === "error"
												? "Error"
												: "Idle"}
								</Text>
							</Badge>
							<Button
								onPress={() => handleSyncNow(setLastSync)}
								variant="outline"
								size="sm"
								disabled={syncStatus === "syncing"}
							>
								<Text>Sync now</Text>
							</Button>
						</View>
					</View>
				)}
			</View>
		</Card>
	);
}
