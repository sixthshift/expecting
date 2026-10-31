import { Button } from "@sixthshift/design-system/button";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { PenLine } from "lucide-react";
import { useState } from "react";
import { listsSaves } from "../../../../api/rpc/lists";
import { useSave } from "../../../../app/hooks/useSave";
import type { Line } from "../../../../content/schema";
import { HOWS, type Mark, wordsFor } from "../../../../lib/lists";
import { LineSheet } from "./LineSheet";

/** What a line's task says beside it: "by week 36 · in To do". */
export type LineTask = { label: string };

/**
 * One line with its tick: got, or back to still to get (keeping its words).
 * Beside it, where it's up to and who set it, its words, its task's when,
 * and a button that opens the rest.
 */
export function LineRow({ line, mark, by, task }: { line: Line; mark: Mark | undefined; by: string | null; task: LineTask | null }) {
  const [open, setOpen] = useState(false);
  const markLine = useSave(listsSaves.markLine);
  const words = wordsFor(line.listId);
  const got = mark?.state === "got";

  function tick(next: boolean) {
    markLine({ lineId: line.id, state: next ? "got" : null, how: next ? (mark?.how ?? null) : null, note: mark?.note ?? null });
  }

  const status =
    mark?.state === "got"
      ? mark.how
        ? HOWS[mark.how].toLowerCase()
        : null
      : mark?.state === "arranged" || mark?.state === "not-needed"
        ? words[mark.state].toLowerCase()
        : null;
  const meta = [status && by ? `${status} · ${by}` : status, mark?.note ? `“${mark.note}”` : null, got ? null : task?.label].filter(Boolean);

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-x-3 pb-2 lg:flex-nowrap lg:pb-0">
      <Checkbox
        checked={got}
        onCheckedChange={tick}
        label={<span className={got ? "text-fg-subtle line-through" : undefined}>{line.title}</span>}
        labelClassName="flex-1 min-h-11 items-center"
        className="shrink-0"
      />
      <span className="flex basis-full items-center gap-2 pl-9 text-xs text-fg-subtle lg:ml-auto lg:basis-auto lg:shrink-0 lg:pl-0">
        {meta.length > 0 ? <span className="flex flex-wrap gap-x-2">{meta.join(" · ")}</span> : null}
        <Button variant="ghost" size="sm" iconOnly aria-label={`Change: ${line.title}`} onClick={() => setOpen(true)} className="ml-auto lg:ml-0">
          <PenLine aria-hidden size={16} />
        </Button>
      </span>
      {open ? <LineSheet line={line} mark={mark} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
