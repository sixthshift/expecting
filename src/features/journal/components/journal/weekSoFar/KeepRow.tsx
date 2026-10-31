// The Journal's Keep row: the "+"'s choices the Journal keeps, one tap each,
// opening the same sheet already on that form. Each form is written once and
// used everywhere; kept here, the page shows it as just kept.

import { Camera, FileText, Footprints, IceCreamCone, type LucideIcon, NotebookPen, Smile, Star, Waves } from "lucide-react";
import { useState } from "react";
import { useJournal } from "../../../../../api/rpc/journal";
import { usePeople } from "../../../../../api/rpc/people";
import { useQuiet } from "../../../../../api/rpc/quiet";
import { useNow } from "../../../../../api/rpc/settings";
import { movementsOffered } from "../../../../../lib/journal";
import { CaptureSheet } from "../../../../capture/components/CaptureSheet";
import { type Capture, captureChoices, journalChoices } from "../../../../capture/model/choices";

const CHIP: Partial<Record<Capture, { label: string; icon: LucideIcon }>> = {
  movement: { label: "Moved", icon: Footprints },
  sick: { label: "Sick", icon: Waves },
  craving: { label: "Craving", icon: IceCreamCone },
  note: { label: "Note", icon: NotebookPen },
  photo: { label: "Photo", icon: Camera },
  paper: { label: "Paper", icon: FileText },
  feeling: { label: "Feeling", icon: Smile },
  first: { label: "A first", icon: Star },
};

export function KeepRow() {
  const { data: people } = usePeople();
  const { data: quiet } = useQuiet();
  const { data: journal } = useJournal();
  const now = useNow();
  const [open, setOpen] = useState<Capture | null>(null);
  const choices = journalChoices(
    captureChoices({ holding: Boolean(people.me), quiet: Boolean(quiet), movements: movementsOffered({ now, quiet: Boolean(quiet), entries: journal }) })
  );

  return (
    <>
      <ul aria-label="Keep" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
        {choices.map((c) => {
          const chip = CHIP[c];
          if (!chip) return null;
          const Icon = chip.icon;
          return (
            <li key={c} className="shrink-0">
              <button
                type="button"
                onClick={() => setOpen(c)}
                className="flex min-h-10 items-center gap-2 rounded-full border border-border-normal bg-bg-normal px-3 text-sm text-fg-normal hover:bg-bg-normal-hovered focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                <Icon aria-hidden size={16} className="text-fg-brand" />
                {chip.label}
              </button>
            </li>
          );
        })}
      </ul>
      {open ? <CaptureSheet initial={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
