import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";

/**
 * The Journal's two ways in: the story, to read back (`/journal`), and the
 * records, to look something up (`/journal/records`). Links, so each is its
 * own address and back goes between them.
 */
export function JournalTabs({ current }: { current: "story" | "records" }) {
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
      <Link to="/journal/records" aria-current={current === "records" ? "page" : undefined} className={tab(current === "records")}>
        Records
      </Link>
    </nav>
  );
}
