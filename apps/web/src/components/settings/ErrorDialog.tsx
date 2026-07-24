import { AlertCircle } from "lucide-react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
	error: { title: string; message: string } | null;
	onClose: () => void;
};

export default function ErrorDialog({ error, onClose }: Props) {
	return (
		<AlertDialog open={!!error} onOpenChange={(open) => !open && onClose()}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogMedia>
						<AlertCircle className="size-8" />
					</AlertDialogMedia>
					<AlertDialogTitle>{error?.title}</AlertDialogTitle>
					<AlertDialogDescription>{error?.message}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose}>OK</AlertDialogCancel>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
