import { BookOpen, ListChecks, NotebookPen, Sun, Wrench } from "lucide-react";
import { Frame, type Pillar } from "../../shell/Frame";

/**
 * The baby's here: the weeks stop being why you open the app. Home is this
 * week, and the Toolkit is the newborn's.
 */
export const PILLARS: readonly Pillar[] = [
  { to: "/", label: "This week", icon: Sun },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/planner", label: "Planner", icon: ListChecks },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/toolkit", label: "Toolkit", icon: Wrench },
];

export function PostpartumShell() {
  return <Frame pillars={PILLARS} />;
}
