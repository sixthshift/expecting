// The capture sheet: what to add, then its form, in the same sheet. Each
// form is its pillar's own, reused: the Journal's note, movement, sickness and craving, photo, paper, the
// check-in, the Planner's question and task. Once kept, the sheet closes and
// a toast says where it went; you stay on the page you were on.

import { Button } from "@sixthshift/design-system/button";
import { Modal } from "@sixthshift/design-system/modal";
import { toast } from "@sixthshift/design-system/overlay";
import { useNavigate } from "@tanstack/react-router";
import {
  Camera,
  ChevronLeft,
  FileText,
  Footprints,
  IceCreamCone,
  ListChecks,
  type LucideIcon,
  MessageCircleQuestion,
  NotebookPen,
  Smile,
  Waves,
} from "lucide-react";
import { useState } from "react";
import { useJournal } from "../../../api/rpc/journal";
import { usePeople } from "../../../api/rpc/people";
import { useQuiet } from "../../../api/rpc/quiet";
import { useNow } from "../../../api/rpc/settings";
import { movementsOffered } from "../../../lib/journal";
import { WEEKS } from "../../../lib/timeline";
import { CheckInNow } from "../../feelings/components/checkIn/CheckInNow";
import { AddCraving, AddSickness } from "../../journal/components/appetite/appetite";
import { AddMovement } from "../../journal/components/movements/movements";
import { AddNote } from "../../journal/components/notes/notes";
import { AddPaper } from "../../journal/components/papers/AddPaper";
import { AddPhoto } from "../../journal/components/photos/AddPhoto";
import { AddQuestion } from "../../questions/components/questions/questions";
import { AddTask } from "../../tasks/components/addTask/AddTask";
import { type Capture, captureChoices, FILED_IN } from "../model/choices";

const CHOICE: Record<Capture, { label: string; icon: LucideIcon }> = {
  movement: { label: "The baby moved", icon: Footprints },
  sick: { label: "Sick or queasy", icon: Waves },
  craving: { label: "A craving", icon: IceCreamCone },
  note: { label: "A note", icon: NotebookPen },
  photo: { label: "A photo or scan", icon: Camera },
  paper: { label: "A result or paper", icon: FileText },
  feeling: { label: "How I'm feeling", icon: Smile },
  question: { label: "A question to ask", icon: MessageCircleQuestion },
  task: { label: "Something to do", icon: ListChecks },
};

export function CaptureSheet({ onClose }: { onClose: () => void }) {
  const { data: people } = usePeople();
  const { data: quiet } = useQuiet();
  const { data: journal } = useJournal();
  const now = useNow();
  const navigate = useNavigate();
  const [chosen, setChosen] = useState<Capture | null>(null);
  const choices = captureChoices({
    holding: Boolean(people.me),
    quiet: Boolean(quiet),
    movements: movementsOffered({ now, quiet: Boolean(quiet), entries: journal }),
  });

  /** Kept: close, and say where it went, with the way there. */
  function filed(capture: Capture) {
    const { pillar, to } = FILED_IN[capture];
    onClose();
    toast({ title: `In the ${pillar}`, action: "See it", onAction: () => navigate({ to }) });
  }

  return (
    <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : onClose())}>
      <Modal.Header>
        <h2 className="flex items-center gap-1 font-display text-lg font-semibold text-fg-strong">
          {chosen ? (
            <Button variant="ghost" size="sm" iconOnly aria-label="Back to what to add" onClick={() => setChosen(null)} className="-ml-2">
              <ChevronLeft aria-hidden size={18} />
            </Button>
          ) : null}
          {chosen ? CHOICE[chosen].label : "Add"}
        </h2>
      </Modal.Header>
      <Modal.Body className="px-6 pb-6">
        {chosen === null ? (
          <ul className="flex flex-col gap-1">
            {choices.map((c) => {
              const { label, icon: Icon } = CHOICE[c];
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => setChosen(c)}
                    className="flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left text-fg-normal hover:bg-bg-normal-hovered"
                  >
                    <Icon aria-hidden size={20} className="text-fg-brand" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : chosen === "movement" ? (
          <AddMovement onAdded={() => filed("movement")} />
        ) : chosen === "sick" ? (
          <AddSickness onAdded={() => filed("sick")} />
        ) : chosen === "craving" ? (
          <AddCraving onAdded={() => filed("craving")} />
        ) : chosen === "note" ? (
          <AddNote onAdded={() => filed("note")} />
        ) : chosen === "photo" ? (
          <AddPhoto onAdded={() => filed("photo")} />
        ) : chosen === "paper" ? (
          <AddPaper onAdded={() => filed("paper")} />
        ) : chosen === "feeling" && people.me ? (
          <CheckInNow me={people.me} onDone={() => filed("feeling")} />
        ) : chosen === "question" ? (
          <AddQuestion onAdded={() => filed("question")} />
        ) : chosen === "task" ? (
          <AddTask week={now ?? WEEKS.first} onAdded={() => filed("task")} />
        ) : null}
      </Modal.Body>
    </Modal>
  );
}
