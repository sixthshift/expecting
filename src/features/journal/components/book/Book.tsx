// The book, from the first visit, already begun: its cover (Our pregnancy,
// your names, the month it's due) and its contents, a pregnancy's chapters,
// each begun, now, still to come, or passed. It shows what the Journal could
// become without telling anyone to fill it. While the Journal is young it
// sits on the page; after, one line.

import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { usePeople } from "../../../../api/rpc/people";
import { useSettings } from "../../../../api/rpc/settings";
import type { ChapterLine } from "../../../../lib/chapters";
import { formatDate } from "../../../../lib/dates";

/** "Sam & Jason": whoever's carrying first. */
function useNames(): string | null {
  const { data: people } = usePeople();
  const names = [...people.people].sort((a, b) => Number(b.role === "carrying") - Number(a.role === "carrying")).map((p) => p.name);
  return names.length > 0 ? names.join(" & ") : null;
}

/** "Due July 2027". */
function useDue(): string | null {
  const { data: settings } = useSettings();
  return settings.dueDate ? `Due ${formatDate(settings.dueDate, { month: "long", year: "numeric" })}` : null;
}

const STATE_LABEL = { begun: "Begun", now: "Now", "to-come": "Still to come", passed: "Can still be kept" } as const;

/** The contents: each chapter, and how it stands. */
export function Contents({ lines }: { lines: readonly ChapterLine[] }) {
  return (
    <ol aria-label="Contents" className="flex flex-col">
      {lines.map(({ chapter, state }) => (
        <li key={chapter.key} className="flex items-baseline gap-2 py-1">
          <span className={cn("font-display", state === "begun" || state === "now" ? "text-fg-strong" : "text-fg-subtle opacity-70")}>{chapter.title}</span>
          <span aria-hidden className="flex-1 border-b border-dotted border-border-normal" />
          <span className={cn("text-xs", state === "now" ? "font-medium text-fg-brand" : state === "begun" ? "text-fg-normal" : "text-fg-subtle")}>
            {chapter.weeks ? STATE_LABEL[state] : "With the birth"}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The cover and the contents, for while the Journal is young. */
export function BookCover({ lines }: { lines: readonly ChapterLine[] }) {
  const names = useNames();
  const due = useDue();
  return (
    <section
      aria-label="Your book"
      className="grid gap-5 rounded-2xl border border-border-subtle bg-bg-normal p-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-start"
    >
      <Link
        to="/journal/book"
        aria-label="Open your book"
        className="flex aspect-[3/4] w-32 flex-col justify-between rounded-md bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-3 shadow-sm ring-1 ring-border-subtle sm:w-full"
      >
        <span className="font-display text-lg leading-tight font-semibold text-fg-strong">Our pregnancy</span>
        <span className="flex flex-col text-xs text-fg-normal">
          {names ? <span>{names}</span> : null}
          {due ? <span>{due}</span> : null}
        </span>
      </Link>
      <div className="flex flex-col gap-3">
        <p className="text-fg-normal">Expecting has begun your book. What you keep goes into it, on its week.</p>
        <Contents lines={lines} />
        <Link to="/journal/book" className="flex items-center gap-1 self-end text-sm font-medium text-fg-brand">
          Open it <ChevronRight aria-hidden size={16} />
        </Link>
      </div>
    </section>
  );
}

/** The book, once the Journal is under way: one line. */
export function BookLine({ lines }: { lines: readonly ChapterLine[] }) {
  const begun = lines.filter((l) => l.state === "begun").length;
  return (
    <Link
      to="/journal/book"
      className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-border-subtle px-4 text-fg-normal hover:bg-bg-normal-hovered"
    >
      <span>
        <span className="font-display font-semibold text-fg-strong">Our pregnancy</span>
        <span className="text-sm text-fg-subtle"> · {begun === 1 ? "1 chapter begun" : `${begun} chapters begun`}</span>
      </span>
      <ChevronRight aria-hidden size={16} className="text-fg-subtle" />
    </Link>
  );
}
