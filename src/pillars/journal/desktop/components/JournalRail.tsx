import { useLocation } from "@tanstack/react-router";
import { BookHeart, Layers, ScrollText } from "lucide-react";
import { Rail, RailLink } from "../../../../app/desktop/components/Rail";

/**
 * The Journal's places on a desktop, down the left of each of its pages: the
 * story (everything by time), the collections (everything by what it is) and
 * the book. On a phone they're the tabs at the top of its pages
 * (`JournalTabs`) and the book's way in from the story. The same in both
 * worlds: what's folded while something has happened is folded on the pages.
 */
export function JournalRail() {
  const { pathname } = useLocation();
  return (
    <Rail label="Journal">
      <RailLink to="/journal" icon={ScrollText} current={pathname === "/journal"}>
        Story
      </RailLink>
      <RailLink to="/journal/collections" icon={Layers} current={pathname.startsWith("/journal/collections")}>
        Collections
      </RailLink>
      <RailLink to="/journal/book" icon={BookHeart} current={pathname === "/journal/book"}>
        The book
      </RailLink>
    </Rail>
  );
}
