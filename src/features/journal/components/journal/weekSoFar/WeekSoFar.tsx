import { getRouteApi } from "@tanstack/react-router";
import { memo } from "react";
import { useFirsts } from "../../../../../api/rpc/firsts";
import { usePapers } from "../../../../../api/rpc/papers";
import { usePhotos } from "../../../../../api/rpc/photos";
import { useNow, useSettings } from "../../../../../api/rpc/settings";
import { contents, young } from "../../../../../lib/chapters";
import { alreadyHappened, aroundNow } from "../../../../../lib/firsts";
import { placesReady } from "../../../../../lib/places";
import { inWeek, storyGroups } from "../../../../../lib/story";
import { useJournalPage, useJournalSearch } from "../../../contexts/JournalPageContext";
import { KeepRow } from "../../KeepRow";
import { BookCover, BookLine } from "./BookCover";
import { Calls } from "./Calls";
import { AlreadyHappened, Places, WeekPage } from "./WeekPage";

const route = getRouteApi("/app/journal");

/**
 * The week so far, at the top of the Journal: a call to make, first; this
 * week's page (with the Keep row); the places Expecting has made ready; the
 * firsts that have already happened; and the book, already begun.
 * The firsts a Now card already asks about (the page's context) are left
 * out here; this week's days aren't drawn while the story is in a lens,
 * zoomed or searched.
 */
export const WeekSoFar = memo(function WeekSoFar() {
  const {
    items,
    lens,
    highlights: { suggested },
  } = useJournalPage();
  const { words } = useJournalSearch();
  const { zoom } = route.useSearch();
  const { data: settings } = useSettings();
  const { data: firsts } = useFirsts();
  const { data: photos } = usePhotos();
  const { data: papers } = usePapers();
  const now = useNow();
  const { dueDate } = settings;
  const knowing = settings.baby !== "unknown";

  const around = aroundNow({ now, marks: firsts, knowing, quiet: false }).filter((f) => !suggested.includes(f.key));
  const past = alreadyHappened({ now, marks: firsts, knowing, quiet: false });
  const places = placesReady({ now, photos, papers, dueDate, quiet: false });
  const chapters = contents({ items, dueDate, now });
  // The book, while the Journal is young (or there's no due date to write its weeks in), on the page; after, one line at the top.
  const book = !dueDate || young(items) ? "cover" : "line";
  // This week's days, unless the story is in a lens, zoomed or searched: then it draws them itself.
  const withDays = lens === "all" && !zoom && words.trim().length === 0;
  const days = withDays && now !== null && dueDate ? storyGroups(inWeek(items, now, dueDate), dueDate).flatMap((g) => (g.kind === "group" ? g.days : [])) : [];

  return (
    <>
      <Calls />
      {book === "line" ? <BookLine lines={chapters} /> : null}
      {now !== null && dueDate ? <WeekPage week={now} around={around} days={days} keep={<KeepRow />} /> : <KeepRow />}
      {now !== null ? <Places places={places} /> : null}
      {now !== null ? <AlreadyHappened firsts={past} week={now} /> : null}
      {book === "cover" ? <BookCover lines={chapters} /> : null}
    </>
  );
});
