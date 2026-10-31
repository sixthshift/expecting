import { Badge } from "@sixthshift/design-system/badge";
import { Button } from "@sixthshift/design-system/button";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { cn } from "@sixthshift/design-system/utils";
import { PenLine } from "lucide-react";
import { useState } from "react";
import { listsSaves } from "../../../../api/rpc/lists";
import { useSave } from "../../../../app/hooks/useSave";
import type { Line } from "../../../../content/schema";
import { HOWS, type Mark, wordsFor } from "../../../../lib/lists";
import { LineSheet } from "./LineSheet";

/** What a line's task says under it: "by week 36", close or not, or done in To do. */
export type LineTask = { label: string; soon: boolean; done: boolean };

/**
 * One line with its tick: got, or back to still to get (keeping its words).
 * Under it, where it's up to as a badge and who set it, its words, and its
 * task's when, warning-coloured once it's close. A got line fades. The
 * button opens the rest.
 */
export function LineRow({
  line,
  mark,
  by,
  task,
  onTick,
}: {
  line: Line;
  mark: Mark | undefined;
  by: string | null;
  task: LineTask | null;
  /** Told of each tick or untick as it's made, before it's saved. */
  onTick?: (got: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const markLine = useSave(listsSaves.markLine);
  const words = wordsFor(line.listId);
  const got = mark?.state === "got";

  function tick(next: boolean) {
    onTick?.(next);
    markLine({ lineId: line.id, state: next ? "got" : null, how: next ? (mark?.how ?? null) : null, note: mark?.note ?? null });
  }

  const state =
    mark?.state === "got" ? (mark.how ? HOWS[mark.how] : null) : mark?.state === "arranged" || mark?.state === "not-needed" ? words[mark.state] : null;
  const showTask = task && !got;
  const anything = state || mark?.note || showTask;

  return (
    <div className="flex items-start gap-1 border-t border-border-subtle py-1 first:border-t-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <Checkbox
          checked={got}
          onCheckedChange={tick}
          label={<span className={cn("text-fg-strong", got && "text-fg-subtle line-through")}>{line.title}</span>}
          labelClassName="flex-1 min-h-11 items-center"
          className="shrink-0"
        />
        {anything ? (
          <div className={cn("-mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 pb-2 pl-9 text-xs text-fg-subtle", got && "opacity-70")}>
            {state ? (
              <Badge size="sm" variant="soft" intent={mark?.state === "arranged" ? "brand" : "neutral"}>
                {state}
              </Badge>
            ) : null}
            {state && by ? <span>{by}</span> : null}
            {mark?.note ? <span className="text-fg-normal">“{mark.note}”</span> : null}
            {showTask ? (
              task.done ? (
                <span>{task.label}</span>
              ) : (
                <Badge size="sm" variant="soft" intent={task.soon ? "warning" : "neutral"}>
                  {task.label}
                </Badge>
              )
            ) : null}
          </div>
        ) : null}
      </div>
      <Button variant="ghost" size="sm" iconOnly aria-label={`Change: ${line.title}`} onClick={() => setOpen(true)} className="mt-1.5 shrink-0 text-fg-subtle">
        <PenLine aria-hidden size={16} />
      </Button>
      {open ? <LineSheet line={line} mark={mark} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
