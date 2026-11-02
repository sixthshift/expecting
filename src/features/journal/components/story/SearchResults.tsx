import { useSettingsQuery } from "../../../../api/rpc/settings";
import type { StoryItem } from "../../../../lib/story/items";
import { storyGroups } from "../../../../lib/story/spine";
import { StoryList } from "../lines/StoryList";

/** What a search found, under its weeks, or that nothing has those words. `titled` false leaves out the weeks' titles (the quiet Journal). */
export function SearchResults({ found, titled = true }: { found: readonly StoryItem[]; titled?: boolean }) {
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  return (
    <div className="flex flex-col gap-4">
      {found.length === 0 ? <p className="text-fg-subtle">Nothing kept has those words.</p> : null}
      <StoryList groups={storyGroups(found, dueDate)} titled={titled} />
    </div>
  );
}
