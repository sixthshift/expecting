import { BookOpen, CalendarRange, ListChecks, NotebookPen, Wrench } from "lucide-react";
import { Frame, type Pillar } from "../../shell/Frame";

/**
 * The pregnancy: all five pillars, with the timeline as the thread through the
 * other four. What the Library explains, the Planner asks of you and the
 * Journal keeps all meet on their week.
 */
export const PILLARS: readonly Pillar[] = [
  { to: "/", label: "Timeline", icon: CalendarRange },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/planner", label: "Planner", icon: ListChecks },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/toolkit", label: "Toolkit", icon: Wrench },
];

export function PregnancyShell() {
  return <Frame pillars={PILLARS} />;
}
