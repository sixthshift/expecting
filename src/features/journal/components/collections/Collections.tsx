// The collections, all at once: everything kept, grouped by what it is, each
// said as a short answer and the lines behind it (`src/lib/summaries.ts`),
// and opened in full. What's going on now first, what's over under Earlier;
// the papers kept handy at the top, to open at triage; and what an
// appointment asks about as text, to paste into a message or a form. Only
// the collections with something in: never what's missing. While something
// has happened, the folded ones aren't here, as in the story.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { toast } from "@sixthshift/design-system/overlay";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Copy } from "lucide-react";
import { useAppetiteQuery } from "../../../../api/rpc/appetite";
import { useFeelingsQuery } from "../../../../api/rpc/feelings";
import { useFirstsQuery } from "../../../../api/rpc/firsts";
import { useJournalQuery } from "../../../../api/rpc/journal";
import { usePapersQuery } from "../../../../api/rpc/papers";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { usePhotosQuery } from "../../../../api/rpc/photos";
import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import { formatDate, todayISO } from "../../../../lib/dates";
import { ordered } from "../../../../lib/papers";
import { type Collection, FOLDED_WHILE_QUIET } from "../../../../lib/story/collections";
import {
  cravingsSummary,
  feelingsSummary,
  firstsSummary,
  movementsSummary,
  notesSummary,
  papersSummary,
  photosSummary,
  type Summary,
  sicknessSummary,
  summariesText,
} from "../../../../lib/summaries";
import { weekLabel } from "../../../../lib/timeline";
import { useJournalPage } from "../../contexts/JournalPageContext";
import { PaperList } from "../entries/papers/PaperList";
import { MovementPattern } from "./movements/MovementPattern";

/** A card on the page: what it's called, the collection it opens, the way to all of it, and whether it goes in the text for an appointment. */
type Shown = { key: string; title: string; collection: Collection; more: string; summary: Summary; forAppointments: boolean };

/** One card: its name, its answer large, the lines behind it, and the way to all of it. */
function CollectionCard({ shown }: { shown: Shown }) {
  const { key, title, collection, more, summary } = shown;
  return (
    <Card>
      <section aria-labelledby={`collection-${key}`} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 id={`collection-${key}`} className="text-sm font-semibold text-fg-subtle">
            {title}
          </h3>
          <p className="font-display text-2xl font-semibold text-fg-strong">{summary.headline}</p>
        </div>
        {summary.lines.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm text-fg-normal">
            {summary.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        {key === "movements" && summary.lately ? <MovementPattern /> : null}
        <Link
          to="/journal/collections/$name"
          params={{ name: collection }}
          className="flex min-h-10 items-center gap-1 self-start text-sm font-medium text-fg-brand hover:underline"
        >
          {more}
          <ChevronRight aria-hidden size={16} />
        </Link>
      </section>
    </Card>
  );
}

/** A group of cards under its heading, or nothing. */
function Group({ title, shown }: { title: string; shown: readonly Shown[] }) {
  if (shown.length === 0) return null;
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="font-display text-lg font-semibold text-fg-strong">{title}</h2>
      {shown.map((s) => (
        <CollectionCard key={s.key} shown={s} />
      ))}
    </section>
  );
}

/** What each card is, in the order they're shown: the ones an appointment asks about first. */
function useCards(): Shown[] {
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

export function Collections() {
  const { quiet } = useJournalPage();
  const { data: papers } = usePapersQuery();
  const now = useNow();
  const shown = useCards();
  const handy = ordered(papers.filter((p) => p.handy));
  const today = todayISO();

  if (shown.length === 0) {
    return <p className="max-w-prose text-fg-subtle">What you keep is gathered here by what it is, each with a short answer at the top.</p>;
  }

  const asked = shown.filter((s) => s.forAppointments);
  async function copy() {
    const heading = `Kept, ${formatDate(today, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}${now !== null && !quiet ? `, ${weekLabel(now).toLowerCase()}` : ""}`;
    const text = summariesText({ heading, summaries: asked.map((s) => ({ title: s.title, summary: s.summary })), papers: ordered(papers).map((p) => p.title) });
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", children: "Ready to paste into a message or a form." });
    } catch {
      toast({ title: "Couldn't copy", children: "This browser didn't allow it." });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-prose text-fg-subtle">Everything kept, by what it is: for an appointment, a call to the hospital, or a look back.</p>
        {asked.length > 0 || papers.length > 0 ? (
          <Button variant="outline" size="sm" onClick={copy}>
            <Copy aria-hidden size={16} />
            Copy as text
          </Button>
        ) : null}
      </div>

      {handy.length > 0 ? (
        <section aria-label="To hand" className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold text-fg-strong">To hand</h2>
          <div className="rounded-xl border border-border-subtle bg-bg-normal p-1">
            <PaperList papers={handy} label="Papers kept handy" />
          </div>
        </section>
      ) : null}

      <Group title="Lately" shown={shown.filter((s) => s.summary.lately)} />
      <Group title="Earlier" shown={shown.filter((s) => !s.summary.lately)} />
    </div>
  );
}
