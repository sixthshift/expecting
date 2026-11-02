import {
  CalendarClock,
  Camera,
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
import { type Capture, CHOICE } from "../model/choices";

/** Each choice's icon, beside its words (`CHOICE`). */
const ICON: Record<Capture, LucideIcon> = {
  movement: Footprints,
  sick: Waves,
  craving: IceCreamCone,
  note: NotebookPen,
  photo: Camera,
  paper: FileText,
  feeling: Smile,
  first: Star,
  appointment: CalendarClock,
  question: MessageCircleQuestion,
  task: ListChecks,
};

/** What to add: each choice offered, in order, with what it becomes. */
export function ChoiceList({ choices, onChoose }: { choices: readonly Capture[]; onChoose: (capture: Capture) => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {choices.map((c) => {
        const { label, becomes } = CHOICE[c];
        const Icon = ICON[c];
        return (
          <li key={c}>
            <button
              type="button"
              onClick={() => onChoose(c)}
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
  );
}
