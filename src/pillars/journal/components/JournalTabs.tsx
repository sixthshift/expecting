import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";

/**
 * The Journal's two ways in, at the top of every page of it: the story,
 * everything by time (`/journal`), and the collections, everything by what
 * it is (`/journal/collections`). Links, so each is its own address and back
 * goes between them.
 */
export function JournalTabs({ current }: { current: "story" | "collections" }) {
  const tab = (active: boolean) =>
    cn(
      "flex min-h-10 items-center rounded-full px-4 text-sm font-medium",
      active ? "bg-bg-brand-subtle text-fg-strong" : "text-fg-subtle hover:bg-bg-normal-hovered hover:text-fg-normal"
    );
  return (
    <nav aria-label="Journal" className="flex gap-1">
      <Link to="/journal" aria-current={current === "story" ? "page" : undefined} className={tab(current === "story")}>
        Story
      </Link>
      <Link to="/journal/collections" aria-current={current === "collections" ? "page" : undefined} className={tab(current === "collections")}>
        Collections
      </Link>
    </nav>
  );
}
