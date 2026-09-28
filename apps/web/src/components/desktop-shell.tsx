import { useNavigate, useRouterState } from "@tanstack/react-router";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
	BookOpenText,
	Moon,
	PanelLeftClose,
	PanelLeftOpen,
	Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useState,
} from "react";
import { AppSidebar } from "@/components/app-sidebar";
import SearchBar from "@/components/search-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WindowControls } from "@/components/window-controls";
import { isTauri } from "@/lib/platform";
import { cn } from "@/lib/utils";
import {
	resolvePanelFrameClass,
	resolvePanelRadiusPx,
} from "@/lib/windowChrome";

const SIDEBAR_COLLAPSED_KEY = "readrsync.desktop.sidebar.collapsed";

/** Routes that fill the panel edge-to-edge without the panel header. */
const IMMERSIVE_ROUTE_IDS = new Set(["/rss/article/$id"]);

/**
 * ZCode-style desktop shell: the window background is a chrome surface, the
 * sidebar floats on it, and the main content sits in an inset rounded panel
 * whose 1px border stands in for the native window edge. Rendered only inside
 * Tauri (or with ?shell=desktop for browser preview).
 */
export function DesktopShell({ children }: { children: ReactNode }) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
		try {
			return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
		} catch {
			return false;
		}
	});
	const toggleSidebar = useCallback(() => {
		setSidebarCollapsed((previous) => {
			try {
				localStorage.setItem(SIDEBAR_COLLAPSED_KEY, previous ? "0" : "1");
			} catch {
				// Private mode / storage disabled, collapse still works this session.
			}
			return !previous;
		});
	}, []);
	const toggleMaximize = useCallback(() => {
		if (isTauri()) void getCurrentWindow().toggleMaximize();
	}, []);
	const { theme, setTheme } = useTheme();
	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};
	const navigate = useNavigate();
	const location = useRouterState({ select: (s) => s.location });
	const handleHeaderSearch = (q: string) => {
		void navigate({
			to: location.pathname as never,
			search: ((prev: { q?: string }) => ({ ...prev, q })) as never,
			replace: true,
		});
	};

	// Immersive = header drops, content fills the panel. The sidebar stays.
	const matches = useRouterState({ select: (s) => s.matches });
	const immersive = matches.some((m) => IMMERSIVE_ROUTE_IDS.has(m.routeId));
	const panelFrameClass = resolvePanelFrameClass();

	return (
		<SidebarProvider
			className="h-dvh overflow-hidden bg-background-alt text-foreground"
			style={{ "--sidebar-width": "15rem" } as CSSProperties}
		>
			{/* Floating sidebar-open toggle while collapsed, on every route —
			    shows the app icon, cross-fades to an open icon on hover, centered
			    on the panel header's line. The close button lives in the sidebar
			    strip when expanded. */}
			{sidebarCollapsed && (
				<div className="absolute top-3 left-2 z-30">
					<button
						type="button"
						aria-label="Show sidebar"
						onClick={toggleSidebar}
						className="group relative flex size-8 overflow-hidden rounded-lg border border-border bg-background/80 backdrop-blur transition-colors hover:bg-background"
					>
						<span className="pointer-events-none flex size-full items-center justify-center transition-opacity duration-150 group-hover:opacity-0">
							<BookOpenText className="size-4" />
						</span>
						<PanelLeftOpen className="absolute inset-0 m-auto size-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
					</button>
				</div>
			)}

			{/* Sidebar pane: fixed width, collapses to nothing with a width fade.
			    The inner column keeps a fixed width so it never reflows mid-fade. */}
			<div
				className={cn(
					"flex-none overflow-hidden transition-[width,opacity] duration-200 ease-out",
					sidebarCollapsed
						? "pointer-events-none w-0 opacity-0"
						: "w-60 opacity-100",
				)}
			>
				<div className="flex h-full w-60 flex-col">
					{/* Drag strip: app identity + sidebar close. Decorative children
					    are pointer-events-none so drags land on the strip itself. */}
					{/* biome-ignore lint/a11y/noStaticElementInteractions: Tauri window drag surface — background drags, double-click maximizes */}
					<div
						data-tauri-drag-region
						onDoubleClick={toggleMaximize}
						className="mt-1 flex h-12 shrink-0 items-center gap-1 pr-2 pl-3"
					>
						<div className="pointer-events-none flex min-w-0 flex-1 items-center gap-2">
							<div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
								<BookOpenText className="size-3.5" />
							</div>
							<span className="truncate font-medium text-[13px] tracking-tight">
								ReadrSync
							</span>
						</div>
						<button
							type="button"
							aria-label="Hide sidebar"
							onClick={toggleSidebar}
							className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground"
						>
							<PanelLeftClose className="size-4" />
						</button>
					</div>
					<div className="min-h-0 flex-1">
						<AppSidebar variant="desktop" />
					</div>
				</div>
			</div>

			{/* Inset main panel: 4px chrome margin right/bottom/left, 4px drag
			    strip on top. Its border stands in for the native window edge. */}
			<div className="relative flex min-w-0 flex-1 flex-col p-1 pt-0">
				<div data-tauri-drag-region className="h-1 w-full shrink-0" />
				<section
					className={cn(
						"relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background",
						panelFrameClass,
					)}
					style={{ borderRadius: `${resolvePanelRadiusPx()}px` }}
				>
					{immersive ? (
						<>
							<div className="[&>*]:!h-full [&>*]:!min-h-0 flex min-h-0 flex-1 flex-col overflow-hidden">
								{children}
							</div>
							{/* Floating chrome over immersive content: drag region
							    between the sidebar toggle and window controls. */}
							<div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-10 items-center gap-1.5 px-1.5">
								{/* biome-ignore lint/a11y/noStaticElementInteractions: Tauri window drag surface */}
								<div
									data-tauri-drag-region
									onDoubleClick={toggleMaximize}
									className="h-full min-w-0 flex-1"
								/>
								<div className="pointer-events-auto">
									<WindowControls />
								</div>
							</div>
						</>
					) : (
						<>
							{/* The header itself AND every zone wrapper carry the drag
							    attribute: the attribute only matches the exact press
							    target, so a press on a zone div needs it there too.
							    Buttons stay clickable. */}
							{/* biome-ignore lint/a11y/noStaticElementInteractions: Tauri window drag surface, background drags, double-click maximizes */}
							<header
								data-tauri-drag-region
								onDoubleClick={toggleMaximize}
								className="flex h-12 shrink-0 items-center gap-1.5 border-border border-b px-2"
							>
								{/* Equal flex thirds keep the search pill on the panel's
								    centerline whether the sidebar is expanded or collapsed. */}
								<div data-tauri-drag-region className="flex-1 basis-0" />
								<div
									data-tauri-drag-region
									className="flex min-w-0 flex-1 basis-0 justify-center"
								>
									<div className="w-full max-w-xs">
										<SearchBar
											placeholder="Search..."
											onSearch={handleHeaderSearch}
										/>
									</div>
								</div>
								<div
									data-tauri-drag-region
									className="flex flex-1 basis-0 items-center justify-end gap-1.5"
								>
									<button
										type="button"
										aria-label="Toggle theme"
										onClick={toggleTheme}
										className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground"
									>
										{theme === "dark" ? (
											<Sun className="size-4" />
										) : (
											<Moon className="size-4" />
										)}
									</button>
									<WindowControls />
								</div>
							</header>
							<main className="min-h-0 flex-1 overflow-y-auto">
								<div className="min-h-full">{children}</div>
							</main>
						</>
					)}
				</section>
			</div>
		</SidebarProvider>
	);
}
