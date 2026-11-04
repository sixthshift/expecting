import { useLayoutEffect, useRef, useState } from "react";
import type { Item } from "../../../../content/schema";
import type { Group } from "../../../../lib/library/doors";
import { columnsIn, intoColumns } from "../../model/columns";
import { Rows } from "./Rows";

/** A column's least width, so a title stays near its answer; and the gap between two. */
const MIN = 320;
const GAP = 24;

/**
 * A shelf's groups of rows in as many columns as its width holds: one on a
 * phone, two or three on a desktop, fewer again while the side panel takes
 * some of it. Read down each column and on into the next, a group running on
 * where it must (`intoColumns`), so one group alone still fills the width.
 * Each column's part of a group is its own box, under its heading where it
 * starts and under the heading's space where it runs on, so the columns' tops
 * line up. `list` is the whole shelf, what an entry opened from it goes on
 * through.
 */
export function RowColumns({ groups, list }: { groups: readonly Group[]; list: readonly string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setCount(columnsIn(el.clientWidth, MIN, GAP));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const columns = intoColumns<Item>(groups, count);
  return (
    <div ref={ref} className="grid items-start gap-x-6" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
      {columns.map((column) => (
        <div key={column[0]?.key} className="flex min-w-0 flex-col gap-8">
          {column.map((part) =>
            part.first ? (
              <section key={part.key} aria-label={part.title} className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">{part.title}</h2>
                <Rows items={part.items} list={list} />
              </section>
            ) : (
              <div key={part.key} className="flex flex-col gap-3">
                <span aria-hidden className="invisible text-sm">
                  {part.title}
                </span>
                <Rows items={part.items} list={list} />
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
}
