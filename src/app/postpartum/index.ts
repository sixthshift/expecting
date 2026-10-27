import { BookOpen, ListChecks, NotebookPen, Sun, Wrench } from "lucide-react";
import type { PhaseApp } from "../../features/app/phaseApp";
import { PostpartumLayout } from "./Layout";

/**
 * The baby's here: the weeks stop being why you open the app. Home is this
 * week, and the Journal and Toolkit are the newborn's.
 */
export const postpartum: PhaseApp = {
  Layout: PostpartumLayout,
  pillars: [
    { to: "/", label: "This week", icon: Sun, page: () => import("./Home").then((m) => m.PostpartumHome) },
    { to: "/library", label: "Library", icon: BookOpen, page: () => import("../../features/library/LibraryPage").then((m) => m.LibraryPage) },
    { to: "/planner", label: "Planner", icon: ListChecks, page: () => import("../../features/planner/PlannerPage").then((m) => m.PlannerPage) },
    { to: "/journal", label: "Journal", icon: NotebookPen, page: () => import("./journal/Page").then((m) => m.PostpartumJournal) },
    { to: "/toolkit", label: "Toolkit", icon: Wrench, page: () => import("./toolkit/Page").then((m) => m.PostpartumToolkit) },
  ],
};
