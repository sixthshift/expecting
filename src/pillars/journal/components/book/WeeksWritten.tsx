import { type Week, weekLabel } from "../../../../lib/timeline";
import { weekTitle } from "../../model/labels";

/** The weeks of a chapter so far, as Expecting has written them: each week's title. */
export function WeeksWritten({ from, to }: { from: Week; to: Week }) {
  const weeks = Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
  if (weeks.length === 0) return null;
  return (
    <ol className="flex flex-col text-sm text-fg-subtle">
      {weeks.map((w) => (
        <li key={w} className="flex gap-3">
          <span className="w-16 shrink-0 tabular-nums">{weekLabel(w)}</span>
          <span>{weekTitle(w)}</span>
        </li>
      ))}
    </ol>
  );
}
