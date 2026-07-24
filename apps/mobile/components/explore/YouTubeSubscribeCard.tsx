import { Film } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type Props = {
	url: string;
	onUrlChange: (text: string) => void;
	loading: boolean;
	error: string;
	onSubscribe: () => void;
};

export default function YouTubeSubscribeCard({
	url,
	onUrlChange,
	loading,
	error,
	onSubscribe,
}: Props) {
	return (
		<Card>
			<CardHeader>
				<View className="flex-row items-center gap-2">
					<Film size={16} className="text-red-500" />
					<CardTitle>Subscribe to YouTube Channels</CardTitle>
				</View>
				<CardDescription>
					Enter a YouTube channel URL or handle to subscribe via RSS
				</CardDescription>
			</CardHeader>
			<CardContent>
				<View className="gap-2">
					<Input
						placeholder="e.g. https://youtube.com/@mkbhd"
						value={url}
						onChangeText={onUrlChange}
						returnKeyType="done"
						onSubmitEditing={onSubscribe}
					/>
					<TouchableOpacity
						onPress={onSubscribe}
						disabled={loading || !url.trim()}
						className={`rounded-lg px-4 py-2.5 ${
							loading || !url.trim()
								? "bg-muted"
								: "bg-red-500 active:opacity-80"
						}`}
					>
						<Text
							className={`text-center text-sm font-medium ${
								loading || !url.trim()
									? "text-muted-foreground"
									: "text-white"
							}`}
						>
							{loading ? "Discovering..." : "Subscribe"}
						</Text>
					</TouchableOpacity>
					{error ? (
						<Text className="text-red-500 text-xs">{error}</Text>
					) : null}
					<Text className="text-muted-foreground text-xs">
						Supports youtube.com/channel/UC..., youtube.com/@handle, or
						bare @handle
					</Text>
				</View>
			</CardContent>
		</Card>
	);
}
