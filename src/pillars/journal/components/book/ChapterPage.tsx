import type { Chapter } from "../../../../lib/journal/chapters";
import { hasRecap, recapParts } from "../../../../lib/journal/recap";
import type { StoryItem } from "../../../../lib/journal/story/items";
import type { Week } from "../../../../lib/timeline";
import { RECAP_PART_TITLE, RecapPartView, useRecap } from "./Recap";
import { WeeksWritten } from "./WeeksWritten";

/** A part's title in the book: the recap's, the firsts and the scans said shorter. */
const PART_TITLE = { ...RECAP_PART_TITLE, firsts: "Firsts", scans: "Scans" };

/** A chapter: its weeks so far, written, then what you kept in them, each part only when it has something. */
export function ChapterPage({ chapter, items, now }: { chapter: Chapter; items: readonly StoryItem[]; now: Week | null }) {
  const weeks = chapter.weeks ?? [1, 1];
  const recap = useRecap({ key: chapter.key, title: chapter.title, from: weeks[0], to: weeks[1] }, items);
  const reached = chapter.weeks !== null && now !== null && now >= weeks[0];
  return (
    <section aria-labelledby={`chapter-${chapter.key}`} className="flex break-inside-avoid-page flex-col gap-5">
      <h2 id={`chapter-${chapter.key}`} className="font-display text-2xl font-semibold text-fg-strong">
        {chapter.title}
      </h2>
      {chapter.weeks === null ? (
        <p className="text-fg-subtle">This chapter comes with the birth.</p>
      ) : !reached ? (
        <p className="text-fg-subtle">Still to come: {`weeks ${weeks[0]}–${weeks[1]}`}.</p>
      ) : (
        <>
          <WeeksWritten from={weeks[0]} to={Math.min(weeks[1], now ?? weeks[1])} />
          {recap && hasRecap(recap)
            ? recapParts(recap).map((part) => (
                <section key={part} aria-label={PART_TITLE[part]} className="flex break-inside-avoid flex-col gap-3">
                  <h3 className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">{PART_TITLE[part]}</h3>
                  {/* The flipbook prints as its last frame. */}
                  <RecapPartView recap={recap} part={part} />
                </section>
              ))
            : null}
        </>
      )}
    </section>
  );
}
