import { useSettingsQuery } from "../../../../api/rpc/settings";
import { storyGroups } from "../../../../lib/journal/story/spine";
import { StoryList } from "../../components/lines/StoryList";
import { StoryViews } from "../../components/story/StoryViews";
import { PregnancyView } from "../../components/story/views/pregnancy/PregnancyView";
import { useQuietJournalPage } from "../contexts/QuietJournalPageContext";

/**
 * The quiet Journal's story: what stays (the notes, letters, feelings,
 * papers and what was done), newest first under the weeks that have
 * something in them, with no week's title (they're about the baby);
 * looked at the same ways as the Journal's, and searched; by what it is, the collections. No firsts on the
 * pregnancy's line, no recaps and no book.
 */
export function QuietStory() {
  const { shown } = useQuietJournalPage();
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });

  return (
    <>
      <h2 className="font-display text-xl font-semibold text-fg-strong">The story so far</h2>
      <StoryViews
        items={shown}
        titled={false}
        className="flex flex-col gap-4"
        pregnancy={<PregnancyView items={shown} withFirsts={false} />}
        days={<StoryList groups={storyGroups(shown, dueDate)} titled={false} />}
      />
    </>
  );
}
