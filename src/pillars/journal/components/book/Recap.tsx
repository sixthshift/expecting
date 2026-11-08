// A recap, given back: a trimester, or the whole pregnancy, built from what's
// there, a part only when it has something. Stepped through a card at a
// time, or (the whole pregnancy) as a book to print. See src/lib/journal/recap.ts.

import { Button } from "@sixthshift/design-system/button";
import { Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { useSettingsQuery } from "../../../../api/rpc/settings";
import { TitledModal } from "../../../../components/TitledModal";
import { type ISODate, todayISO } from "../../../../lib/dates";
import { firstOf } from "../../../../lib/journal/firsts";
import type { RecapSpan } from "../../../../lib/journal/journalNow";
import { type Recap, type RecapPart, recapOf, recapParts } from "../../../../lib/journal/recap";
import type { StoryItem } from "../../../../lib/journal/story/items";
import { shortDate } from "../../../../lib/labels";
import { nameBy } from "../../../../lib/people";
import { placeOf, weekLabel } from "../../../../lib/timeline";
import { Picture } from "../../features/photos/components/Picture";
import { Flipbook } from "../../features/photos/components/Scrubber";
import { describePhoto } from "../../model/labels";

/** The recap of `span`, as what's kept changes; null without a due date (a recap is weeks). */
export function useRecap(span: RecapSpan, items: readonly StoryItem[]): Recap | null {
  const { data: settings } = useSettingsQuery();
  if (!settings.dueDate) return null;
  return recapOf({ span, dueDate: settings.dueDate, items });
}

export const RECAP_PART_TITLE: Record<RecapPart, string> = {
  firsts: "Your firsts",
  bump: "The bump",
  scans: "The scans",
  craved: "Most craved",
  voices: "In your own words",
  letters: "Letters to them",
  done: "What you got done",
};

/** One part of a recap, drawn. */
export function RecapPartView({ recap, part }: { recap: Recap; part: RecapPart }) {
  const { data: settings } = useSettingsQuery();
  const { data: people } = usePeopleQuery();
  const name = (id: string | null) => nameBy(id, people.me, people.people);
  const week = (day: string) => {
    const place = settings.dueDate ? placeOf(day as ISODate, settings.dueDate) : null;
    return typeof place === "number" ? weekLabel(place) : shortDate(day as ISODate, todayISO());
  };

  switch (part) {
    case "firsts":
      return (
        <ol className="flex flex-col gap-2">
          {recap.firsts.map((f) => (
            <li key={f.key} className="flex items-center gap-3">
              <Star aria-hidden size={16} className="shrink-0 fill-current text-fg-brand" />
              <span className="flex-1 text-fg-strong">{firstOf(f.key).title}</span>
              <span className="text-sm text-fg-subtle">{week(f.day)}</span>
            </li>
          ))}
        </ol>
      );
    case "bump":
      return <Flipbook weeks={recap.bump} size="lg" />;
    case "scans":
      return (
        <ul className="grid grid-cols-2 gap-2">
          {recap.scans.map((p) => (
            <li key={p.id} className="flex flex-col gap-1">
              <Picture fileId={p.fileId} variant="display" alt={describePhoto(p, settings.dueDate)} className="aspect-square w-full rounded-md object-cover" />
              <span className="text-xs text-fg-subtle">{p.caption ?? week(p.day)}</span>
            </li>
          ))}
        </ul>
      );
    case "craved":
      return recap.craved ? (
        <p className="text-fg-normal">
          <span className="font-display text-2xl font-semibold text-fg-strong">{recap.craved.what}</span>
          <br />
          {recap.craved.times} times, from {week(recap.craved.first)}.
        </p>
      ) : null;
    case "voices":
      return (
        <ol className="flex flex-col gap-4">
          {recap.voices.map((f) => (
            <li key={f.key} className="flex flex-col gap-2">
              <p className="text-sm font-medium text-fg-strong">{firstOf(f.key).question}</p>
              {f.words.map((w) => (
                <blockquote key={w.by} className="border-l-2 border-border-brand pl-3">
                  <p className="whitespace-pre-wrap text-fg-normal">{w.body}</p>
                  <footer className="text-xs text-fg-subtle">{name(w.by) ?? "One of you"}</footer>
                </blockquote>
              ))}
            </li>
          ))}
        </ol>
      );
    case "letters":
      return (
        <ol className="flex flex-col gap-4">
          {recap.letters.map((l) => (
            <li key={l.id}>
              <p className="whitespace-pre-wrap font-display text-fg-normal">{l.body}</p>
              <p className="mt-1 text-xs text-fg-subtle">{[l.fromBoth ? "Both of you" : name(l.by), week(l.day)].filter(Boolean).join(", ")}</p>
            </li>
          ))}
        </ol>
      );
    case "done":
      return (
        <ol className="flex flex-col gap-1">
          {recap.done.map((d) => (
            <li key={`${d.title}-${d.day}`} className="flex items-center gap-2 text-sm text-fg-normal">
              <Check aria-hidden size={14} className="shrink-0 text-fg-brand" />
              {d.title}
            </li>
          ))}
        </ol>
      );
  }
}

/** A recap stepped through, a part a card; the whole pregnancy's ends at the book. */
export function RecapViewer({ recap, onClose }: { recap: Recap; onClose: () => void }) {
  const parts = recapParts(recap);
  const [at, setAt] = useState(0);
  const part = parts[at];
  return (
    <TitledModal title={`${recap.span.title}, kept`} size="md" align="top" onClose={onClose} className="flex flex-col gap-4">
      {part ? (
        <section aria-label={RECAP_PART_TITLE[part]} className="flex min-h-64 flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">{RECAP_PART_TITLE[part]}</h3>
          <RecapPartView recap={recap} part={part} />
        </section>
      ) : (
        <p className="text-fg-subtle">Nothing kept in these weeks.</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" disabled={at === 0} onClick={() => setAt(at - 1)}>
          <ChevronLeft aria-hidden size={16} /> Back
        </Button>
        <span aria-hidden className="flex gap-1.5">
          {parts.map((p, i) => (
            <span key={p} className={i === at ? "size-2 rounded-full bg-fg-brand" : "size-2 rounded-full bg-bg-subtle"} />
          ))}
        </span>
        {at < parts.length - 1 ? (
          <Button variant="outline" size="sm" onClick={() => setAt(at + 1)}>
            Next <ChevronRight aria-hidden size={16} />
          </Button>
        ) : recap.span.key === "whole" ? (
          <Link to="/journal/book" className="text-sm font-medium text-fg-brand underline">
            The book
          </Link>
        ) : (
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        )}
      </div>
    </TitledModal>
  );
}
