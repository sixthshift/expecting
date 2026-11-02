// The ways to look at the story, one at a time: in days (all of it), zoomed
// out to weeks or the whole pregnancy, or one kind of thing kept. Each is
// `?view=` on /journal; days is the default and has no `?view=`.

import { foldedWhileQuiet, type StoryItem } from "./items";
import { KEPT_KIND_LABEL, type KeptKind, keptKindOf } from "./kinds";

export const STORY_VIEWS = ["days", "weeks", "pregnancy", "notes", "photos", "firsts"] as const;
export type StoryView = (typeof STORY_VIEWS)[number];

/** The views that are one kind of thing kept. The other kinds are records (`src/lib/records.ts`). */
export type KindView = Extract<StoryView, KeptKind>;
const KIND_VIEWS: readonly KindView[] = ["notes", "photos", "firsts"];

export const VIEW_LABEL: Record<StoryView, string> = {
  days: "Days",
  weeks: "Weeks",
  pregnancy: "Whole pregnancy",
  notes: KEPT_KIND_LABEL.notes,
  photos: KEPT_KIND_LABEL.photos,
  firsts: KEPT_KIND_LABEL.firsts,
};

export function isKindView(view: StoryView): view is KindView {
  return (KIND_VIEWS as readonly StoryView[]).includes(view);
}

/**
 * The views there's something for, in their fixed order: days always; weeks
 * and the whole pregnancy with a due date to count them from (`zoomable`);
 * a kind once something of it is kept (while something has happened, not
 * the folded kinds).
 */
export function viewsKept(items: readonly StoryItem[], { quiet, zoomable }: { quiet: boolean; zoomable: boolean }): StoryView[] {
  const kept = new Set(items.filter((i) => !(quiet && foldedWhileQuiet(i))).map(keptKindOf));
  return STORY_VIEWS.filter((v) => v === "days" || (v === "weeks" || v === "pregnancy" ? zoomable : kept.has(v)));
}
