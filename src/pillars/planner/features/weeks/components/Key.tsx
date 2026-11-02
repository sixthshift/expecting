import { cn } from "@sixthshift/design-system/utils";
import type { BarState } from "../../../../../lib/planner/weeks";
import { TONE } from "./scale";

/** What the bars say, in the order they come: open now, ahead, late, done, and the notch. */
export function Key() {
  const keys: { state: BarState; label: string }[] = [
    { state: "open", label: "Open now" },
    { state: "ahead", label: "Ahead" },
    { state: "late", label: "Past its best-by week" },
    { state: "done", label: "Done" },
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-subtle">
      {keys.map(({ state, label }) => (
        <li key={state} className="flex items-center gap-1.5">
          <span aria-hidden className={cn("h-2.5 w-5 rounded-full", TONE[state])} />
          {label}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-3.5 w-1 rounded-full bg-fg-strong" />
        Best by
      </li>
    </ul>
  );
}
