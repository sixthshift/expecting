import { Button } from "@sixthshift/design-system/button";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Printer } from "lucide-react";
import { useQuiet } from "../../../api/rpc/quiet";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import type { RecapSpan } from "../../../lib/journalNow";
import { hasRecap, recapParts } from "../../../lib/recap";
import { type StoryItem, TRIMESTERS } from "../../../lib/story";
import { RecapPartView, useRecap } from "../components/recap/Recap";
import { useStory } from "../hooks/useStory";

const PART_TITLE = {
  firsts: "Firsts",
  bump: "The bump",
  scans: "Scans",
  craved: "Most craved",
  voices: "In your own words",
  letters: "Letters to them",
  done: "What you got done",
} as const;

/** A trimester, as a chapter: its parts, each only when it has something. Nothing at all when it has none. */
function Chapter({ span, items }: { span: RecapSpan; items: readonly StoryItem[] }) {
  const recap = useRecap(span, items);
  if (!recap || !hasRecap(recap)) return null;
  return (
    <section aria-labelledby={`chapter-${span.key}`} className="flex break-inside-avoid-page flex-col gap-6">
      <h2 id={`chapter-${span.key}`} className="font-display text-2xl font-semibold text-fg-strong">
        {span.title}
      </h2>
      {recapParts(recap).map((part) => (
        <section key={part} aria-label={PART_TITLE[part]} className="flex break-inside-avoid flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">{PART_TITLE[part]}</h3>
          {/* The flipbook prints as its last frame. */}
          <RecapPartView recap={recap} part={part} />
        </section>
      ))}
    </section>
  );
}

/**
 * The book: the whole pregnancy on one page, a chapter a trimester, made
 * from what's kept and done, to print or save as a PDF from the phone's or
 * computer's own print. Nothing to write: it's made as you go. While
 * something has happened, what the Journal folds away isn't in it.
 */
export function BookPage() {
  const items = useStory();
  const { data: quiet } = useQuiet();
  const any = items.length > 0;
  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 md:px-8">
      <Link to="/journal" className="mt-4 flex min-h-11 items-center gap-1 text-sm text-fg-subtle print:hidden">
        <ChevronLeft aria-hidden size={16} /> The Journal
      </Link>
      <PillarHeader title="Our pregnancy" lead="Made from what you kept and did, a chapter a trimester." />
      {quiet ? null : (
        <div className="mb-8 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()} disabled={!any}>
            <Printer aria-hidden size={16} /> Print or save as a PDF
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-12">
        {quiet ? (
          <p className="text-fg-subtle">Everything you kept is in the Journal, as it was.</p>
        ) : (
          TRIMESTERS.map((t) => <Chapter key={t.key} span={{ key: t.key, title: t.title, from: t.from, to: t.to }} items={items} />)
        )}
        {!any && !quiet ? <p className="text-fg-subtle">As you keep things, and tick them off, they gather here.</p> : null}
      </div>
    </main>
  );
}
