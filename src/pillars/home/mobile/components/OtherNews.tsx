import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { newsLine, otherNews } from "../../../../lib/home/otherNews";
import { useStoryItems } from "../../../journal/hooks/useStoryItems";
import { useHomePage } from "../../contexts/HomePageContext";

/**
 * The other of you, in a line: what they've kept since yesterday ("Cindy felt
 * the baby move and felt good"), to the Journal, where it all is. Nothing
 * when there's no other of you yet, or nothing new from them.
 */
export function OtherNews() {
  const { today } = useHomePage();
  const { data: people } = usePeopleQuery();
  const items = useStoryItems();
  const other = people.me ? people.people.find((p) => p.id !== people.me?.id) : undefined;
  const news = other ? otherNews(items, other.id, today) : [];
  if (!other || news.length === 0) return null;
  return (
    <Link to="/journal" className="flex min-h-11 items-center gap-3 rounded-xl border border-border-subtle bg-bg-normal px-4 py-3 hover:bg-bg-normal-hovered">
      <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-brand-subtle text-sm font-semibold text-fg-brand">
        {other.name.slice(0, 1)}
      </span>
      <span className="min-w-0 flex-1 text-sm text-fg-normal">
        <span className="font-semibold text-fg-strong">{other.name}</span> {newsLine(news)}
        <span className="text-fg-subtle">, since yesterday</span>
      </span>
      <ChevronRight aria-hidden size={16} className="shrink-0 text-fg-subtle" />
    </Link>
  );
}
