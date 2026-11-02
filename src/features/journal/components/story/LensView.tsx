import { useSettingsQuery } from "../../../../api/rpc/settings";
import type { QuietKind } from "../../../../lib/quiet";
import { type StoryItem, type StoryLens, storyGroups } from "../../../../lib/story";
import { FirstsLens } from "./lenses/firsts/FirstsLens";
import { PhotosLens } from "./lenses/photos/PhotosLens";
import { StoryList } from "./Story";

/** One way to read the story: the notes and letters, the photos, or the firsts. `quiet`: what has happened, on the quiet Journal (null on the Journal). */
export function LensView({ lens, items, quiet }: { lens: Exclude<StoryLens, "all">; items: readonly StoryItem[]; quiet: QuietKind | null }) {
  const { data: settings } = useSettingsQuery();
  switch (lens) {
    case "notes":
      return (
        <section aria-labelledby="notes" className="flex flex-col gap-4">
          <h2 id="notes" className="font-display text-lg font-semibold text-fg-strong">
            Notes and letters
          </h2>
          <StoryList
            groups={storyGroups(
              items.filter((i) => i.kind === "note" || i.kind === "letter"),
              settings.dueDate
            )}
            label="Your notes"
            titled={!quiet}
          />
        </section>
      );
    case "photos":
      return <PhotosLens quiet={null} />;
    case "firsts":
      return <FirstsLens />;
  }
}
