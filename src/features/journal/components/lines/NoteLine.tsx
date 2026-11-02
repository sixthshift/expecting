// A note, or a letter to the baby, said so.

import { cn } from "@sixthshift/design-system/utils";
import { useState } from "react";
import type { StoryItem } from "../../../../lib/story/items";
import { Note } from "../entries/notes/Note";

import { At, By, EntrySheet, Opens, useOther } from "./parts";

export function NoteLine({ item }: { item: Extract<StoryItem, { kind: "note" | "letter" }> }) {
  const [open, setOpen] = useState(false);
  const other = useOther();
  const letter = item.kind === "letter";
  return (
    <>
      <Opens label={`Open: ${item.entry.body.slice(0, 60)}`} onOpen={() => setOpen(true)}>
        {letter ? <span className="block text-xs font-semibold text-fg-brand">A letter to the baby</span> : null}
        <span className={cn("whitespace-pre-wrap text-fg-strong", letter && "font-display text-lg")}>{item.entry.body}</span>
        <By name={letter && item.entry.fromBoth ? "from both of you" : other(item.by)} />
        <At time={item.time} />
      </Opens>
      {open ? (
        <EntrySheet title={letter ? "A letter to the baby" : "A note"} onClose={() => setOpen(false)}>
          <Note entry={item.entry} />
        </EntrySheet>
      ) : null}
    </>
  );
}
