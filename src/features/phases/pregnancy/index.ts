import { BookOpen, CalendarRange, ListChecks, NotebookPen, Wrench } from "lucide-react";
import type { PhaseApp } from "../../app/phaseApp";
import { PregnancyLayout } from "./Layout";

/**
 * The pregnancy: all five pillars, with the timeline as the thread through the
 * other four. What the Library explains, the Planner asks of you and the
 * Journal keeps all meet on their week.
 */
export const pregnancy: PhaseApp = {
  Layout: PregnancyLayout,
  timeline: true,
  planner: { grouping: "weeks", earlier: "slip", questionsFor: "For the next appointment" },
  library: { first: [], earlier: "keep", search: "Search the library" },
  pillars: [
    { to: "/pregnancy", label: "Timeline", icon: CalendarRange },
    { to: "/pregnancy/library", label: "Library", icon: BookOpen },
    { to: "/pregnancy/planner", label: "Planner", icon: ListChecks },
    { to: "/pregnancy/journal", label: "Journal", icon: NotebookPen },
    { to: "/pregnancy/toolkit", label: "Toolkit", icon: Wrench },
  ],
};
