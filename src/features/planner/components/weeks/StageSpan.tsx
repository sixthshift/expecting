import { cn } from "@sixthshift/design-system/utils";
import { allWeeks, type Week } from "../../../../lib/timeline";

/** Where a stage sits in the pregnancy: a thin bar of the weeks, its own tinted, today solid. Decoration; the card says it in words. */
export function StageSpan({ start, end, now }: { start: Week; end: Week; now: Week | null }) {
  return (
    <span aria-hidden className="grid h-1.5 w-full grid-cols-[repeat(42,minmax(0,1fr))] gap-px">
      {allWeeks().map((w) => (
        <span key={w} className={cn("rounded-[1px]", w === now ? "bg-fg-brand" : w >= start && w <= end ? "bg-bg-brand-subtle-pressed" : "bg-border-subtle")} />
      ))}
    </span>
  );
}
