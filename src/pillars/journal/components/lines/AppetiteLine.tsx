// A day's sickness, or a craving, on one line.

import { IceCreamCone, Waves } from "lucide-react";
import { useState } from "react";
import { type AppetiteEntry, HOW_LABEL } from "../../../../lib/appetite";
import { AppetiteItem } from "../entries/appetite/AppetiteItem";

import { EntrySheet, Opens } from "./parts";

const TIMES = ["", "", "twice", "three times", "four times", "five times"];

/** A day's sickness, or a craving (or something gone off) kept on it, however many times: one line. */
export function AppetiteLine({ entries }: { entries: AppetiteEntry[] }) {
  const [open, setOpen] = useState(false);
  const first = entries[0]!;
  const sick = first.kind === "sick";
  const notes = entries.map((e) => e.note).filter(Boolean);
  const times = entries.length > 1 ? (TIMES[entries.length] ?? `${entries.length} times`) : null;
  return (
    <>
      <Opens label={sick ? "Open: sickness" : `Open: ${first.what}`} onOpen={() => setOpen(true)}>
        {sick ? (
          <span className="flex flex-wrap items-center gap-2 text-fg-normal">
            <Waves aria-hidden size={16} className="text-fg-brand" />
            {entries.map((e) => HOW_LABEL[e.how ?? "queasy"]).join(", ")}
          </span>
        ) : (
          <span className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-brand-subtle px-2.5 py-0.5 text-sm text-fg-on-brand-subtle">
              <IceCreamCone aria-hidden size={14} />
              {first.kind === "off" ? `Gone off ${first.what}` : first.what}
            </span>
            {times ? <span className="text-sm text-fg-subtle">{times}</span> : null}
          </span>
        )}
        {notes.length > 0 ? <span className="mt-0.5 block text-fg-normal">{notes.join(" · ")}</span> : null}
      </Opens>
      {open ? (
        <EntrySheet title={sick ? "Sickness" : first.kind === "off" ? "Gone off" : "A craving"} onClose={() => setOpen(false)}>
          {entries.map((e) => (
            <AppetiteItem key={e.id} entry={e} />
          ))}
        </EntrySheet>
      ) : null}
    </>
  );
}
