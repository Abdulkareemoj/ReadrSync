import { createRootRoute, Outlet } from "@tanstack/react-router";
import type React from "react";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return <Outlet />;
}
