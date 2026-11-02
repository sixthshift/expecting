// The ways to look at the story, one at a time, all by time: in days (all of
// it), or zoomed out to weeks or the whole pregnancy, with a due date to
// count them from. Each is `?view=` on /journal; days is the default and has
// no `?view=`. What's kept by sort is the collections (`collections.ts`).

export const STORY_VIEWS = ["days", "weeks", "pregnancy"] as const;
export type StoryView = (typeof STORY_VIEWS)[number];

export const VIEW_LABEL: Record<StoryView, string> = { days: "Days", weeks: "Weeks", pregnancy: "Whole pregnancy" };

/** The views there are: days always; weeks and the whole pregnancy only with a due date (`zoomable`). */
export function viewsOffered(zoomable: boolean): StoryView[] {
  return zoomable ? [...STORY_VIEWS] : ["days"];
}
