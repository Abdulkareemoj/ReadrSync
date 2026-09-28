import { getCurrentWindow } from "@tauri-apps/api/window";
import { Copy, Minus, Square, X } from "lucide-react";
import { useEffect, useState } from "react";
import { isTauri } from "@/lib/platform";
import { cn } from "@/lib/utils";

type WindowHandle = ReturnType<typeof getCurrentWindow>;

/**
 * Compact ghost window controls for the undecorated Tauri window.
 *
 * Visibility is the caller's concern, the desktop shell only renders inside
 * Tauri, so these always render within it. In the ?shell=desktop browser
 * preview the buttons appear but their actions no-op. Every action guards on
 * isTauri() so a non-Tauri context, or a window shutting down  never throws.
 */
export function WindowControls() {
	const [maximized, setMaximized] = useState(false);

	useEffect(() => {
		if (!isTauri()) return;
		// onResized fires for maximize AND restore; isMaximized() is the truth.
		let disposed = false;
		let unlisten: (() => void) | undefined;
		try {
			const win = getCurrentWindow();
			const sync = async () => {
				try {
					setMaximized(await win.isMaximized());
				} catch {
					/* window gone (shutdown) */
				}
			};
			win
				.onResized(() => void sync())
				.then(
					(fn) => {
						if (disposed) fn();
						else unlisten = fn;
					},
					() => {},
				);
			void sync();
		} catch {
			// Runtime without Tauri internals — nothing to sync.
			return;
		}
		return () => {
			disposed = true;
			unlisten?.();
		};
	}, []);

	const run = (action: (win: WindowHandle) => Promise<void>) => {
		if (!isTauri()) return;
		action(getCurrentWindow()).catch(() => {
			/* window gone (shutdown) */
		});
	};

	const control =
		"inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:bg-accent";

	return (
		<div className="flex shrink-0 items-center gap-0.5">
			<button
				type="button"
				aria-label="Minimize"
				className={control}
				onClick={() => run((win) => win.minimize())}
			>
				<Minus className="size-3.5" strokeWidth={1.75} />
			</button>
			<button
				type="button"
				aria-label={maximized ? "Restore" : "Maximize"}
				className={control}
				onClick={() => run((win) => win.toggleMaximize())}
			>
				{maximized ? (
					<Copy className="size-3" strokeWidth={1.75} />
				) : (
					<Square className="size-2.5" strokeWidth={1.75} />
				)}
			</button>
			<button
				type="button"
				aria-label="Close"
				className={cn(
					control,
					"hover:bg-destructive hover:text-destructive-foreground focus-visible:bg-destructive",
				)}
				onClick={() => run((win) => win.close())}
			>
				<X className="size-4" strokeWidth={1.75} />
			</button>
		</div>
	);
}
