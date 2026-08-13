import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { MediaPlaceholder } from "@/components/media-placeholder";
import {
	MorphingDialog,
	MorphingDialogClose,
	MorphingDialogContainer,
	MorphingDialogContent,
	MorphingDialogTrigger,
} from "@/components/ui/morphing-dialog";
import { cn } from "@/lib/utils";

const closeVariants = {
	initial: { opacity: 0 },
	animate: { opacity: 1, transition: { delay: 0.3, duration: 0.1 } },
	exit: { opacity: 0, transition: { duration: 0 } },
};

/**
 * Generic click-to-zoom wrapper. Pass the collapsed view as `children`
 * and the expanded view as `expanded` (defaults to the same node).
 */
export function Zoomable({
	children,
	expanded,
	className,
	contentClassName,
}: {
	children: ReactNode;
	expanded?: ReactNode;
	className?: string;
	contentClassName?: string;
}) {
	return (
		<MorphingDialog transition={{ duration: 0.33, ease: "easeInOut" }}>
			<MorphingDialogTrigger
				className={cn(
					"block h-full w-full cursor-zoom-in overflow-hidden",
					className,
				)}
			>
				{children}
			</MorphingDialogTrigger>
			<MorphingDialogContainer>
				<MorphingDialogContent
					className={cn(
						"relative flex h-[80vh] w-full items-center justify-center overflow-hidden rounded-xl",
						contentClassName,
					)}
				>
					{expanded ?? children}
				</MorphingDialogContent>
				<MorphingDialogClose
					className="fixed top-6 right-6 h-fit w-fit rounded-full bg-background p-1"
					variants={closeVariants}
				>
					<XIcon className="h-5 w-5 text-pewter" />
				</MorphingDialogClose>
			</MorphingDialogContainer>
		</MorphingDialog>
	);
}

/**
 * Full-bleed media slot that opens into a fullscreen lightbox on click.
 * Swap MediaPlaceholder for a real <img className="h-full w-full object-cover" />.
 */
export function MediaLightbox({
	label,
	className,
	tone = "light",
	src,
}: {
	label: string;
	className?: string;
	tone?: "light" | "dark";
	src?: string;
}) {
	const media = src ? (
		<img src={src} alt={label} className="block h-full w-full object-cover" />
	) : (
		<MediaPlaceholder
			label={label}
			tone={tone}
			className="block h-full w-full"
		/>
	);

	return (
		<Zoomable
			className={cn("h-full w-full", className)}
			contentClassName="h-[80vh]"
		>
			{media}
		</Zoomable>
	);
}
