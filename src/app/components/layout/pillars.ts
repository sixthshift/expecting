import { Archive, BookOpen, CalendarRange, ListChecks, NotebookPen, Sun } from "lucide-react";
import type { Pillar } from "./PillarLayout";

/**
 * Expecting's pillars, in navigation order, home first. This week is where
 * you are and what matters now; the timeline is the whole pregnancy at a
 * glance, the thread through the rest: what the Library explains, the Planner
 * asks of you and the Journal keeps all meet on their week. The Drawer holds
 * the handy things, for when their moment comes.
 */
export const PILLARS: readonly Pillar[] = [
  { to: "/", label: "This week", icon: Sun },
  { to: "/timeline", label: "Timeline", icon: CalendarRange },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/planner", label: "Planner", icon: ListChecks },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/drawer", label: "Drawer", icon: Archive },
];
