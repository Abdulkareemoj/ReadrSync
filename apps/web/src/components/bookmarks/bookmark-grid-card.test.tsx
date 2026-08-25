import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BookmarkGridCard } from "./bookmark-grid-card";

const baseProps = {
	id: "b1",
	title: "Example Bookmark",
	url: "https://example.com",
	description: "A short description",
	tags: ["dev", "tools"],
	liked: false,
	onLike: () => {},
	onDelete: () => {},
	onEdit: () => {},
	onMove: () => {},
};

describe("BookmarkGridCard", () => {
	it("renders title, description and tags", () => {
		const { container } = render(
			<BookmarkGridCard {...baseProps} onClick={() => {}} />,
		);
		expect(container.textContent).toContain("Example Bookmark");
		expect(container.textContent).toContain("A short description");
		expect(container.textContent).toContain("dev");
	});

	it("navigates when the card body is clicked", () => {
		const onClick = vi.fn();
		const { container } = render(
			<BookmarkGridCard {...baseProps} onClick={onClick} />,
		);
		const body = container.querySelector("button.w-full") as HTMLButtonElement;
		fireEvent.click(body);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("keeps button chrome off the card body so content lays out normally", () => {
		const { container } = render(
			<BookmarkGridCard {...baseProps} onClick={() => {}} />,
		);
		const body = container.querySelector("button.w-full") as HTMLButtonElement;
		expect(body.className).not.toContain("h-9");
		expect(body.className).not.toContain("whitespace-nowrap");
		expect(body.className).not.toContain("items-center");
	});

	it("action buttons do not trigger navigation", () => {
		const onClick = vi.fn();
		const { container } = render(
			<BookmarkGridCard {...baseProps} onClick={onClick} />,
		);
		const buttons = container.querySelectorAll("button");
		fireEvent.click(buttons[0] as HTMLButtonElement);
		fireEvent.click(buttons[1] as HTMLButtonElement);
		expect(onClick).not.toHaveBeenCalled();
	});
});
