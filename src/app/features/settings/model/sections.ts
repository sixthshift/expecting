// Settings' sections, each a page of its own (`/settings/<section>`): the
// question groups (GROUPS), then the extras, something has happened, Claude,
// and this phone's appearance and your account. A desktop has them down the
// rail, a phone as tabs. Pure, so tested apart from the screen.

import { ASKS, GROUPS, type Group } from "./facts";

export const SECTIONS = {
  ...GROUPS,
  extras: "Extras",
  quiet: "Something has happened",
  claude: "Claude",
  appearance: "Appearance",
  account: "Account",
} as const;

export type SettingsSection = keyof typeof SECTIONS;

/** The sections in their order. */
export const SECTION_ORDER = Object.keys(SECTIONS) as SettingsSection[];

export function isSection(name: string): name is SettingsSection {
  return Object.hasOwn(SECTIONS, name);
}

export function isGroup(section: SettingsSection): section is Group {
  return Object.hasOwn(GROUPS, section);
}

/**
 * The section an `?ask=` opens on: a question's group, the due date and the
 * colours with the pregnancy, an extra (`extra:babymoon`) with the extras,
 * `quiet` with something has happened; anything else, the first.
 */
export function sectionOf(ask: string | undefined): SettingsSection {
  if (!ask || ask === "dueDate" || ask === "baby") return "pregnancy";
  if (ask.startsWith("extra:")) return "extras";
  if (ask === "quiet") return "quiet";
  return ASKS.find((a) => a.key === ask)?.question.group ?? "pregnancy";
}
