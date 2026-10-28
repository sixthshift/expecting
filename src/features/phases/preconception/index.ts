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
    { to: "/preconception", label: "Getting ready", icon: Sprout },
    { to: "/preconception/library", label: "Library", icon: BookOpen },
    { to: "/preconception/planner", label: "Planner", icon: ListChecks },
  ],
};
