import { Button } from "@sixthshift/design-system/button";
import { PenLine } from "lucide-react";
import { useState } from "react";
import type { CirclePerson, View } from "../../../../lib/circle";
import { PersonSheet } from "./PersonSheet";

/** Someone in a view: their name, their few words, what the view says of them, and the way to change it. */
export function PersonRow({ person, view, meta }: { person: CirclePerson; view: View; meta?: string | null }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-11 items-center gap-3 border-b border-border-subtle py-1 last:border-b-0">
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-fg-strong">{person.name}</span>
        {person.note || meta ? <span className="text-xs text-fg-subtle">{[person.note, meta].filter(Boolean).join(" · ")}</span> : null}
      </span>
      <Button variant="ghost" size="sm" iconOnly aria-label={`Change: ${person.name}`} onClick={() => setOpen(true)}>
        <PenLine aria-hidden size={16} />
      </Button>
      {open ? <PersonSheet person={person} view={view} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
