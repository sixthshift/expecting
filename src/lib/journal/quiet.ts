// The Journal while something has happened (`src/lib/quiet.ts`): what folds
// away, what a photo can be, who to talk to, and what the papers suggest.
// The quiet Journal's small rules, in one place; the Journal's own pages and
// parts never check for quiet themselves. See docs/product/journal.md, While
// something has happened.

import type { QuietKind } from "../quiet";
import { PHOTO_KINDS, type PhotoKind } from "./photos";
import type { Collection } from "./story/collections";
import type { StoryItem } from "./story/items";

/**
 * Folded away while something has happened, behind one quiet line: the
 * baby's movements, the sickness and cravings, the photos and the firsts.
 * The night it started too, and bingo. The notes, letters, feelings, papers and what was done stay.
 */
export function foldedWhileQuiet(item: StoryItem): boolean {
  return (
    item.kind === "movements" || item.kind === "appetite" || item.kind === "photo" || item.kind === "first" || item.kind === "night" || item.kind === "bingo"
  );
}

/** Folded away while something has happened, as their lines are in the story: not a collection then, even asked for by address. */
export const FOLDED_WHILE_QUIET: readonly Collection[] = ["movements", "appetite", "photos", "firsts"];

/** What a photo can be, as things stand: after a loss never a bump; with hard news, whose pregnancy goes on, anything. */
export function kindsOffered(quiet: QuietKind | null): readonly PhotoKind[] {
  return quiet === "loss" ? ["scan", "other"] : PHOTO_KINDS;
}

/** Where to read more on a rough day while something has happened, a loss or hard news: the loss services. */
export const QUIET_SUPPORT = "loss-support-services";

/**
 * The papers while something has happened. After a loss the form suggests
 * nothing pregnancy-forward: no topics (the list is the birth plan and the
 * morphology scan) and nothing handy by default, and the collection's lead
 * says what's kept then. With hard news, whose pregnancy goes on, as ever.
 */
export const QUIET_PAPERS: Record<QuietKind, { topics: boolean; handy: boolean; lead: string | null }> = {
  loss: { topics: false, handy: false, lead: "Results, letters, the papers from the hospital: photographed or saved as a PDF, kept for you both." },
  news: { topics: true, handy: true, lead: null },
};
