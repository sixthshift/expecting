import { Button } from "@sixthshift/design-system/button";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { useWeekDays } from "../../hooks/useWeekDays";
import { WeekNote } from "../weekNote/WeekNote";
import { Read } from "./Read";

/**
 * The week, day by day: the week's note is its first day (+0), and a read
 * follows it each day after, out a day at a time (`readsOut`). One card at a
 * time so the page stays as short, as tall as the card showing. It opens on
 * the newest, today's, the days missed a swipe (or an arrow) back; a week
 * peeked at opens on its first day, the note, and reads forward. Each
 * read ends in the entries it opens onto, as you'd find them in the Library.
 * The days are `useWeekDays`'; a desktop draws them as tabs (`DayTabs`).
 */
export function DayByDay() {
  const { week, days, opening: first, showSize, titles, when } = useWeekDays();
  const track = useRef<HTMLDivElement>(null);
  // This week opens on today's; another week on its first day.
  const [at, setAt] = useState(first);
  const [height, setHeight] = useState<number | undefined>(undefined);

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

  if (week === null || days.length === 0) return null;

  return (
    <section aria-labelledby="day-by-day" aria-roledescription="carousel" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 id="day-by-day" className="flex items-center gap-2 text-sm font-medium text-fg-subtle">
          <BookOpen aria-hidden size={16} className="text-fg-brand" />
          Week {week}
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
