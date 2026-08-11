import { ChevronsUpDown, Tag } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function TagCloud({ tags }: Props) {
	const [open, setOpen] = useState(false);

	if (!tags.length) return null;

	const visible = tags.slice(0, 8);
	const hidden = tags.slice(8);

	return (
		<View className="mt-7">
			<View className="mb-3 flex-row items-center justify-between">
				<View className="flex-row items-center gap-2">
					<Tag size={18} className="text-blue-500" />
					<Text className="font-semibold text-lg">Popular Tags</Text>
				</View>

				{hidden.length > 0 && (
					<Collapsible open={open} onOpenChange={setOpen}>
						<CollapsibleTrigger asChild>
							<Button variant="ghost" size="sm">
								<Text>{open ? "Less" : "More"}</Text>
								<Icon as={ChevronsUpDown} />
							</Button>
						</CollapsibleTrigger>

						<CollapsibleContent />
					</Collapsible>
				)}
			</View>

			<View className="flex-row flex-wrap">
				{visible.map(({ tag, count }) => (
					<Badge key={tag} variant="secondary" className="mr-2 mb-2">
						<Text>
							{tag} ({count})
						</Text>
					</Badge>
				))}
			</View>

			{hidden.length > 0 && (
				<Collapsible open={open} onOpenChange={setOpen}>
					<CollapsibleContent>
						<View className="mt-2 flex-row flex-wrap">
							{hidden.map(({ tag, count }) => (
								<Badge key={tag} variant="secondary" className="mr-2 mb-2">
									<Text>
										{tag} ({count})
									</Text>
								</Badge>
							))}
						</View>
					</CollapsibleContent>
				</Collapsible>
			)}
		</View>
	);
}
