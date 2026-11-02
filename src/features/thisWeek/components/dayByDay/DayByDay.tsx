import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import type { DayRead } from "../../../../content/days";
import type { Item } from "../../../../content/schema";
import type { WeekNote as Note } from "../../../../content/weeks";
import { gestationLabel, type Week } from "../../../../lib/timeline";
import { ItemBody } from "../../../library/components/content/ItemBody";
import { ItemLink } from "../../../library/components/ItemLink";
import { WeekNote } from "../../../weeks/components/weekNote/WeekNote";

/** A day of the week: the note on its first (+0), a read on each after. */
type Day = { day: number; note: Note; read?: never } | { day: number; read: DayRead; note?: never };

/**
 * The week, day by day: the week's note is its first day (+0), and a read
 * follows it each day after, out a day at a time (`readsOut`). One card at a
 * time so the page stays as short, as tall as the card showing. It opens on
 * the newest, today's, the days missed a swipe (or an arrow) back; a week
 * peeked at opens on its first day, the note, and reads forward. Each
 * read ends in the entries it opens onto, as you'd find them in the Library.
 */
export function DayByDay({
  week,
  note,
  reads,
  items,
  today,
  showSize = false,
}: {
  week: Week;
  /** The note read on the week's first day, or none (a peek at a week without its own). */
  note: Note | null;
  /** Oldest first. */
  reads: readonly DayRead[];
  /** The Library as tailored for you: a link to an entry you'd not see is left off. */
  items: readonly Item[];
  /** Today's day of the week, 0–6, or null when it isn't this week. */
  today: number | null;
  /** The note says the baby's size: off where the heading already does. */
  showSize?: boolean;
}) {
  const days: Day[] = [...(note ? [{ day: 0, note }] : []), ...reads.map((read) => ({ day: read.day, read }))];
  const track = useRef<HTMLDivElement>(null);
  // This week opens on today's; another week on its first day.
  const [at, setAt] = useState(today === null ? 0 : days.length - 1);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const titles = new Map(items.map((i) => [i.id, i.title]));

  // Open there without the smooth scroll a reader would see.
  const opening = useRef(at);
  useLayoutEffect(() => {
    const el = track.current;
    if (el) el.scrollLeft = opening.current === 0 ? 0 : el.scrollWidth;
  }, []);

  // The track is as tall as the card showing, not the tallest: the note is longer than a day's read.
  useLayoutEffect(() => {
    const slide = track.current?.children[at];
    if (!(slide instanceof HTMLElement)) return;
    const measure = () => setHeight(slide.offsetHeight);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(slide);
    return () => observer.disconnect();
  }, [at]);

  const go = (index: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = track.current;
    if (el && el.clientWidth > 0) setAt(Math.round(el.scrollLeft / el.clientWidth));
  };

  const when = (day: number) => {
    // A note carried on from an earlier week (none of this week's own) is named for its week.
    const label = day === 0 && note && note.week !== week ? `Week ${note.week}` : gestationLabel(week * 7 + day);
    if (today === null) return label;
    if (day === today) return `${label} · Today`;
    if (day === today - 1) return `${label} · Yesterday`;
    return label;
  };

  if (days.length === 0) return null;
  return (
    <section aria-labelledby="day-by-day" aria-roledescription="carousel" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 id="day-by-day" className="flex items-center gap-2 text-sm font-medium text-fg-subtle">
          <BookOpen aria-hidden size={16} className="text-fg-brand" />
          Week {week}, day by day
        </h2>
        {days.length > 1 ? (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" iconOnly aria-label="The day before" disabled={at <= 0} onClick={() => go(at - 1)}>
              <ChevronLeft aria-hidden size={16} />
            </Button>
            <Button variant="ghost" size="sm" iconOnly aria-label="The day after" disabled={at >= days.length - 1} onClick={() => go(at + 1)}>
              <ChevronRight aria-hidden size={16} />
            </Button>
          </div>
        ) : null}
      </div>
      <div
        ref={track}
        onScroll={onScroll}
        style={{ height }}
        className="-mx-1 flex items-start snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain transition-[height] duration-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map((d, i) => (
          <section
            key={d.day}
            aria-roledescription="slide"
            aria-label={`${when(d.day)}, ${i + 1} of ${days.length}`}
            aria-hidden={i !== at}
            inert={i !== at}
            className="flex w-full shrink-0 snap-center px-1"
          >
            <div className="w-full">
              {d.note ? <WeekNote note={d.note} showSize={showSize} eyebrow={when(d.day)} /> : <Read read={d.read} label={when(d.day)} titles={titles} />}
            </div>
          </section>
        ))}
      </div>
      {days.length > 1 ? (
        <div className="flex justify-center gap-1.5" aria-hidden>
          {days.map((d, i) => (
            <button
              key={d.day}
              type="button"
              tabIndex={-1}
              onClick={() => go(i)}
              className={`size-2 rounded-full ${i === at ? "bg-fg-brand" : "bg-bg-subtle"}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Read({ read, label, titles }: { read: DayRead; label: string; titles: ReadonlyMap<string, string> }) {
  const links = read.read.filter((id) => titles.has(id));
  return (
    <Card className="w-full">
      <article className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-widest text-fg-subtle uppercase">{label}</span>
        <h3 className="text-lg leading-snug font-display font-semibold text-fg-strong">{read.title}</h3>
        <ItemBody doc={read.body} className="max-w-prose" />
        {links.length > 0 ? (
          <p className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-sm">
            {links.map((id) => (
              <ItemLink key={id} itemId={id} className="font-medium text-fg-brand underline">
                {titles.get(id)}
              </ItemLink>
            ))}
          </p>
        ) : null}
      </article>
    </Card>
  );
}
