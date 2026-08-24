import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import StatusDot from "./StatusDot";

describe("StatusDot", () => {
	it.each([
		["connected", "bg-green-500"],
		["connecting", "bg-amber-500/60"],
		["syncing", "bg-amber-500"],
		["error", "bg-destructive"],
		["idle", "bg-muted-foreground/40"],
	] as const)("renders %s with its status color", (status, color) => {
		const { container } = render(<StatusDot status={status} />);
		const dot = container.firstElementChild as HTMLElement;
		expect(dot.tagName).toBe("SPAN");
		expect(dot.className).toContain("rounded-full");
		expect(dot.className).toContain(color);
	});
});
