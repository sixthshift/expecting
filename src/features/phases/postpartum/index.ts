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
    { to: "/postpartum", label: "This week", icon: Sun },
    { to: "/postpartum/library", label: "Library", icon: BookOpen },
    { to: "/postpartum/planner", label: "Planner", icon: ListChecks },
    { to: "/postpartum/journal", label: "Journal", icon: NotebookPen },
    { to: "/postpartum/toolkit", label: "Toolkit", icon: Wrench },
  ],
};
