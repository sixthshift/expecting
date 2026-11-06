import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef, useState } from "react";
import { useReadsQuery } from "../../../../api/rpc/reads";
import type { Item } from "../../../../content/schema";
import { ItemRow, LIST } from "./ItemList";

/** A row's height before it's measured: a title, a line or two of why, and its door. */
const ESTIMATE = 96;

/**
 * `ItemList` for a list that can be most of the Library (a search's results):
 * every item is in it, but only those in view, and a few either side, are
 * drawn, so a letter that finds 900 entries draws a screenful. It scrolls
 * with the page. Each row is measured once drawn (a summary runs to one line
 * or three), and says where it is in the whole list to a screen reader.
 */
export function VirtualItemList({ items }: { items: readonly Item[] }) {
  const { data: reads } = useReadsQuery();
  const list = items.map((i) => i.id);
  const ref = useRef<HTMLUListElement>(null);
  // Where the list starts down the page: the virtualizer counts from the top of the document.
  const [top, setTop] = useState(0);
  useLayoutEffect(() => {
    const at = () => setTop((ref.current?.getBoundingClientRect().top ?? 0) + window.scrollY);
    at();
    const observer = new ResizeObserver(at);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);
  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => ESTIMATE,
    overscan: 6,
    scrollMargin: top,
    getItemKey: (i) => items[i]!.id,
  });

  return (
    <ul ref={ref} className={`relative ${LIST}`} style={{ height: virtualizer.getTotalSize() }}>
      {virtualizer.getVirtualItems().map((row) => {
        const item = items[row.index]!;
        return (
          <li
            key={row.key}
            data-index={row.index}
            ref={virtualizer.measureElement}
            aria-setsize={items.length}
            aria-posinset={row.index + 1}
            className={`absolute top-0 left-0 w-full border-border-subtle ${row.index > 0 ? "border-t" : ""}`}
            style={{ transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)` }}
          >
            <ItemRow item={item} list={list} read={Boolean(reads[item.id])} />
          </li>
        );
      })}
    </ul>
  );
}
