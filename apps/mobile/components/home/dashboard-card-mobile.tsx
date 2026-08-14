import { Link } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface DashboardCardMobileProps {
	title: string;
	value: number;
	icon: LucideIcon;
	to: string;
	colorClass: string;
}

export function DashboardCardMobile({
	title,
	value,
	icon: IconComponent,
	to,
	colorClass,
}: DashboardCardMobileProps) {
	return (
		<Link href={to as any} asChild>
			<Pressable className="active:opacity-80">
				<Card className="flex-1 py-0">
					<CardContent className="p-4">
						<View className="flex-row items-center justify-between pb-2">
							<Text className="font-medium text-foreground text-sm">
								{title}
							</Text>
							<Icon
								as={IconComponent}
								size={16}
								className={cn("text-muted-foreground", colorClass)}
							/>
						</View>
						<View className="mt-1">
							<Text className="font-bold text-2xl text-foreground">
								{value}
							</Text>
							<Text className="text-muted-foreground text-xs">View all</Text>
						</View>
					</CardContent>
				</Card>
			</Pressable>
		</Link>
	);
}
