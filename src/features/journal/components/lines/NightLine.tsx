// The night it started (It's time).

import { Hourglass } from "lucide-react";
import { useState } from "react";
import { nightLine } from "../../../../lib/itsTime";
import type { StoryItem } from "../../../../lib/story/items";
import { NightDetail } from "../../../itsTime/components/night/NightDetail";

import { EntrySheet, Opens } from "./parts";

export function NightLine({ item }: { item: Extract<StoryItem, { kind: "night" }> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Opens label="Open: it started" onOpen={() => setOpen(true)}>
        <span className="flex items-start gap-2 text-fg-normal">
          <Hourglass aria-hidden size={16} className="mt-1 shrink-0 text-fg-brand" />
          <span>{nightLine(item.night)}</span>
        </span>
      </Opens>
      {open ? (
        <EntrySheet title="It started" onClose={() => setOpen(false)}>
          <NightDetail night={item.night} onDeleted={() => setOpen(false)} />
        </EntrySheet>
      ) : null}
    </>
  );
}
