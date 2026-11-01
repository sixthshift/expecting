import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import type { DayRead } from "../../../../content/days";
import type { Item } from "../../../../content/schema";
import { gestationLabel } from "../../../../lib/timeline";
import { ItemBody } from "../../../library/components/content/ItemBody";
import { ItemLink } from "../../../library/components/ItemLink";

/**
 * Day by day: a read for each day of the week after the note, out a day at a
 * time (`readsOut`), one card at a time so the page stays as short. It opens on
 * the newest, today's; the days missed are a swipe (or an arrow) back. Each
 * card ends in the entries it opens onto, as you'd find them in the Library.
 */
export function DayByDay({
  reads,
  items,
  today,
  peeking,
}: {
  /** Oldest first. */
  reads: readonly DayRead[];
  /** The Library as tailored for you: a link to an entry you'd not see is left off. */
  items: readonly Item[];
  /** Today's day of the week, 0–6, or null when it isn't this week. */
  today: number | null;
  peeking: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(reads.length - 1);
  const titles = new Map(items.map((i) => [i.id, i.title]));

  // Open on the newest, without the smooth scroll a reader would see.
  useLayoutEffect(() => {
    const el = track.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const go = (index: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = track.current;
    if (el && el.clientWidth > 0) setAt(Math.round(el.scrollLeft / el.clientWidth));
  };

  const when = (read: DayRead) => {
    const label = gestationLabel(read.week * 7 + read.day);
    if (today === null) return label;
    if (read.day === today) return `${label} · Today`;
    if (read.day === today - 1) return `${label} · Yesterday`;
    return label;
  };

  return (
    <section aria-labelledby="day-by-day" aria-roledescription="carousel" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 id="day-by-day" className="flex items-center gap-2 text-sm font-medium text-fg-subtle">
          <BookOpen aria-hidden size={16} className="text-fg-brand" />
          {peeking ? "Day by day that week" : "Day by day"}
        </h2>
        {reads.length > 1 ? (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" iconOnly aria-label="The day before" disabled={at <= 0} onClick={() => go(at - 1)}>
              <ChevronLeft aria-hidden size={16} />
            </Button>
            <Button variant="ghost" size="sm" iconOnly aria-label="The day after" disabled={at >= reads.length - 1} onClick={() => go(at + 1)}>
              <ChevronRight aria-hidden size={16} />
            </Button>
          </div>
        ) : null}
      </div>
      <div
        ref={track}
        onScroll={onScroll}
        className="-mx-1 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reads.map((read, i) => {
          const links = read.read.filter((id) => titles.has(id));
          return (
            <section
              key={`${read.week}-${read.day}`}
              aria-roledescription="slide"
              aria-label={`${when(read)}, ${i + 1} of ${reads.length}`}
              aria-hidden={i !== at}
              inert={i !== at}
              className="flex w-full shrink-0 snap-center px-1"
            >
              <Card className="w-full">
                <article className="flex h-full flex-col gap-2">
                  <span className="text-xs font-semibold tracking-widest text-fg-subtle uppercase">{when(read)}</span>
                  <h3 className="text-lg leading-snug font-display font-semibold text-fg-strong">{read.title}</h3>
                  <ItemBody doc={read.body} className="max-w-prose" />
                  {links.length > 0 ? (
                    <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-1 text-sm">
                      {links.map((id) => (
                        <ItemLink key={id} itemId={id} className="font-medium text-fg-brand underline">
                          {titles.get(id)}
                        </ItemLink>
                      ))}
                    </p>
                  ) : null}
                </article>
              </Card>
            </section>
          );
        })}
      </div>
      {reads.length > 1 ? (
        <div className="flex justify-center gap-1.5" aria-hidden>
          {reads.map((read, i) => (
            <button
              key={`${read.week}-${read.day}`}
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
