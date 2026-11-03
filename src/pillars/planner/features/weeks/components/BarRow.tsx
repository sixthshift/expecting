import { cn } from "@sixthshift/design-system/utils";
import type { CSSProperties, ReactNode } from "react";
import type { Bar } from "../../../../../lib/planner/weeks";
import { ItemLink } from "../../../../library/components/itemLink/ItemLink";
import { barLabel } from "../../../model/labels";
import { mid, SPAN, TONE, width, x } from "./scale";

/** One task: its title over its bar on a phone, beside it on a desktop; to its item, when it has one. */
export function BarRow({ bar }: { bar: Bar }) {
  const { task, from, due, to, state } = bar;
  const late = from > SPAN / 2;
  const place = { "--start": x(from), "--end": `calc(100% - ${x(to + 1)})` } as CSSProperties;
  const label = barLabel(bar);
  const inner: ReactNode = (
    <>
      <span
        className={cn(
          "line-clamp-2 text-sm [text-shadow:0_0_2px_var(--expecting-page),0_0_4px_var(--expecting-page),0_0_6px_var(--expecting-page)] desktop:line-clamp-none desktop:w-64 desktop:shrink-0 desktop:truncate desktop:pr-4 desktop:pl-0 desktop:text-left desktop:[text-shadow:none]",
          task.itemId && "group-hover:underline",
          late ? "pr-(--end) text-right" : "pl-(--start)",
          state === "open" || state === "late" ? "font-medium text-fg-strong" : "text-fg-subtle",
          state === "done" && "line-through"
        )}
      >
        {task.title}
      </span>
      <span aria-hidden className="relative h-3 desktop:flex-1">
        <span className={cn("absolute inset-y-0 rounded-full group-hover:opacity-80", TONE[state])} style={{ left: x(from), width: width(from, to) }} />
        {state === "done" ? null : (
          <span
            className={cn("absolute -inset-y-1 w-1 -translate-x-1/2 rounded-full", state === "ahead" ? "bg-fg-brand" : "bg-fg-strong")}
            style={{ left: mid(due) }}
          />
        )}
      </span>
    </>
  );
  const row = "group flex flex-col gap-1 rounded-sm py-0.5 desktop:h-8 desktop:flex-row desktop:items-center desktop:gap-0 desktop:py-0";
  return task.itemId ? (
    <ItemLink itemId={task.itemId} aria-label={label} className={row} style={place}>
      {inner}
    </ItemLink>
  ) : (
    // biome-ignore lint/a11y/useSemanticElements: a row of the chart, read as one thing; it goes nowhere, so it isn't a link.
    <div role="group" aria-label={label} className={row} style={place}>
      {inner}
    </div>
  );
}
