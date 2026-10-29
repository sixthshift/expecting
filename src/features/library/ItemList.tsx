import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Item } from "../../content/schema";
import { rangeLabel } from "./ItemCard";

/** Items as a list of links, each to its own page, with why it matters: a Library shelf, and what's worth knowing this week. */
export function ItemList({ items }: { items: readonly Item[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-bg-normal">
      {items.map((item) => (
        <li key={item.id}>
          <Link to="/library/$itemId" params={{ itemId: item.id }} className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-bg-normal-hovered">
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-fg-strong">{item.title}</span>
              {item.summary ? <span className="text-sm text-fg-normal">{item.summary}</span> : null}
              <span className="text-xs text-fg-subtle">{[rangeLabel(item), item.surprise ? "nobody tells you" : null].filter(Boolean).join(" · ")}</span>
            </span>
            <ChevronRight aria-hidden size={18} className="shrink-0 text-fg-subtle" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
