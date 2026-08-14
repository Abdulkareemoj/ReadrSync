import { Link } from "@tanstack/react-router";
import { Download, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
	{ label: "Features", href: "/#features" },
	{ label: "How it works", href: "/#how-it-works" },
	{ label: "Library", href: "/#library" },
	{ label: "Reviews", href: "/#reviews" },
];

export default function Header() {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);
	// Only pages that open on full-bleed hero photography get a transparent nav.
	const [overHero, setOverHero] = useState(false);

	useEffect(() => {
		setOverHero(Boolean(document.querySelector("[data-hero]")));
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const solid = scrolled || open || !overHero;

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-50 transition-tesla",
				solid ? "nav-frost" : "bg-transparent",
			)}
		>
			<div className="mx-auto grid max-w-345.75 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
				<Link
					to="/"
					className={cn(
						"wordmark min-w-0 truncate text-[15px] transition-tesla",
						solid ? "text-carbon" : "text-background",
					)}
				>
					ReadrSync
				</Link>

				<nav className="hidden items-center justify-center gap-1 lg:flex">
					{navItems.map((item) => (
						<Link key={item.label} to={item.href}>
							<Button variant={solid ? "nav" : "navOverlay"} size="nav">
								{item.label}
							</Button>
						</Link>
					))}
				</nav>

				<div className="hidden items-center justify-end gap-1 lg:flex">
					<Button
						variant={solid ? "default" : "navOverlay"}
						size="nav"
						aria-label="Language"
					>
						{" "}
						<Download /> <Link to="/download"> Download</Link>
					</Button>
					<ThemeToggle />
				</div>

				<div className="flex items-center gap-1 lg:hidden">
					<Button
						variant={solid ? "nav" : "navOverlay"}
						size="icon"
						aria-label={open ? "Close menu" : "Open menu"}
						aria-expanded={open}
						onClick={() => setOpen((v) => !v)}
					>
						{open ? <X /> : <Menu />}
					</Button>
				</div>
			</div>

			{open && (
				<div className="bg-background lg:hidden">
					<nav className="mx-auto flex max-w-345.75 flex-col px-6 pb-6">
						{navItems.map((item) => (
							<Link
								key={item.label}
								to={item.href}
								onClick={() => setOpen(false)}
								className="rounded-md px-4 py-3 font-medium text-[14px] text-carbon transition-tesla hover:bg-light-ash"
							>
								{item.label}
							</Link>
						))}
						<ThemeToggle />
					</nav>
				</div>
			)}
		</header>
	);
}
