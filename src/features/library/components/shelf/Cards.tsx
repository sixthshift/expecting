import { useReadsQuery } from "../../../../api/rpc/reads";
import type { Item } from "../../../../content/schema";
import { rangeLabel } from "../../model/labels";
import { ItemLink } from "../itemLink/ItemLink";
import { ReadMark } from "../ReadMark";

/** The things nobody tells you, as cards: each one's surprise is its summary, so it's read without opening. */
export function Cards({ items }: { items: readonly Item[] }) {
  const { data: reads } = useReadsQuery();
  const list = items.map((i) => i.id);
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <ItemLink
            itemId={item.id}
            list={list}
            className="flex h-full flex-col gap-2 rounded-xl border border-border-subtle bg-bg-normal p-4 hover:border-border-normal"
          >
            <span className="font-medium text-fg-strong">{item.title}</span>
            {item.summary ? <span className="text-sm text-fg-normal">{item.summary}</span> : null}
            <span className="mt-auto flex items-center justify-between gap-2 text-xs text-fg-subtle">
              <span>{rangeLabel(item)}</span>
              {reads[item.id] ? <ReadMark /> : null}
            </span>
          </ItemLink>
        </li>
      ))}
    </ul>
  );
}
