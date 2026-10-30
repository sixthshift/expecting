import type { Item } from "../../../../content/schema";
import { rangeLabel } from "../ItemCard";
import { ItemLink } from "../ItemLink";

/** The things nobody tells you, as cards: each one's surprise is its summary, so it's read without opening. */
export function Cards({ items }: { items: readonly Item[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <ItemLink itemId={item.id} className="flex h-full flex-col gap-2 rounded-xl border border-border-subtle bg-bg-normal p-4 hover:border-border-normal">
            <span className="font-medium text-fg-strong">{item.title}</span>
            {item.summary ? <span className="text-sm text-fg-normal">{item.summary}</span> : null}
            <span className="mt-auto text-xs text-fg-subtle">{rangeLabel(item)}</span>
          </ItemLink>
        </li>
      ))}
    </ul>
  );
}
