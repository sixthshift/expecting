import { useQuiet } from "../../../../../api/rpc/quiet";
import { useSettings } from "../../../../../api/rpc/settings";
import { type Lens, type StoryItem, storyGroups } from "../../../../../lib/story";
import { FeelingsLens } from "../../../../feelings/components/history/Feelings";
import { StoryList } from "../Story";
import { AppetiteLens } from "./lenses/appetite/AppetiteLens";
import { FirstsLens } from "./lenses/firsts/FirstsLens";
import { MovementsLens } from "./lenses/movements/MovementsLens";
import { PapersLens } from "./lenses/papers/PapersLens";
import { PhotosLens } from "./lenses/photos/PhotosLens";

/** One kind, at full size: its pattern, its tools, then each. */
export function LensView({ lens, items }: { lens: Exclude<Lens, "all">; items: readonly StoryItem[] }) {
  const { data: quiet } = useQuiet();
  const { data: settings } = useSettings();
  switch (lens) {
    case "notes":
      return (
        <section aria-labelledby="notes" className="flex max-w-2xl flex-col gap-4">
          <h2 id="notes" className="font-display text-lg font-semibold text-fg-strong">
            Notes and letters
          </h2>
          <StoryList
            groups={storyGroups(
              items.filter((i) => i.kind === "note" || i.kind === "letter"),
              settings.dueDate
            )}
            label="Your notes"
          />
        </section>
      );
    case "movements":
      return <MovementsLens />;
    case "appetite":
      return <AppetiteLens />;
    case "photos":
      return <PhotosLens quiet={null} />;
    case "feelings":
      return <FeelingsLens />;
    case "papers":
      return <PapersLens quiet={quiet?.kind ?? null} />;
    case "firsts":
      return <FirstsLens />;
  }
}
