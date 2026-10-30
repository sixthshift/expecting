import { Spinner } from "@sixthshift/design-system/spinner";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Suspense, use } from "react";
import { useSettings } from "../../../../api/rpc/settings";
import { PhoneCorner } from "../../../../app/components/layout/PillarLayout";
import { builtInItems } from "../../../../content";
import type { Item } from "../../../../content/schema";
import { sectionsOf } from "../../../../content/sections";
import { nextSteps, pausedAt, QUIET_ITEM, QUIET_PARTS, type Quiet } from "../../../../lib/quiet";
import { ItemBody } from "../../../library/components/content/ItemBody";
import { ItemList } from "../../../library/components/ItemList";
import { useItems } from "../../../library/hooks/useItems";
import { pageOf } from "../../../library/model/pageOf";

const guide = builtInItems.find((i) => i.id === QUIET_ITEM);

/**
 * This week while Expecting is quiet: no week, no size, no countdown, nothing
 * to do. The guide's opening words and its parts for what happened (someone
 * to talk to; for a loss, your body and how you might feel), then the next
 * steps, one at a time, for when you want them, and where it can be changed.
 */
export function QuietWeek({ quiet }: { quiet: Quiet }) {
  const { data: settings } = useSettings();
  const items = useItems();
  const steps = nextSteps(items, quiet.kind, pausedAt(quiet, settings.dueDate));

  return (
    <main className="mx-auto max-w-3xl px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-10">
      <div className="flex flex-col gap-8">
        {guide ? (
          <Suspense
            fallback={
              <p className="flex min-h-40 items-center justify-center gap-2 text-sm text-fg-subtle">
                <Spinner size="sm" />
              </p>
            }
          >
            <Guide item={guide} quiet={quiet} />
          </Suspense>
        ) : null}

        {steps.length > 0 ? (
          <section aria-labelledby="when-ready" className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="when-ready" className="text-lg font-display font-semibold text-fg-strong">
                When you're ready
              </h2>
              <p className="text-sm text-fg-subtle">One at a time, whenever you want them. None of it has to be now.</p>
            </div>
            <ItemList items={steps} />
          </section>
        ) : null}

        <Link to="/settings" search={{ ask: "quiet" }} className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
          Expecting stays quiet for both of you until you choose
          <ChevronRight aria-hidden size={16} />
        </Link>
      </div>
    </main>
  );
}

/** The guide's opening words as the page's, then its parts for what happened. */
function Guide({ item, quiet }: { item: Item; quiet: Quiet }) {
  const sections = sectionsOf(use(pageOf(item)).doc);
  const opening = sections.find((s) => s.title === null);
  const parts = QUIET_PARTS[quiet.kind].flatMap((title) => sections.filter((s) => s.title === title));
  return (
    <>
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">Take the time you need</h1>
          <PhoneCorner />
        </div>
        {opening ? <ItemBody doc={opening.doc} className="max-w-prose" /> : null}
      </header>
      {parts.map((s) => (
        <section key={s.title} className="flex flex-col">
          <h2 className="text-lg font-display font-semibold text-fg-strong">{s.title}</h2>
          <ItemBody doc={s.doc} className="max-w-prose" />
        </section>
      ))}
    </>
  );
}
