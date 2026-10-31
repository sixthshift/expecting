import { useFirsts } from "../../../../../api/rpc/firsts";
import { usePapers } from "../../../../../api/rpc/papers";
import { usePhotos } from "../../../../../api/rpc/photos";
import { useQuiet } from "../../../../../api/rpc/quiet";
import { useNow, useSettings } from "../../../../../api/rpc/settings";
import { contents, young } from "../../../../../lib/chapters";
import { alreadyHappened, aroundNow } from "../../../../../lib/firsts";
import { placesReady } from "../../../../../lib/places";
import { inWeek, storyGroups } from "../../../../../lib/story";
import { useStory } from "../../../hooks/useStory";
import { BookCover, BookLine } from "./BookCover";
import { Calls } from "./Calls";
import { KeepRow } from "./KeepRow";
import { AlreadyHappened, Places, WeekPage } from "./WeekPage";

/**
 * The week so far, at the top of the Journal: a call to make, first; this
 * week's page (with the Keep row); the places Expecting has made ready; the
 * firsts that have already happened; and the book, already begun.
 * `suggested` are the firsts a Now card already asks about; `withDays` is
 * false while the story is in a lens, zoomed or searched, when this week's
 * days aren't drawn here.
 */
export function WeekSoFar({ suggested, withDays }: { suggested: ReadonlySet<string>; withDays: boolean }) {
  const items = useStory();
  const { data: quiet } = useQuiet();
  const { data: settings } = useSettings();
  const { data: firsts } = useFirsts();
  const { data: photos } = usePhotos();
  const { data: papers } = usePapers();
  const now = useNow();
  const isQuiet = Boolean(quiet);
  const { dueDate } = settings;
  const knowing = settings.baby !== "unknown";

  const around = aroundNow({ now, marks: firsts, knowing, quiet: isQuiet }).filter((f) => !suggested.has(f.key));
  const past = alreadyHappened({ now, marks: firsts, knowing, quiet: isQuiet });
  const places = placesReady({ now, photos, papers, dueDate, quiet: isQuiet });
  const chapters = contents({ items, dueDate, now });
  // The book, while the Journal is young (or there's no due date to write its weeks in), on the page; after, one line at the top. Nothing of it while something has happened.
  const book = isQuiet ? null : !dueDate || young(items) ? "cover" : "line";
  const days = withDays && now !== null && dueDate ? storyGroups(inWeek(items, now, dueDate), dueDate).flatMap((g) => (g.kind === "group" ? g.days : [])) : [];

  return (
    <>
      <Calls />
      {book === "line" ? <BookLine lines={chapters} /> : null}
      {/* While something has happened, no week counted and nothing about the baby: the story, as kept. */}
      {now !== null && dueDate && !isQuiet ? <WeekPage week={now} quiet={isQuiet} around={around} days={days} keep={<KeepRow />} /> : <KeepRow />}
      {now !== null ? <Places places={places} /> : null}
      {now !== null ? <AlreadyHappened firsts={past} week={now} /> : null}
      {book === "cover" ? <BookCover lines={chapters} /> : null}
    </>
  );
}
