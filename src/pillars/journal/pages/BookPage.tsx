import { Button } from "@sixthshift/design-system/button";
import { Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { usePeopleQuery } from "../../../api/rpc/people";
import { useNow, useSettingsQuery } from "../../../api/rpc/settings";
import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { formatDate } from "../../../lib/dates";
import { CHAPTERS, contents } from "../../../lib/journal/chapters";
import { ChapterPage } from "../components/book/ChapterPage";
import { Contents } from "../components/book/Contents";
import { JournalRail } from "../desktop/components/JournalRail";
import { useStoryItems } from "../hooks/useStoryItems";

/**
 * The book: the pregnancy, a chapter a part of it, begun by Expecting from
 * the first visit (each week's title, as written) and filled by what you
 * keep; to print or save as a PDF from the phone's or computer's own print.
 * Its story is built as the Journal builds it (`useStoryItems`). While
 * something has happened, the route draws `QuietBookPage` instead (`worlds`):
 * only a line, everything kept is in the Journal, as it was.
 */
export function BookPage() {
  const items = useStoryItems();
  const { data: settings } = useSettingsQuery();
  const { data: people } = usePeopleQuery();
  const now = useNow();
  const names = [...people.people].sort((a, b) => Number(b.role === "carrying") - Number(a.role === "carrying")).map((p) => p.name);
  const lines = contents({ items, dueDate: settings.dueDate, now });

  return (
    <PillarLayout rail={<JournalRail />} back={{ to: "/journal", label: "The Journal" }}>
      <div className="max-w-3xl">
        <header className="my-8 flex flex-col gap-2 rounded-xl bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) px-6 py-12 text-center">
          <h1 className="font-display text-4xl font-semibold text-fg-strong">Our pregnancy</h1>
          {names.length > 0 ? <p className="text-fg-normal">{names.join(" & ")}</p> : null}
          {settings.dueDate ? <p className="text-sm text-fg-subtle">Due {formatDate(settings.dueDate, { month: "long", year: "numeric" })}</p> : null}
        </header>
        <div className="mb-10 flex flex-col gap-4">
          <h2 className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">Contents</h2>
          <Contents lines={lines} />
          <Button variant="outline" size="sm" className="self-start print:hidden" onClick={() => window.print()}>
            <Printer aria-hidden size={16} /> Print or save as a PDF
          </Button>
        </div>
        {settings.dueDate ? (
          <div className="flex flex-col gap-14">
            {CHAPTERS.map((c) => (
              <ChapterPage key={c.key} chapter={c} items={items} now={now} />
            ))}
          </div>
        ) : (
          <p className="text-fg-subtle">
            With a due date, Expecting writes the weeks in.{" "}
            <Link to="/settings" search={{ ask: "dueDate" }} className="underline print:hidden">
              Add your due date
            </Link>
          </p>
        )}
      </div>
    </PillarLayout>
  );
}
