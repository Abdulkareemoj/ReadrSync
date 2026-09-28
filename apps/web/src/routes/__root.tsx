import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import type React from "react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import BottomNav from "@/components/bottom-nav";
import { DesktopShell } from "@/components/desktop-shell";
import { StoreProvider } from "@/components/store-provider";
import Toolbar from "@/components/toolbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/integrations/theme-provider";
import { isTauri } from "@/lib/platform";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "ReadrSync",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
});

function AppLayout({ children }: { children: React.ReactNode }) {
	// Desktop shell gate: the Tauri webview is detected via isTauri() (works
	// no matter which bundle the window loads desktop CSR or the web Start
	// server), and ?shell=desktop forces it in the browser for preview. Both
	// are post-mount so SSR renders the web layout and hydration never
	// mismatches; the shell swaps in right after.
	const [forcedShell, setForcedShell] = useState(false);
	useEffect(() => {
		if (
			isTauri() ||
			new URLSearchParams(window.location.search).get("shell") === "desktop"
		) {
			setForcedShell(true);
		}
	}, []);
	const isDesktop = forcedShell;

	if (isDesktop) {
		return (
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<StoreProvider>
					<TooltipProvider>
						<DesktopShell>{children}</DesktopShell>
					</TooltipProvider>
				</StoreProvider>
			</ThemeProvider>
		);
	}

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<StoreProvider>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset>
						<TooltipProvider>
							<Toolbar />
							{children}
							<BottomNav />
						</TooltipProvider>
					</SidebarInset>
				</SidebarProvider>
			</StoreProvider>
		</ThemeProvider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const isDesktop =
		typeof window !== "undefined" &&
		(window as unknown as { __BOOKMARKREADER_AGENTS__?: unknown })
			.__BOOKMARKREADER_AGENTS__;

	if (isDesktop) {
		return (
			<>
				<AppLayout>{children}</AppLayout>
			</>
		);
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<AppLayout>{children}</AppLayout>

				<Scripts />
			</body>
		</html>
	);
}
