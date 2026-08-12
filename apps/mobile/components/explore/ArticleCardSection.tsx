import type React from "react";
import { View } from "react-native";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import EmptyCard from "./EmptyCard";
import SmallArticleCard from "./SmallArticleCard";

type Props = {
	icon: React.ComponentType<{ size?: number; className?: string }>;
	iconClass?: string;
	title: string;
	description: string;
	articleIds: string[];
	emptyTitle: string;
	emptyDesc: string;
	emptyAction?: { label: string; onPress: () => void };
};

export default function ArticleCardSection({
	icon: Icon,
	iconClass,
	title,
	description,
	articleIds,
	emptyTitle,
	emptyDesc,
	emptyAction,
}: Props) {
	return (
		<Card>
			<CardHeader>
				<View className="flex-row items-center gap-2">
					<Icon size={16} className={iconClass} />
					<CardTitle>{title}</CardTitle>
				</View>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				{articleIds.length > 0 ? (
					articleIds.map((id: string) => (
						<SmallArticleCard key={id} articleId={id} />
					))
				) : (
					<EmptyCard title={emptyTitle} desc={emptyDesc} action={emptyAction} />
				)}
			</CardContent>
		</Card>
	);
}
