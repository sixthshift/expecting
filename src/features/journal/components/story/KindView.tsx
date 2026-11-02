import { useSettingsQuery } from "../../../../api/rpc/settings";
import type { QuietKind } from "../../../../lib/quiet";
import type { StoryItem } from "../../../../lib/story/items";
import { storyGroups } from "../../../../lib/story/spine";
import type { KindView as Kind } from "../../../../lib/story/views";
import { StoryList } from "./Story";
import { FirstsView } from "./views/firsts/FirstsView";
import { PhotosView } from "./views/photos/PhotosView";

/** The story as one kind: the notes and letters, the photos, or the firsts. `quiet`: what has happened, on the quiet Journal (null on the Journal). */
export function KindView({ kind, items, quiet }: { kind: Kind; items: readonly StoryItem[]; quiet: QuietKind | null }) {
  const { data: settings } = useSettingsQuery();
  switch (kind) {
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
      return <PhotosView quiet={quiet} />;
    case "firsts":
      return <FirstsView />;
  }
}
