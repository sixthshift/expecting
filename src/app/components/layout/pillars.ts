import { Archive, BookOpen, House, ListChecks, NotebookPen } from "lucide-react";
import type { Pillar } from "./AppLayout";

/**
 * Expecting's pillars, in their one order, a row on both layouts: the phone's
 * tab bar under the thumb and the desktop's top bar. From the middle out:
 * Home in the middle, where the eye and the thumb land; behind it on the
 * left the Journal, ahead on the right the Planner (past, now, future, the
 * way the weeks run on the strip; and the right is the easier side for most
 * thumbs, so it's the Planner's); the Library and the Drawer at the edges.
 * The same five in the same places on every phone and computer.
 */
export const PILLARS: readonly Pillar[] = [
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/", label: "Home", icon: House },
  { to: "/planner", label: "Planner", icon: ListChecks },
  { to: "/drawer", label: "Drawer", icon: Archive },
];
