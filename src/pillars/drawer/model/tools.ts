// The Drawer's tools, each said once: where it is, its name and what it is,
// the extras that bring it, what's put away while something has happened, and
// what it says in the Drawer while it's off. Its page (`DrawerTool`), its
// route's quiet world (`toolPutAway`) and its tile (`DrawerPage`) read it.

import type { ExtraId } from "../../../app/features/settings/model/extras";
import { VIEW_KEYS, VIEWS } from "../../../lib/drawer/circle";

export type Tool = {
  to: "/drawer/names" | "/drawer/people" | "/drawer/jobs" | "/drawer/bingo";
  title: string;
  /** What it is, under its name. Who does what's names the other of you, so it's its own (`JobsLead`). */
  lead?: string;
  width: "2xl" | "3xl";
  /** The extras that bring it: any one on, and it's there. */
  extras: readonly ExtraId[];
  /** What's put away while something has happened, as the sentence starts ("The names"), and whether it's plural. */
  away: { subject: string; are?: boolean };
  /** What it is, in the Drawer while it's off, after its name. */
  off: string;
};

/** The tools, in the Drawer's order. */
export const TOOLS = {
  names: {
    to: "/drawer/names",
    title: "Baby names",
    width: "3xl",
    extras: ["choosing-names"],
    away: { subject: "The names", are: true },
    off: "swipe through names on your own phones; a name is a match only when you both like it.",
  },
  people: {
    to: "/drawer/people",
    title: "Your people",
    lead: "The people around you two, and what each of them is doing. Only you two see it.",
    width: "3xl",
    // One for each of its views, in order.
    extras: VIEW_KEYS.map((v) => VIEWS[v].extra),
    away: { subject: "Your people", are: true },
    off: "who visits, who hears first, who helps, and who gave what, kept by you both.",
  },
  jobs: {
    to: "/drawer/jobs",
    title: "Who does what",
    width: "3xl",
    extras: ["who-does-what"],
    away: { subject: "Who does what" },
    off: "each of you says who'll do each newborn job, then you see where you agree.",
  },
  bingo: {
    to: "/drawer/bingo",
    title: "Pregnancy bingo",
    lead: "Mark a square when it happens. Five in a row, a column or a diagonal is bingo; the centre's free.",
    width: "2xl",
    extras: ["pregnancy-bingo"],
    away: { subject: "Bingo" },
    off: "a card each of the things people say and do, first to a line wins.",
  },
} as const satisfies Record<string, Tool>;

export type ToolId = keyof typeof TOOLS;

/** A tool's route's quiet world, for `putAway`: its page's top as it is, back to the Drawer. */
export function toolPutAway(tool: Tool) {
  return { ...tool.away, back: { to: "/drawer", label: "The Drawer" }, title: tool.title, lead: tool.lead, width: tool.width };
}
