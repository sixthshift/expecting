import { Button } from "@sixthshift/design-system/button";
import { Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { useMemo } from "react";
import { useAppetiteQuery } from "../../../api/rpc/appetite";
import { useBingoQuery } from "../../../api/rpc/bingo";
import { useChecklistQuery } from "../../../api/rpc/checklist";
import { useExtrasQuery } from "../../../api/rpc/extras";
import { useFeelingsQuery } from "../../../api/rpc/feelings";
import { useFirstsQuery } from "../../../api/rpc/firsts";
import { useItsTimeQuery } from "../../../api/rpc/itsTime";
import { useJournalQuery } from "../../../api/rpc/journal";
import { usePapersQuery } from "../../../api/rpc/papers";
import { usePeopleQuery } from "../../../api/rpc/people";
import { usePhotosQuery } from "../../../api/rpc/photos";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { useNow, useSettingsQuery } from "../../../api/rpc/settings";
import { useWeeklyQuery } from "../../../api/rpc/weekly";
import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { useKeepSame } from "../../../app/hooks/useKeepSame";
import { formatDate, todayISO } from "../../../lib/dates";
import { moments } from "../../../lib/drawer/bingo";
import { extrasOn } from "../../../lib/extras";
import { CHAPTERS, contents } from "../../../lib/journal/chapters";
import { storyItems } from "../../../lib/journal/story/items";
import { pairs } from "../../../lib/thisWeek/weekly";
import { useTasks } from "../../planner/features/tasks/hooks/useTasks";
import { ChapterPage } from "../components/book/ChapterPage";
import { Contents } from "../components/book/Contents";

/**
 * The book: the pregnancy, a chapter a part of it, begun by Expecting from
 * the first visit (each week's title, as written) and filled by what you
 * keep; to print or save as a PDF from the phone's or computer's own print.
 * While something has happened, only a line: everything kept is in the
 * Journal, as it was.
 */
export function BookPage() {
  // The story, built as the Journal builds it (`JournalPageProvider`).
  const { data: journal } = useJournalQuery();
  const { data: appetite } = useAppetiteQuery();
  const { data: photos } = usePhotosQuery();
  const { data: papers } = usePapersQuery();
  const { data: feelings } = useFeelingsQuery();
  const { data: firsts } = useFirstsQuery();
  const { data: checklist } = useChecklistQuery();
  const { data: itsTime } = useItsTimeQuery();
  const { data: weekly } = useWeeklyQuery();
  // A question a week's answers, while its extra is on: turned off, they're hidden, not deleted.
  const { data: asking } = useExtrasQuery({ select: (e) => extrasOn(e).has("question-a-week") });
  const { data: bingo } = useBingoQuery();
  const { data: playing } = useExtrasQuery({ select: (e) => extrasOn(e).has("pregnancy-bingo") });
  const tasks = useTasks();
  const built = useMemo(
    () =>
      storyItems({
        journal,
        appetite,
        photos,
        papers,
        feelings,
        firsts,
        ticks: checklist.ticks,
        titles: new Map(tasks.map((t) => [t.id, t.title])),
        starts: itsTime.starts,
        weekly: asking ? pairs(weekly, (at) => todayISO(new Date(at))) : [],
        bingo: playing ? moments(bingo.cards) : [],
      }),
    [journal, appetite, photos, papers, feelings, firsts, checklist.ticks, tasks, itsTime.starts, weekly, asking, bingo, playing]
  );
  // Rebuilt in full on any change: the lines that didn't change are kept as they were, so their days aren't drawn again.
  const items = useKeepSame(built);
  const { data: quiet } = useQuietQuery();
  const { data: settings } = useSettingsQuery();
  const { data: people } = usePeopleQuery();
  const now = useNow();
  const names = [...people.people].sort((a, b) => Number(b.role === "carrying") - Number(a.role === "carrying")).map((p) => p.name);
  const lines = contents({ items, dueDate: settings.dueDate, now });

  return (
    <PillarLayout back={{ to: "/journal", label: "The Journal" }}>
      <div className="max-w-3xl">
        {quiet ? (
          <p className="py-10 text-fg-subtle">Everything you kept is in the Journal, as it was.</p>
        ) : (
          <>
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
          </>
        )}
      </div>
    </PillarLayout>
  );
}
