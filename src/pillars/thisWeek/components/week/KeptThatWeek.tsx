import { useJournalQuery } from "../../../../api/rpc/journal";
import { entriesIn } from "../../../../lib/journal/journal";
import { Movement } from "../../../journal/features/movements/components/Movement";
import { Note } from "../../../journal/features/notes/components/Note";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";

/** A peek's notes and movements, kept on that week's days. This week's stay in the Journal. */
export function KeptThatWeek() {
  const { week, peeking, dueDate } = useThisWeekPage();
  const { data: journal } = useJournalQuery();
  const kept = peeking && week !== null ? entriesIn(journal, week, dueDate) : [];
  if (kept.length === 0) return null;
  return (
    <section aria-labelledby="kept" className="flex flex-col gap-2">
      <h2 id="kept" className="text-lg font-display font-semibold text-fg-strong">
        Kept that week
      </h2>
      {kept.map((entry) => (entry.kind === "movement" ? <Movement key={entry.id} entry={entry} /> : <Note key={entry.id} entry={entry} />))}
    </section>
  );
}
