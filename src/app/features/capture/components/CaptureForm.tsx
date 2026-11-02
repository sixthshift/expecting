import type { FirstKey } from "../../../../lib/firsts";
import type { Person } from "../../../../lib/people";
import { WEEKS, type Week } from "../../../../lib/timeline";
import { AddCraving } from "../../../../pillars/journal/features/appetite/components/AddCraving";
import { AddSickness } from "../../../../pillars/journal/features/appetite/components/AddSickness";
import { CheckInNow } from "../../../../pillars/journal/features/feelings/components/checkIn/CheckInNow";
import { MarkFirst } from "../../../../pillars/journal/features/firsts/components/MarkFirst";
import { AddMovement } from "../../../../pillars/journal/features/movements/components/AddMovement";
import { AddNote } from "../../../../pillars/journal/features/notes/components/AddNote";
import { AddPaper } from "../../../../pillars/journal/features/papers/components/AddPaper";
import { AddPhoto } from "../../../../pillars/journal/features/photos/components/AddPhoto";
import { AddAppointment } from "../../../../pillars/planner/features/appointments/components/AddAppointment";
import { AddQuestion } from "../../../../pillars/planner/features/questions/components/AddQuestion";
import { AddTask } from "../../../../pillars/planner/features/tasks/components/addTask/AddTask";
import type { Capture } from "../model/choices";

/**
 * The chosen one's form: its pillar's own. Over every kind, so a new one
 * doesn't compile without its form. `text` and `files`, what was shared,
 * start the forms that take them.
 */
export function CaptureForm({
  capture,
  me,
  now,
  text,
  files,
  letter,
  first,
  onFiled,
}: {
  capture: Capture;
  me: Person | null;
  now: Week | null;
  text?: string;
  files?: File[];
  letter?: boolean;
  first?: FirstKey;
  onFiled: (capture: Capture) => void;
}) {
  const onAdded = () => onFiled(capture);
  switch (capture) {
    case "movement":
      return <AddMovement onAdded={onAdded} />;
    case "sick":
      return <AddSickness onAdded={onAdded} />;
    case "craving":
      return <AddCraving onAdded={onAdded} />;
    case "note":
      return <AddNote text={text} letter={letter} onAdded={onAdded} />;
    case "photo":
      return <AddPhoto files={files} onAdded={onAdded} />;
    case "paper":
      return <AddPaper files={files} onAdded={onAdded} />;
    case "feeling":
      return me ? <CheckInNow me={me} onDone={onAdded} /> : null;
    case "first":
      return <MarkFirst first={first} onAdded={onAdded} />;
    case "appointment":
      return <AddAppointment onAdded={onAdded} />;
    case "question":
      return <AddQuestion text={text} onAdded={onAdded} />;
    case "task":
      return <AddTask week={now ?? WEEKS.first} text={text} onAdded={onAdded} />;
    default:
      return capture satisfies never;
  }
}
