import { BarTabs } from "../../../app/mobile/components/BarTabs";

/**
 * The Journal's three ways in, as tabs in the bar at the top of each of its
 * pages on a phone (`PillarLayout`'s `tabs`): the story, everything by time
 * (`/journal`), the collections, everything by what it is
 * (`/journal/collections`), and the book, the pregnancy as chapters
 * (`/journal/book`). Links, so each is its own address and back goes between
 * them. A desktop has them on the Journal's rail (`JournalRail`).
 */
export function JournalTabs({ current }: { current: "story" | "collections" | "book" }) {
  return (
    <BarTabs
      label="Journal"
      tabs={[
        { to: "/journal", label: "Story", current: current === "story" },
        { to: "/journal/collections", label: "Collections", current: current === "collections" },
        { to: "/journal/book", label: "Book", current: current === "book" },
      ]}
    />
  );
}
