import { BookOpen, ListChecks, Sprout } from "lucide-react";
import type { StageApp } from "../stageApp";
import { PreconceptionShell } from "./Shell";

/**
 * Getting ready: no weeks to follow yet, so no timeline, and nothing to keep
 * or time. What to do before a pregnancy, the Library, and the Planner.
 */
export const preconception: StageApp = {
  Shell: PreconceptionShell,
  pillars: [
    { to: "/", label: "Getting ready", icon: Sprout, page: () => import("./Home").then((m) => m.PreconceptionHome) },
    { to: "/library", label: "Library", icon: BookOpen, page: () => import("../../features/library/LibraryPage").then((m) => m.LibraryPage) },
    { to: "/planner", label: "Planner", icon: ListChecks, page: () => import("../../features/planner/PlannerPage").then((m) => m.PlannerPage) },
  ],
};
