import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium text-sm outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-foreground text-background hover:bg-foreground/90",
				secondary:
					"border border-border bg-transparent text-foreground hover:border-border-hover hover:bg-white/5",
				outline:
					"border border-border bg-transparent text-ink-secondary hover:border-border-hover hover:text-foreground",
				ghost: "text-ink-secondary hover:bg-white/5 hover:text-foreground",
				link: "text-accent-blue underline-offset-4 hover:underline",
				overlay: "bg-background/85 text-graphite hover:bg-background",
				/* Top navigation item, transparent until hovered. */
				nav: "bg-transparent text-carbon hover:bg-carbon/5",
				navOverlay: "bg-transparent text-background hover:bg-background/15",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				xl: "h-12 rounded-lg px-8 text-base",
				nav: "min-h-8 px-4 py-1",
				icon: "size-8",
				inline: "h-auto p-0",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
				cta: "h-10 w-full px-6 sm:w-[200px]",
				ctaNarrow: "h-10 w-full px-6 sm:w-[160px]",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? SlotPrimitive.Slot : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
