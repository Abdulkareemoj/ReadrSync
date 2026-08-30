import { createRootRoute, Outlet } from "@tanstack/react-router";

import Header from "@/components/header";
import { StickyFooter } from "@/components/sticky-footer";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRoute({
	component: () => (
		<ThemeProvider
			attribute="class"
			enableSystem
			disableTransitionOnChange
			defaultTheme="system"
		>
			<Header />
			<Outlet />

			<StickyFooter />
		</ThemeProvider>
	),
});
