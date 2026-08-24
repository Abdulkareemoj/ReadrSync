import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ArticleCard from "./article-card";

const baseProps = {
	id: "a1",
	title: "Test Article",
	excerpt: "Some excerpt",
	category: "Tech",
	readTime: 4,
	author: "Jane Doe",
	date: "Aug 24",
};

describe("ArticleCard", () => {
	it("renders title, category and read time", () => {
		const { container } = render(<ArticleCard {...baseProps} />);
		expect(container.textContent).toContain("Test Article");
		expect(container.textContent).toContain("Tech");
		expect(container.textContent).toContain("4 min read");
	});

	it("shows the author's initial in the avatar fallback", () => {
		const { container } = render(<ArticleCard {...baseProps} />);
		expect(container.textContent).toContain("J");
	});

	it("calls onLike/onSave without triggering the card onClick", () => {
		const onLike = vi.fn();
		const onSave = vi.fn();
		const onClick = vi.fn();
		const { container } = render(
			<ArticleCard
				{...baseProps}
				onLike={onLike}
				onSave={onSave}
				onClick={onClick}
			/>,
		);

		const buttons = container.querySelectorAll("button");
		fireEvent.click(buttons[0] as HTMLButtonElement);
		fireEvent.click(buttons[1] as HTMLButtonElement);

		expect(onLike).toHaveBeenCalledTimes(1);
		expect(onSave).toHaveBeenCalledTimes(1);
		expect(onClick).not.toHaveBeenCalled();
	});

	it("prefers imageData over imageUrl", () => {
		const { container, rerender } = render(
			<ArticleCard {...baseProps} imageUrl="https://img.example/a.png" />,
		);
		let img = container.querySelector("img");
		expect(img?.getAttribute("src")).toBe("https://img.example/a.png");

		rerender(
			<ArticleCard
				{...baseProps}
				imageUrl="https://img.example/a.png"
				imageData="data:image/png;base64,x"
			/>,
		);
		img = container.querySelector("img");
		expect(img?.getAttribute("src")).toBe("data:image/png;base64,x");
	});

	it("renders a placeholder instead of an img when no image is given", () => {
		const { container } = render(<ArticleCard {...baseProps} />);
		expect(container.querySelector("img")).toBeNull();
	});
});
