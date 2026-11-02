// The book, from the first visit, already begun: its cover (Our pregnancy,
// your names, the month it's due) and its contents, a pregnancy's chapters,
// each begun, now, still to come, or passed. It shows what the Journal could
// become without telling anyone to fill it. While the Journal is young it
// sits on the page; after, one line.

import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import { useSettingsQuery } from "../../../../../api/rpc/settings";
import type { ChapterLine } from "../../../../../lib/chapters";
import { formatDate } from "../../../../../lib/dates";
import { Contents } from "../../Contents";

/** "Sam & Jason": whoever's carrying first. */
function useNamesQuery(): string | null {
  const { data: people } = usePeopleQuery();
  const names = [...people.people].sort((a, b) => Number(b.role === "carrying") - Number(a.role === "carrying")).map((p) => p.name);
  return names.length > 0 ? names.join(" & ") : null;
}

/** "Due July 2027". */
function useDue(): string | null {
  const { data: settings } = useSettingsQuery();
  return settings.dueDate ? `Due ${formatDate(settings.dueDate, { month: "long", year: "numeric" })}` : null;
}

/** The cover and the contents, for while the Journal is young, or while there's no due date to write its weeks in. */
export function BookCover({ lines }: { lines: readonly ChapterLine[] }) {
  const names = useNamesQuery();
  const due = useDue();
  return (
    <section
      aria-label="Your book"
      className="grid gap-5 rounded-xl border border-border-subtle bg-bg-normal p-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-start"
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
        {due ? (
          <p className="text-fg-normal">Expecting has begun your book. What you keep goes into it, on its week.</p>
        ) : (
          <p className="text-fg-normal">
            Your book is ready to begin. With your due date, Expecting writes the weeks in, and what you keep goes into it.{" "}
            <Link to="/settings" search={{ ask: "dueDate" }} className="underline">
              Add your due date
            </Link>
          </p>
        )}
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
