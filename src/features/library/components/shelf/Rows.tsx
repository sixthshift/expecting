import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Item } from "../../../../content/schema";
import { Verdict } from "../content/Verdict";
import { rangeLabel } from "../ItemCard";

/** What a row says on its right, by type: a can-i's verdict, a decision's week, when a moment or payment comes. */
function Meta({ item }: { item: Item }) {
  if (item.verdict) return <Verdict verdict={item.verdict} size="sm" />;
  if (item.decideBy !== null) return <span className="text-xs text-fg-subtle">By week {item.decideBy}</span>;
  if (item.type === "moment" || item.type === "payment") return <span className="text-xs text-fg-subtle">{rangeLabel(item)}</span>;
  return null;
}

/** Entries as short rows, the title and its answer at a glance: a door's shelf, where many must fit. */
export function Rows({ items }: { items: readonly Item[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-bg-normal">
      {items.map((item) => (
        <li key={item.id}>
          <Link to="/library/$itemId" params={{ itemId: item.id }} className="flex min-h-12 items-center gap-3 px-4 py-2.5 hover:bg-bg-normal-hovered">
            <span className="min-w-0 flex-1 text-fg-strong">{item.title}</span>
            <span className="flex shrink-0 items-center">
              <Meta item={item} />
            </span>
            <ChevronRight aria-hidden size={16} className="shrink-0 text-fg-subtle" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
