import { useAppetiteQuery } from "../../../api/rpc/appetite";
import { useFeelingsQuery } from "../../../api/rpc/feelings";
import { useFirstsQuery } from "../../../api/rpc/firsts";
import { useJournalQuery } from "../../../api/rpc/journal";
import { usePapersQuery } from "../../../api/rpc/papers";
import { usePeopleQuery } from "../../../api/rpc/people";
import { usePhotosQuery } from "../../../api/rpc/photos";
import { useSettingsQuery } from "../../../api/rpc/settings";
import { todayISO } from "../../../lib/dates";
import { FOLDED_WHILE_QUIET } from "../../../lib/journal/quiet";
import type { Collection } from "../../../lib/journal/story/collections";
import { cravingsSummary } from "../../../lib/journal/summaries/cravings";
import { feelingsSummary } from "../../../lib/journal/summaries/feelings";
import { firstsSummary } from "../../../lib/journal/summaries/firsts";
import { movementsSummary } from "../../../lib/journal/summaries/movements";
import { notesSummary } from "../../../lib/journal/summaries/notes";
import { papersSummary } from "../../../lib/journal/summaries/papers";
import { photosSummary } from "../../../lib/journal/summaries/photos";
import { sicknessSummary } from "../../../lib/journal/summaries/sickness";
import type { Summary } from "../../../lib/journal/summaries/summary";
import { useJournalPage } from "../contexts/JournalPageContext";

/** A card on the page: what it's called, the collection it opens, the way to all of it, and whether it goes in the text for an appointment. */
export type Shown = { key: string; title: string; collection: Collection; more: string; summary: Summary; forAppointments: boolean };

/** What each card is, in the order they're shown: the ones an appointment asks about first. */
export function useCollectionCards(): Shown[] {
  const { quiet } = useJournalPage();
  const { data: journal } = useJournalQuery();
  const { data: appetite } = useAppetiteQuery();
  const { data: feelings } = useFeelingsQuery();
  const { data: papers } = usePapersQuery();
  const { data: photos } = usePhotosQuery();
  const { data: firsts } = useFirstsQuery();
  const { data: people } = usePeopleQuery();
  const { data: settings } = useSettingsQuery();
  const today = todayISO();
  const { dueDate } = settings;
  const card = (key: string, title: string, collection: Collection, more: string, summary: Summary | null, forAppointments: boolean): Shown | null =>
    summary && !(quiet && FOLDED_WHILE_QUIET.includes(collection)) ? { key, title, collection, more, summary, forAppointments } : null;
  return [
    card("movements", "Movements", "movements", "Every movement", movementsSummary(journal, today, dueDate), true),
    card("sickness", "Sickness", "appetite", "Every one kept", sicknessSummary(appetite, today, dueDate), true),
    card("cravings", "Cravings", "appetite", "Every one kept", cravingsSummary(appetite, today), true),
    card("feelings", "Feelings", "feelings", "Every check-in", feelingsSummary(feelings, people.people, people.me?.id ?? null, today), true),
    card("papers", "Papers", "papers", "Every paper", papersSummary(papers, today, dueDate), false),
    card("notes", "Notes & letters", "notes", "Every note", notesSummary(journal, today, dueDate), false),
    card("photos", "Photos", "photos", "Every photo", photosSummary(photos, today, dueDate), false),
    card("firsts", "Firsts", "firsts", "Every first", firstsSummary(firsts, settings.baby !== "unknown", today, dueDate), false),
  ].filter((s): s is Shown => s !== null);
}
