import { ChevronRight } from "lucide-react";
import { useReadsQuery } from "../../../../api/rpc/reads";
import type { Item } from "../../../../content/schema";
import { DOOR_INFO, doorOf } from "../../../../lib/library/doors";
import { rangeLabel } from "../../model/labels";
import { ItemLink } from "../itemLink/ItemLink";
import { ReadMark } from "../ReadMark";

/** The list's frame: rows divided by lines, in a rounded box. */
export const LIST = "overflow-hidden rounded-xl border border-border-subtle bg-bg-normal";

/**
 * Items as a list of links, each to its own page, with why it matters and the
 * door it's behind, ticked once you've read it: what's worth knowing this
 * week, Related, and the like. `brief` leaves out why it matters, for a list
 * beside others (This week's on a desktop), where a title is enough to choose
 * by. A search's results, which can be most of the Library, are drawn as they
 * scroll into view (`VirtualItemList`).
 */
export function ItemList({ items, brief = false, list = items.map((i) => i.id) }: { items: readonly Item[]; brief?: boolean; list?: readonly string[] }) {
  const { data: reads } = useReadsQuery();
  return (
    <ul className={`flex flex-col divide-y divide-border-subtle ${LIST}`}>
      {items.map((item) => (
        <li key={item.id}>
          <ItemRow item={item} list={list} read={Boolean(reads[item.id])} brief={brief} />
        </li>
      ))}
    </ul>
  );
}

/** One entry in a list: its title, why it matters (unless `brief`), its door and weeks, and whether you've read it. */
export function ItemRow({ item, list, read, brief = false }: { item: Item; list: readonly string[]; read: boolean; brief?: boolean }) {
  return (
    <ItemLink
      itemId={item.id}
      list={list}
      className={`flex items-center gap-3 px-4 hover:bg-bg-normal-hovered aria-[current=page]:bg-bg-brand-subtle ${brief ? "min-h-12 py-2.5" : "min-h-14 py-3"}`}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-fg-strong">{item.title}</span>
        {item.summary && !brief ? <span className="text-sm text-fg-normal">{item.summary}</span> : null}
        <span className="text-xs text-fg-subtle">{[DOOR_INFO[doorOf(item)].title, rangeLabel(item)].filter(Boolean).join(" · ")}</span>
      </span>
      {read ? <ReadMark /> : null}
      <ChevronRight aria-hidden size={18} className="shrink-0 text-fg-subtle" />
    </ItemLink>
  );
}
