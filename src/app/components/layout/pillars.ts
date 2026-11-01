import { Archive, BookOpen, ListChecks, NotebookPen, Sun } from "lucide-react";
import type { Pillar } from "./PillarLayout";

/**
 * Expecting's pillars, in navigation order, home first. This week is where
 * you are and what matters now, with the whole pregnancy a tap away (the map,
 * /timeline); the Library explains, the Planner asks of you (and draws it
 * across the weeks), the Journal keeps. The Drawer holds the handy things,
 * for when their moment comes. The week is the thread through them all.
 */
export const PILLARS: readonly Pillar[] = [
  { to: "/", label: "This week", icon: Sun },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/planner", label: "Planner", icon: ListChecks },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/drawer", label: "Drawer", icon: Archive },
];
