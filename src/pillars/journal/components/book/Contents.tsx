import { cn } from "@sixthshift/design-system/utils";
import type { ChapterLine } from "../../../../lib/chapters";

const STATE_LABEL = { begun: "Begun", now: "Now", "to-come": "Still to come", passed: "Can still be kept" } as const;

/** The contents: each chapter, and how it stands. */
export function Contents({ lines }: { lines: readonly ChapterLine[] }) {
  return (
    <ol aria-label="Contents" className="flex flex-col">
      {lines.map(({ chapter, state }) => (
        <li key={chapter.key} className="flex items-baseline gap-2 py-1">
          <span className={cn("font-display", state === "begun" || state === "now" ? "text-fg-strong" : "text-fg-subtle opacity-70")}>{chapter.title}</span>
          <span aria-hidden className="flex-1 border-b border-dotted border-border-normal" />
          <span className={cn("text-xs", state === "now" ? "font-medium text-fg-brand" : state === "begun" ? "text-fg-normal" : "text-fg-subtle")}>
            {chapter.weeks ? STATE_LABEL[state] : "With the birth"}
          </span>
        </li>
      ))}
    </ol>
  );
}
