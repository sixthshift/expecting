import { BookOpen, CalendarRange, ListChecks, NotebookPen, Wrench } from "lucide-react";
import type { PhaseApp } from "../../features/app/phaseApp";
import { PregnancyLayout } from "./Layout";

/**
 * The pregnancy: all five pillars, with the timeline as the thread through the
 * other four. What the Library explains, the Planner asks of you and the
 * Journal keeps all meet on their week.
 */
export const pregnancy: PhaseApp = {
  Layout: PregnancyLayout,
  pillars: [
    { to: "/", label: "Timeline", icon: CalendarRange, page: () => import("./Home").then((m) => m.PregnancyHome) },
    { to: "/library", label: "Library", icon: BookOpen, page: () => import("../../features/library/LibraryPage").then((m) => m.LibraryPage) },
    { to: "/planner", label: "Planner", icon: ListChecks, page: () => import("../../features/planner/PlannerPage").then((m) => m.PlannerPage) },
    { to: "/journal", label: "Journal", icon: NotebookPen, page: () => import("./journal/Page").then((m) => m.PregnancyJournal) },
    { to: "/toolkit", label: "Toolkit", icon: Wrench, page: () => import("./toolkit/Page").then((m) => m.PregnancyToolkit) },
  ],
};
