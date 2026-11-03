import { useSettingsQuery } from "../../../../../../api/rpc/settings";
import { useQuietKind } from "../../../../../../app/features/quiet/hooks/useQuietKind";
import { storyGroups } from "../../../../../../lib/journal/story/spine";
import { StoryList } from "../../../../components/lines/StoryList";
import { useJournalPage } from "../../../../contexts/JournalPageContext";

/** The notes and letters, all of them, under their weeks: without the weeks' titles while something has happened (they're about the baby). */
export function NotesCollection() {
  const { items } = useJournalPage();
  const quiet = useQuietKind();
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  return (
    <section aria-labelledby="notes" className="flex flex-col gap-4">
      <h2 id="notes" className="font-display text-lg font-semibold text-fg-strong">
        Notes and letters
      </h2>
      <StoryList
        groups={storyGroups(
          items.filter((i) => i.kind === "note" || i.kind === "letter"),
          dueDate
        )}
        label="Your notes"
        titled={!quiet}
      />
    </section>
  );
}
