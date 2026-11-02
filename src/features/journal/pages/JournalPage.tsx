import { cn } from "@sixthshift/design-system/utils";
import { getRouteApi } from "@tanstack/react-router";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import { Highlights } from "../components/journal/highlights/Highlights";
import { StorySoFar } from "../components/journal/storySoFar/StorySoFar";
import { WeekSoFar } from "../components/journal/weekSoFar/WeekSoFar";
import { KeepRow } from "../components/KeepRow";
import { Lately } from "../components/Lately";
import { KeptBefore } from "../components/quiet/KeptBefore";
import { QuietStory } from "../components/quiet/QuietStory";
import { JournalPageProvider, useJournalPage } from "../contexts/JournalPageContext";

const route = getRouteApi("/app/journal");

/**
 * The Journal: the pregnancy, kept and given back. What matters now first
 * (a call to make, what you just kept, what the other kept since you looked,
 * a first to claim, a recap, last week, this day weeks ago), the patterns
 * there's enough for, then the story: everything kept and done, newest first
 * under its week and day, in a lens, searched, or zoomed out to weeks or the
 * whole pregnancy. Adding is the "+" and the Keep row. It shows what's kept,
 * never what's missing. See docs/product/journal.md.
 *
 * One context, two renderings: `JournalPageProvider` is the Journal's data
 * layer, and what it draws is `Journal` or, while something has happened,
 * `QuietJournal`, each written as what it is. They share the story's parts
 * (`components/story/`), the Keep row and Lately.
 *
 * The Journal is three parts: the week so far (`WeekSoFar`), the highlights
 * beside it (`Highlights`) and the story so far (`StorySoFar`). What passes
 * between them is the page's context (`JournalPageProvider`): the story,
 * built once; the highlights, worked out once (the firsts a Now card already
 * asks about, which the week leaves out, among them); the lens; and the
 * search words. The week leaves out its days while the story is in a lens,
 * zoomed or searched, which it works out itself.
 */
export function JournalPage() {
  return (
    <JournalPageProvider>
      <Rendering />
    </JournalPageProvider>
  );
}

/** Which page draws the context: the quiet Journal while something has happened. */
function Rendering() {
  const { quiet } = useJournalPage();
  return quiet ? <QuietJournal /> : <Journal />;
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

/**
 * The Journal while something has happened: the story, as kept. Drawn by
 * `JournalPage` from the same context as the Journal (`JournalPageProvider`),
 * rendered as what it is. No week counted and nothing about the baby: no
 * call to make, no week's page, no places made ready, no firsts, no Now and
 * no book. The Keep row with what can still be kept; feelings' pattern, if
 * there's enough for it; the story of what stays (the notes, letters,
 * feelings, papers and what was done); and what's folded away, behind one
 * quiet line. See docs/product/journal.md, While something has happened.
 */
function QuietJournal() {
  const { highlights } = useJournalPage();
  const navigate = route.useNavigate();
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader title="Journal" />
      <div className="flex flex-col gap-8 lg:max-w-3xl">
        <KeepRow />
        {highlights.patterns.length > 0 ? <Lately patterns={highlights.patterns} onOpen={(l) => navigate({ search: { show: l } })} /> : null}
        <div className="flex min-w-0 flex-col gap-4">
          <QuietStory />
          <KeptBefore />
        </div>
      </div>
    </main>
  );
}
