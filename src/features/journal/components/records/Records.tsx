// The records, all at once: each kind kept, said as one short answer and the
// lines behind it (`src/lib/records.ts`), for an appointment or a call to the
// hospital. What's going on now first, what's over under Earlier; the papers
// kept handy at the top, to open at triage; and the whole of it as text, to
// paste into a message or a form. Only the kinds with something kept: never
// what's missing. While something has happened, movements and sickness and
// cravings are folded away, as in the story.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { toast } from "@sixthshift/design-system/overlay";
import { getRouteApi } from "@tanstack/react-router";
import { ChevronRight, Copy } from "lucide-react";
import { useAppetiteQuery } from "../../../../api/rpc/appetite";
import { useFeelingsQuery } from "../../../../api/rpc/feelings";
import { useJournalQuery } from "../../../../api/rpc/journal";
import { usePapersQuery } from "../../../../api/rpc/papers";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import { formatDate, todayISO } from "../../../../lib/dates";
import { ordered } from "../../../../lib/papers";
import type { QuietKind } from "../../../../lib/quiet";
import { cravingsRecord, feelingsRecord, type KeptRecord, movementsRecord, type RecordKind, recordsText, sicknessRecord } from "../../../../lib/records";
import { weekLabel } from "../../../../lib/timeline";
import { PaperList } from "../entries/papers/PaperList";
import { MovementPattern } from "../story/MovementPattern";

const route = getRouteApi("/app/journal/records");

/** How many papers are listed besides the handy ones. */
const LATEST_PAPERS = 3;

/** A record on the page: what it's called, the kind it opens, and the way to every one. */
type Shown = { key: string; title: string; kind: RecordKind; more: string; record: KeptRecord };

/** One record: its name, its answer large, the lines behind it, and the way to every one. */
function RecordCard({ shown }: { shown: Shown }) {
  const navigate = route.useNavigate();
  const { key, title, kind, more, record } = shown;
  return (
    <Card>
      <section aria-labelledby={`record-${key}`} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 id={`record-${key}`} className="text-sm font-semibold text-fg-subtle">
            {title}
          </h3>
          <p className="font-display text-2xl font-semibold text-fg-strong">{record.headline}</p>
        </div>
        {record.lines.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm text-fg-normal">
            {record.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        {key === "movements" && record.lately ? <MovementPattern /> : null}
        <button
          type="button"
          onClick={() => navigate({ search: { show: kind } })}
          className="flex min-h-10 items-center gap-1 self-start text-sm font-medium text-fg-brand hover:underline"
        >
          {more}
          <ChevronRight aria-hidden size={16} />
        </button>
      </section>
    </Card>
  );
}

/** A group of records under its heading, or nothing. */
function Group({ title, shown }: { title: string; shown: readonly Shown[] }) {
  if (shown.length === 0) return null;
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="font-display text-lg font-semibold text-fg-strong">{title}</h2>
      {shown.map((s) => (
        <RecordCard key={s.key} shown={s} />
      ))}
    </section>
  );
}

export function Records({ quiet }: { quiet: QuietKind | null }) {
  const navigate = route.useNavigate();
  const { data: journal } = useJournalQuery();
  const { data: appetite } = useAppetiteQuery();
  const { data: feelings } = useFeelingsQuery();
  const { data: papers } = usePapersQuery();
  const { data: people } = usePeopleQuery();
  const { data: settings } = useSettingsQuery();
  const now = useNow();
  const today = todayISO();
  const { dueDate } = settings;

  const all: (Shown | null)[] = [
    quiet ? null : withRecord("movements", "Movements", "movements", "Every movement", movementsRecord(journal, today, dueDate)),
    quiet ? null : withRecord("sickness", "Sickness", "appetite", "Every one kept", sicknessRecord(appetite, today, dueDate)),
    quiet ? null : withRecord("cravings", "Cravings", "appetite", "Every one kept", cravingsRecord(appetite, today)),
    withRecord("feelings", "Feelings", "feelings", "Every check-in", feelingsRecord(feelings, people.people, people.me?.id ?? null, today)),
  ];
  const shown = all.filter((s): s is Shown => s !== null);
  const lately = shown.filter((s) => s.record.lately);
  const earlier = shown.filter((s) => !s.record.lately);
  const handy = ordered(papers.filter((p) => p.handy));
  const latest = ordered(papers.filter((p) => !p.handy)).slice(0, LATEST_PAPERS);

  if (shown.length === 0 && papers.length === 0) {
    return (
      <p className="max-w-prose text-fg-subtle">
        What you keep is said here in a few lines, to look up at an appointment:{" "}
        {quiet ? "feelings and papers" : "movements, sickness and cravings, feelings and papers"}.
      </p>
    );
  }

  async function copy() {
    const heading = `Records, ${formatDate(today, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}${now !== null && !quiet ? `, ${weekLabel(now).toLowerCase()}` : ""}`;
    const text = recordsText({ heading, records: shown.map((s) => ({ title: s.title, record: s.record })), papers: ordered(papers).map((p) => p.title) });
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
        <p className="max-w-prose text-fg-subtle">What's been kept, in a few lines: for an appointment, or a call to the hospital.</p>
        <Button variant="outline" size="sm" onClick={copy}>
          <Copy aria-hidden size={16} />
          Copy as text
        </Button>
      </div>

      {handy.length > 0 ? (
        <section aria-label="To hand" className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold text-fg-strong">To hand</h2>
          <div className="rounded-xl border border-border-subtle bg-bg-normal p-1">
            <PaperList papers={handy} label="Papers kept handy" />
          </div>
        </section>
      ) : null}

      <Group title="Lately" shown={lately} />
      <Group title="Earlier" shown={earlier} />

      {latest.length > 0 ? (
        <section aria-label="Papers" className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold text-fg-strong">Papers</h2>
          <div className="rounded-xl border border-border-subtle bg-bg-normal p-1">
            <PaperList papers={latest} label="The latest papers" />
          </div>
          <button
            type="button"
            onClick={() => navigate({ search: { show: "papers" } })}
            className="flex min-h-10 items-center gap-1 self-start text-sm font-medium text-fg-brand hover:underline"
          >
            {papers.length === 1 ? "The paper" : `All ${papers.length} papers`}
            <ChevronRight aria-hidden size={16} />
          </button>
        </section>
      ) : handy.length > 0 ? (
        <button
          type="button"
          onClick={() => navigate({ search: { show: "papers" } })}
          className="-mt-5 flex min-h-10 items-center gap-1 self-start text-sm font-medium text-fg-brand hover:underline"
        >
          {papers.length === 1 ? "The paper" : `All ${papers.length} papers`}
          <ChevronRight aria-hidden size={16} />
        </button>
      ) : null}
    </div>
  );
}

function withRecord(key: string, title: string, kind: RecordKind, more: string, record: KeptRecord | null): Shown | null {
  return record ? { key, title, kind, more, record } : null;
}
