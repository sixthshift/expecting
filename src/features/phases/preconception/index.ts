import { BookOpen, ListChecks, Sprout } from "lucide-react";
import type { PhaseApp } from "../../app/phaseApp";
import { PreconceptionLayout } from "./Layout";

/**
 * Getting ready: no weeks to follow yet, so no timeline, and nothing to keep
 * or time. What to do before a pregnancy, the Library, and the Planner.
 */
export const preconception: PhaseApp = {
  Layout: PreconceptionLayout,
  timeline: false,
  planner: { grouping: "getting-ready", earlier: "slip", questionsFor: "For your GP" },
  library: { lead: "Getting ready", first: [], earlier: "keep", search: "Search the library" },
  pillars: [
    { to: "/", label: "Getting ready", icon: Sprout, page: () => import("./Home").then((m) => m.PreconceptionHome) },
    { to: "/library", label: "Library", icon: BookOpen, page: () => import("../../library/LibraryPage").then((m) => m.LibraryPage) },
    { to: "/planner", label: "Planner", icon: ListChecks, page: () => import("../../planner/PlannerPage").then((m) => m.PlannerPage) },
  ],
};
