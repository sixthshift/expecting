// A day's movements, on one line.

import { cn } from "@sixthshift/design-system/utils";
import { Footprints } from "lucide-react";
import { useState } from "react";
import { asOne, formatTime, type JournalEntry } from "../../../../lib/journal";
import type { StoryItem } from "../../../../lib/story/items";
import { Movement } from "../entries/movements/Movement";

import { EntrySheet, Opens } from "./parts";

/** A day's movements' times, as one rhythm: two kept within a few minutes (both of you, for the same kick) are one time. One kept without a time stays as "a time". */
function movedTimes(entries: readonly JournalEntry[]): { id: string; time: string | null; different: boolean }[] {
  const timed = entries.flatMap((e) => (e.time ? [{ id: e.id, time: e.time, different: e.different }] : []));
  return [...asOne(timed), ...entries.filter((e) => !e.time).map((e) => ({ id: e.id, time: null, different: e.different }))];
}

/** A day's movements on one line: the baby's, so no name, whoever felt them. */
export function MovedLine({ item }: { item: Extract<StoryItem, { kind: "movements" }> }) {
  const [open, setOpen] = useState(false);
  const words = item.entries.map((e) => e.body).filter(Boolean);
  return (
    <>
      <Opens label="Open: felt moving" onOpen={() => setOpen(true)}>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-fg-normal">
          <Footprints aria-hidden size={16} className="text-fg-brand" />
          <span className="text-fg-strong">Felt moving</span>
          {movedTimes(item.entries).map((e) => (
            <span key={e.id} className={cn("text-sm", e.different ? "rounded-full px-1.5 ring-2 ring-fg-brand" : "text-fg-subtle")}>
              {e.time ? formatTime(e.time) : "a time"}
              {e.different ? <span className="sr-only">, slower, weaker or stopped</span> : null}
            </span>
          ))}
        </span>
        {words.length > 0 ? <span className="mt-0.5 block text-fg-normal">{words.join(" · ")}</span> : null}
      </Opens>
      {open ? (
        <EntrySheet title="Felt moving" onClose={() => setOpen(false)}>
          {[...item.entries].reverse().map((e) => (
            <Movement key={e.id} entry={e} />
          ))}
        </EntrySheet>
      ) : null}
    </>
  );
}
