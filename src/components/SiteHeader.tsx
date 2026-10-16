import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
          Margin<span className="text-primary">.</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            Articles
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
