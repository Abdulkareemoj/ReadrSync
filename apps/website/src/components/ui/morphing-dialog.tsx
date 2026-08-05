"use client";

import {
	AnimatePresence,
	MotionConfig,
	type MotionStyle,
	motion,
	type Transition,
	type Variant,
} from "motion/react";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import useClickOutside from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

type MorphingDialogContextType = {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	uniqueId: string;
	triggerRef: React.RefObject<HTMLDivElement | null>;
};

const MorphingDialogContext = createContext<MorphingDialogContextType | null>(
	null,
);

function useMorphingDialog() {
	const context = useContext(MorphingDialogContext);
	if (!context) {
		throw new Error(
			"useMorphingDialog must be used within a MorphingDialogProvider",
		);
	}
	return context;
}

export type MorphingDialogProps = {
	children: React.ReactNode;
	transition?: Transition;
};

export function MorphingDialog({ children, transition }: MorphingDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const uniqueId = useId();
	const triggerRef = useRef<HTMLDivElement>(null);

	const contextValue = useMemo(
		() => ({ isOpen, setIsOpen, uniqueId, triggerRef }),
		[isOpen, uniqueId],
	);

	return (
		<MorphingDialogContext.Provider value={contextValue}>
			<MotionConfig {...(transition ? { transition } : {})}>
				{children}
			</MotionConfig>
		</MorphingDialogContext.Provider>
	);
}

export function MorphingDialogTrigger({
	children,
	className,
	style,
}: {
	children: React.ReactNode;
	className?: string;
	style?: MotionStyle;
}) {
	const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog();

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				setIsOpen(true);
			}
		},
		[setIsOpen],
	);

	return (
		<motion.div
			ref={triggerRef}
			layoutId={`dialog-${uniqueId}`}
			className={cn("relative cursor-zoom-in", className)}
			{...(style ? { style } : {})}
			onClick={() => setIsOpen(true)}
			onKeyDown={handleKeyDown}
			role="button"
			aria-haspopup="dialog"
			aria-expanded={isOpen}
			tabIndex={0}
		>
			{children}
		</motion.div>
	);
}
export type MorphingDialogContentProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function MorphingDialogContent({
	children,
	className,
	style,
}: MorphingDialogContentProps) {
	const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog();
	const containerRef = useRef<HTMLDivElement>(null!);
	const [firstFocusableElement, setFirstFocusableElement] =
		useState<HTMLElement | null>(null);
	const [lastFocusableElement, setLastFocusableElement] =
		useState<HTMLElement | null>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
			if (event.key === "Tab") {
				if (!firstFocusableElement || !lastFocusableElement) return;

				if (event.shiftKey) {
					if (document.activeElement === firstFocusableElement) {
						event.preventDefault();
						lastFocusableElement.focus();
					}
				} else {
					if (document.activeElement === lastFocusableElement) {
						event.preventDefault();
						firstFocusableElement.focus();
					}
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [setIsOpen, firstFocusableElement, lastFocusableElement]);

	useEffect(() => {
		if (isOpen) {
			document.body.classList.add("overflow-hidden");
			const focusableElements = containerRef.current?.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);
			if (focusableElements && focusableElements.length > 0) {
				setFirstFocusableElement(focusableElements[0] as HTMLElement);
				setLastFocusableElement(
					focusableElements[focusableElements.length - 1] as HTMLElement,
				);
				(focusableElements[0] as HTMLElement).focus();
			}
		} else {
			document.body.classList.remove("overflow-hidden");
			triggerRef.current?.focus();
		}
	}, [isOpen, triggerRef]);

	useClickOutside(containerRef, () => {
		if (isOpen) {
			setIsOpen(false);
		}
	});

	return (
		<motion.div
			ref={containerRef}
			layoutId={`dialog-${uniqueId}`}
			className={cn("overflow-hidden", className)}
			style={style}
			role="dialog"
			aria-modal="true"
			aria-labelledby={`motion-ui-morphing-dialog-title-${uniqueId}`}
			aria-describedby={`motion-ui-morphing-dialog-description-${uniqueId}`}
		>
			{children}
		</motion.div>
	);
}

export function MorphingDialogContainer({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isOpen, setIsOpen, uniqueId } = useMorphingDialog();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);
	if (!mounted) return null;

	return createPortal(
		<AnimatePresence initial={false} mode="sync">
			{isOpen && (
				<>
					<motion.div
						key={`backdrop-${uniqueId}`}
						className="fixed inset-0 z-50 h-full w-full bg-carbon/70 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setIsOpen(false)}
					/>
					<div className="fixed inset-0 z-50 flex items-center justify-center p-6">
						{children}
					</div>
				</>
			)}
		</AnimatePresence>,
		document.body,
	);
}

export function MorphingDialogClose({
	children,
	className,
	variants,
}: {
	children?: React.ReactNode;
	className?: string;
	variants?: { initial: Variant; animate: Variant; exit: Variant };
}) {
	const { setIsOpen, uniqueId } = useMorphingDialog();

	return (
		<motion.button
			onClick={() => setIsOpen(false)}
			type="button"
			aria-label="Close dialog"
			key={`close-${uniqueId}`}
			className={cn("absolute top-6 right-6 z-50", className)}
			initial="initial"
			animate="animate"
			exit="exit"
			{...(variants ? { variants } : {})}
		>
			{children}
		</motion.button>
	);
}

export function MorphingDialogImage({
	src,
	alt,
	className,
	style,
}: {
	src: string;
	alt: string;
	className?: string;
	style?: MotionStyle;
}) {
	const { uniqueId } = useMorphingDialog();

	return (
		<motion.img
			src={src}
			alt={alt}
			className={cn(className)}
			layoutId={`dialog-img-${uniqueId}`}
			{...(style ? { style } : {})}
		/>
	);
}
