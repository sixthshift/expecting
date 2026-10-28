import { BookOpen, CalendarRange, ListChecks, NotebookPen, Sun } from "lucide-react";
import type { PhaseApp } from "../../app/phaseApp";
import { PregnancyLayout } from "./Layout";

/**
 * The pregnancy: home is this week, where you are and what matters now, with
 * the tools for the moment. The timeline is the whole pregnancy at a glance,
 * the thread through the other pillars: what the Library explains, the
 * Planner asks of you and the Journal keeps all meet on their week.
 */
export const pregnancy: PhaseApp = {
  Layout: PregnancyLayout,
  timeline: "/pregnancy/timeline",
  planner: { grouping: "weeks", earlier: "slip", questionsFor: "For the next appointment" },
  library: { first: [], earlier: "keep", search: "Search the library" },
  pillars: [
    { to: "/pregnancy", label: "This week", icon: Sun },
    { to: "/pregnancy/timeline", label: "Timeline", icon: CalendarRange },
    { to: "/pregnancy/library", label: "Library", icon: BookOpen },
    { to: "/pregnancy/planner", label: "Planner", icon: ListChecks },
    { to: "/pregnancy/journal", label: "Journal", icon: NotebookPen },
  ],
};
