import { cn } from "@sixthshift/design-system/utils";
import { inWeeks } from "../../../../lib/labels";
import type { BarGroup } from "../../../../lib/planner/weeks";
import { type Week, weekLabel } from "../../../../lib/timeline";
import { Bars } from "./Bars";

/** One group of the chart, To do now or a stage ahead: its title, how far off its end is, and its bars. Shaded when it's the stage opened at (`focused`). */
export function StageGroup({ group, focused, now }: { group: BarGroup; focused: boolean; now: Week | null }) {
  const left = group.key === "now" || now === null ? null : group.end - now;
  return (
    <section aria-labelledby={`stage-${group.key}`} data-stage={group.key} className="flex scroll-mt-24 flex-col gap-1">
      <h2 id={`stage-${group.key}`} className={cn("flex items-baseline gap-2 text-sm font-semibold lg:w-64", focused ? "text-fg-brand" : "text-fg-strong")}>
        <span>{group.title}</span>
        {group.key === "now" ? null : (
          <span className="text-xs font-normal text-fg-subtle">
            {weekLabel(group.end)}
            {left === null ? null : ` · ${inWeeks(left)}`}
          </span>
        )}
      </h2>
      <Bars bars={group.bars} />
    </section>
  );
}
