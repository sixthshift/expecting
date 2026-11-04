/** One group's rows in one column: its heading only where the group starts. */
export type Part<T> = { key: string; title: string; first: boolean; items: readonly T[] };

/** A heading takes about as much height as a row; the gap between groups, half one. */
const HEADING = 1;
const GAP = 0.5;

/**
 * How many columns of at least `min` px, `gap` apart, fit in `width` px: at
 * least one.
 */
export function columnsIn(width: number, min: number, gap: number): number {
  return Math.max(1, Math.floor((width + gap) / (min + gap)));
}

/**
 * Groups of rows laid down `count` columns as even as they'll go, in order,
 * read down each column and on into the next, like a newspaper's. A group runs
 * on into the next column where it must, but never leaving a row on its own
 * either side of the break; one that would start with only its heading at a
 * column's foot starts the next.
 */
export function intoColumns<T>(groups: readonly { key: string; title: string; items: readonly T[] }[], count: number): Part<T>[][] {
  // Every column starts with a heading's height: its first group's, or kept for one running on.
  const total = groups.reduce((sum, g, i) => sum + HEADING + g.items.length + (i > 0 ? GAP : 0), 0) + (count - 1) * HEADING;
  const target = total / count;
  const columns: Part<T>[][] = [[]];
  let height = 0;
  const next = () => {
    columns.push([]);
    height = 0;
  };
  for (const g of groups) {
    let from = 0;
    while (from < g.items.length) {
      const column = columns[columns.length - 1] ?? [];
      const last = columns.length === count;
      const head = (column.length > 0 ? GAP : 0) + HEADING;
      const room = last ? Number.POSITIVE_INFINITY : Math.round(target - height - head);
      const left = g.items.length - from;
      let take = Math.min(left, Math.max(room, 0));
      // Never one row alone on either side of a break.
      if (take < left && left - take === 1) take = left;
      if (take === 1 && left > 1) take = 0;
      if (take === 0 && column.length > 0) {
        next();
        continue;
      }
      if (take === 0) take = Math.min(left, 2);
      column.push({ key: `${g.key}:${from}`, title: g.title, first: from === 0, items: g.items.slice(from, from + take) });
      height += head + take;
      from += take;
      if (from < g.items.length) next();
    }
  }
  return columns.filter((c) => c.length > 0);
}
