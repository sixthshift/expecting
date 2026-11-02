import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { SkeletonText } from "../../../../../components/loading/Skeleton";
import { builtInItems } from "../../../../../content";
import { ItemLink } from "../../../../../pillars/library/components/itemLink/ItemLink";
import { Signs } from "./Signs";

/** The guide the list comes from: written and sourced once, in content/items/warning-signs.md. */
const WARNING_SIGNS = "warning-signs";

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
      <Suspense fallback={<SkeletonText lines={6} className="py-2" />}>
        <Signs item={guide} />
      </Suspense>
      <ItemLink itemId={guide.id} className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
        All the warning signs, and each in full
        <ChevronRight aria-hidden size={16} />
      </ItemLink>
    </section>
  );
}
