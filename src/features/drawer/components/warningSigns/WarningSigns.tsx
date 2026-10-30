import { Spinner } from "@sixthshift/design-system/spinner";
import { ChevronRight } from "lucide-react";
import { Suspense, use } from "react";
import { builtInItems } from "../../../../content";
import type { Item } from "../../../../content/schema";
import { sectionsOf } from "../../../../content/sections";
import { ItemBody } from "../../../library/components/content/ItemBody";
import { ItemLink } from "../../../library/components/ItemLink";
import { pageOf } from "../../../library/model/pageOf";

/** The guide the list comes from: written and sourced once, in content/items/warning-signs.md. */
const WARNING_SIGNS = "warning-signs";

/** Its part Emergency info shows: the signs that mean call now. */
const NOW = "Straight away";

const guide = builtInItems.find((i) => i.id === WARNING_SIGNS);

/**
 * When to call, under who to call on Emergency info: the warning signs that
 * mean contact the hospital straight away, from their guide, with the way to
 * the whole of it (what can wait a day or two, and each sign's own page).
 */
export function WarningSigns() {
  if (!guide) return null;
  return (
    <section aria-labelledby="when-to-call" className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-normal p-4">
      <h3 id="when-to-call" className="font-semibold text-fg-strong">
        When to call
      </h3>
      <Suspense
        fallback={
          <p className="flex min-h-20 items-center justify-center">
            <Spinner size="sm" />
          </p>
        }
      >
        <Signs item={guide} />
      </Suspense>
      <ItemLink itemId={guide.id} className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
        All the warning signs, and each in full
        <ChevronRight aria-hidden size={16} />
      </ItemLink>
    </section>
  );
}

function Signs({ item }: { item: Item }) {
  const sections = sectionsOf(use(pageOf(item)).doc);
  const opening = sections.find((s) => s.title === null);
  const now = sections.find((s) => s.title === NOW);
  return (
    <>
      {opening ? <ItemBody doc={opening.doc} className="max-w-prose" /> : null}
      {now ? <ItemBody doc={now.doc} className="max-w-prose" /> : null}
    </>
  );
}
