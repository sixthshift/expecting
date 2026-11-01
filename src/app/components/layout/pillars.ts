import { Archive, BookOpen, ListChecks, NotebookPen, Sun } from "lucide-react";
import type { AppPath } from "../../model/paths";
import type { Pillar } from "./PillarLayout";

/**
 * Expecting's pillars, in the sidebar's order: read top to bottom, by weight.
 * Three are your pregnancy in time: This week is now and home, the Planner
 * what's ahead (what Expecting asks of you, so it comes next), the Journal
 * what's behind. Then the Library, what Expecting knows, mostly reached
 * through links from the others; then the Drawer, the handy things for when
 * their moment comes.
 */
export const PILLARS: readonly Pillar[] = [
  { to: "/", label: "This week", icon: Sun },
  { to: "/planner", label: "Planner", icon: ListChecks },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/drawer", label: "Drawer", icon: Archive },
];

/**
 * The phone's tab bar, the same pillars from the middle out, where a thumb
 * reaches best: This week in the middle, behind it on the left the Journal,
 * ahead on the right the Planner (past, now, future, the way the weeks run on
 * the strip; and the right is the easier side for most thumbs, so it's the
 * Planner's), the Library and the Drawer at the edges.
 */
const TAB_ORDER: readonly AppPath[] = ["/library", "/journal", "/", "/planner", "/drawer"];

export const TABS: readonly Pillar[] = TAB_ORDER.map((to) => {
  const pillar = PILLARS.find((p) => p.to === to);
  if (!pillar) throw new Error(`No pillar at ${to}`);
  return pillar;
});
