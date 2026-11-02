import { cn } from "@sixthshift/design-system/utils";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import { Highlights } from "../components/journal/highlights/Highlights";
import { StorySoFar } from "../components/journal/storySoFar/StorySoFar";
import { WeekSoFar } from "../components/journal/weekSoFar/WeekSoFar";
import { JournalPageProvider, useJournalPage } from "../contexts/JournalPageContext";

/**
 * The Journal: the pregnancy, kept and given back. What matters now first
 * (a call to make, what you just kept, what the other kept since you looked,
 * a first to claim, a recap, last week, this day weeks ago), the patterns
 * there's enough for, then the story: everything kept and done, newest first
 * under its week and day, in a lens, searched, or zoomed out to weeks or the
 * whole pregnancy. Adding is the "+" and the Keep row. It shows what's kept,
 * never what's missing. While something has happened, the notes, letters,
 * feelings, papers and what was done stay, and the rest is folded behind one
 * quiet line. See docs/product/journal.md.
 *
 * The page is three parts: the week so far (`WeekSoFar`), the highlights
 * beside it (`Highlights`) and the story so far (`StorySoFar`). What passes
 * between them is the page's context (`JournalPageProvider`): the
 * highlights, worked out once; the firsts a Now card already asks about,
 * which the week leaves out; the search words; and whether the story is in a
 * lens, zoomed or searched, when the week leaves out its days.
 */
export function JournalPage() {
  return (
    <JournalPageProvider>
      <Journal />
    </JournalPageProvider>
  );
}

/** The page's layout, inside its provider: two columns on desktop while there are highlights, one at a reading width without. */
function Journal() {
  const { highlights } = useJournalPage();
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader title="Journal" />
      {/* The highlights only when there are some: an empty one would leave its column blank. */}
      {/* Without the highlights, one column at a reading width rather than the whole screen's. */}
      <div
        className={cn(
          "flex flex-col gap-8",
          highlights.shown ? "lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[auto_1fr] lg:gap-x-10" : "lg:max-w-3xl"
        )}
      >
        <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1">
          <WeekSoFar />
        </div>

        {highlights.shown ? (
          <aside aria-label="Now and lately" className="flex flex-col gap-4 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            <Highlights />
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-2">
          <StorySoFar />
        </div>
      </div>
    </main>
  );
}
