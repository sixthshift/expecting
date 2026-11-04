import { ChevronRight } from "lucide-react";
import { useReadsQuery } from "../../../../api/rpc/reads";
import type { Item } from "../../../../content/schema";
import { DOOR_INFO, doorOf } from "../../../../lib/library/doors";
import { rangeLabel } from "../../model/labels";
import { ItemLink } from "../itemLink/ItemLink";
import { ReadMark } from "../ReadMark";

/**
 * Items as a list of links, each to its own page, with why it matters and the
 * door it's behind, ticked once you've read it: search results, and what's
 * worth knowing this week. `brief` leaves out why it matters, for a list
 * beside others (This week's on a desktop), where a title is enough to choose by.
 */
export function ItemList({ items, brief = false }: { items: readonly Item[]; brief?: boolean }) {
  const { data: reads } = useReadsQuery();
  const list = items.map((i) => i.id);
  return (
    <ul className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-bg-normal">
      {items.map((item) => (
        <li key={item.id}>
          <ItemLink
            itemId={item.id}
            list={list}
            className={`flex items-center gap-3 px-4 hover:bg-bg-normal-hovered ${brief ? "min-h-12 py-2.5" : "min-h-14 py-3"}`}
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-fg-strong">{item.title}</span>
              {item.summary && !brief ? <span className="text-sm text-fg-normal">{item.summary}</span> : null}
              <span className="text-xs text-fg-subtle">{[DOOR_INFO[doorOf(item)].title, rangeLabel(item)].filter(Boolean).join(" · ")}</span>
            </span>
            {reads[item.id] ? <ReadMark /> : null}
            <ChevronRight aria-hidden size={18} className="shrink-0 text-fg-subtle" />
          </ItemLink>
        </li>
      ))}
    </ul>
  );
}
