import { BookOpen, ListChecks, NotebookPen, Sun, Wrench } from "lucide-react";
import type { PhaseApp } from "../../app/phaseApp";
import { PostpartumLayout } from "./Layout";

/**
 * The baby's here: the weeks stop being why you open the app. Home is this
 * week, and the Journal and Toolkit are the newborn's.
 */
export const postpartum: PhaseApp = {
  Layout: PostpartumLayout,
  timeline: false,
  planner: { grouping: "weeks", earlier: "leave-behind", behind: "From the pregnancy", questionsFor: "For the next check-up" },
  // At 3 am it's the baby, and a question: the newborn's topics first, the pregnancy's reading put away.
  library: {
    first: ["baby", "after-the-birth", "appointments", "paperwork"],
    earlier: "leave-behind",
    behind: "From the pregnancy",
    search: "Is this normal? Search the library",
  },
  pillars: [
    { to: "/", label: "This week", icon: Sun, page: () => import("./Home").then((m) => m.PostpartumHome) },
    { to: "/library", label: "Library", icon: BookOpen, page: () => import("../../library/LibraryPage").then((m) => m.LibraryPage) },
    { to: "/planner", label: "Planner", icon: ListChecks, page: () => import("../../planner/PlannerPage").then((m) => m.PlannerPage) },
    { to: "/journal", label: "Journal", icon: NotebookPen, page: () => import("./journal/Page").then((m) => m.PostpartumJournal) },
    { to: "/toolkit", label: "Toolkit", icon: Wrench, page: () => import("./toolkit/Page").then((m) => m.PostpartumToolkit) },
  ],
};
