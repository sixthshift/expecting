// The capture sheet: what to add, then its form, in the same sheet. Each
// form is its pillar's own, reused: the Journal's note, movement, sickness and
// craving, photo, paper, first, the check-in, the Planner's question and task.
// Once kept, the sheet closes and a toast says where it went, with the way to
// it; you stay on the page you were on. Kept from the Journal itself, there's
// no toast: the Journal shows what was just kept (`?kept=`).

import { Button } from "@sixthshift/design-system/button";
import { Modal } from "@sixthshift/design-system/modal";
import { toast } from "@sixthshift/design-system/overlay";
import { useLocation, useNavigate } from "@tanstack/react-router";
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
  Star,
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
import { MarkFirst } from "../../journal/components/firsts/firsts";
import { AddMovement } from "../../journal/components/movements/movements";
import { AddNote } from "../../journal/components/notes/notes";
import { AddPaper } from "../../journal/components/papers/AddPaper";
import { AddPhoto } from "../../journal/components/photos/AddPhoto";
import { AddQuestion } from "../../questions/components/questions/questions";
import { AddTask } from "../../tasks/components/addTask/AddTask";
import { type Capture, captureChoices, FILED_IN } from "../model/choices";

/** Each choice: what it is, and in a few words what it becomes. Facts, not a pitch. */
const CHOICE: Record<Capture, { label: string; icon: LucideIcon; becomes: string }> = {
  movement: { label: "The baby moved", icon: Footprints, becomes: "So you know their rhythm" },
  sick: { label: "Sick or queasy", icon: Waves, becomes: "Since when, if you're asked" },
  craving: { label: "A craving", icon: IceCreamCone, becomes: "Tallied, for later" },
  note: { label: "A note", icon: NotebookPen, becomes: "On its day, for you both, or to the baby" },
  photo: { label: "A photo or scan", icon: Camera, becomes: "The bump lined up week by week" },
  paper: { label: "A result or paper", icon: FileText, becomes: "Found in a moment" },
  feeling: { label: "How I'm feeling", icon: Smile, becomes: "The weeks, at a glance" },
  first: { label: "A first", icon: Star, becomes: "In both your words" },
  question: { label: "A question to ask", icon: MessageCircleQuestion, becomes: "Ready for the appointment" },
  task: { label: "Something to do", icon: ListChecks, becomes: "In the Planner" },
};

/** `initial`: open on that one's form (the Journal's Keep row). */
export function CaptureSheet({ initial = null, onClose }: { initial?: Capture | null; onClose: () => void }) {
  const { data: people } = usePeople();
  const { data: quiet } = useQuiet();
  const { data: journal } = useJournal();
  const now = useNow();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [chosen, setChosen] = useState<Capture | null>(initial);
  const choices = captureChoices({
    holding: Boolean(people.me),
    quiet: Boolean(quiet),
    movements: movementsOffered({ now, quiet: Boolean(quiet), entries: journal }),
  });

  /** Kept: close, and say where it went, with the way there; in the Journal, show it there as just kept. */
  function filed(capture: Capture, id?: string) {
    const { pillar, to } = FILED_IN[capture];
    onClose();
    if (to === "/journal" && pathname === "/journal") {
      navigate({ to: "/journal", search: { kept: id } });
      return;
    }
    toast({
      title: `In the ${pillar}`,
      action: "See it",
      onAction: () => (to === "/journal" ? navigate({ to: "/journal", search: { kept: id } }) : navigate({ to })),
    });
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
              const { label, icon: Icon, becomes } = CHOICE[c];
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => setChosen(c)}
                    aria-label={label}
                    aria-describedby={`becomes-${c}`}
                    className="flex min-h-12 w-full items-center gap-3 rounded-md px-3 py-1.5 text-left text-fg-normal hover:bg-bg-normal-hovered"
                  >
                    <Icon aria-hidden size={20} className="shrink-0 text-fg-brand" />
                    <span className="flex flex-col">
                      <span data-choice>{label}</span>
                      <span id={`becomes-${c}`} className="text-xs text-fg-subtle">
                        {becomes}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : chosen === "movement" ? (
          <AddMovement onAdded={(id) => filed("movement", id)} />
        ) : chosen === "sick" ? (
          <AddSickness onAdded={(id) => filed("sick", id)} />
        ) : chosen === "craving" ? (
          <AddCraving onAdded={(id) => filed("craving", id)} />
        ) : chosen === "note" ? (
          <AddNote onAdded={(id) => filed("note", id)} />
        ) : chosen === "photo" ? (
          <AddPhoto onAdded={(id) => filed("photo", id)} />
        ) : chosen === "paper" ? (
          <AddPaper onAdded={(id) => filed("paper", id)} />
        ) : chosen === "feeling" && people.me ? (
          <CheckInNow me={people.me} onDone={(id) => filed("feeling", id)} />
        ) : chosen === "first" ? (
          <MarkFirst onAdded={(key) => filed("first", key)} />
        ) : chosen === "question" ? (
          <AddQuestion onAdded={() => filed("question")} />
        ) : chosen === "task" ? (
          <AddTask week={now ?? WEEKS.first} onAdded={() => filed("task")} />
        ) : null}
      </Modal.Body>
    </Modal>
  );
}
