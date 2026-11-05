import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { useQuietQuery } from "../../../../api/rpc/quiet";
import { useSettingsQuery } from "../../../../api/rpc/settings";
import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { SkeletonText } from "../../../../components/loading/Skeleton";
import { builtInItems } from "../../../../content";
import { nextSteps, pausedAt } from "../../../../lib/home/quiet";
import { QUIET_ITEM } from "../../../../lib/quiet";
import { ItemList } from "../../../library/components/itemList/ItemList";
import { useItems } from "../../../library/hooks/useItems";
import { Guide } from "../components/Guide";

const guide = builtInItems.find((i) => i.id === QUIET_ITEM);

/**
 * Home while Expecting is quiet: no week, no size, no countdown, nothing
 * to do. The guide's opening words and its parts for what happened (someone
 * to talk to; for a loss, your body and how you might feel), then the next
 * steps, one at a time, for when you want them, and where it can be changed.
 * The route's quiet world (`worlds`).
 */
export function QuietHomePage() {
  const { data: quiet } = useQuietQuery();
  const { data: settings } = useSettingsQuery();
  const items = useItems();
  // Only once it's lifted, before the route draws the other world.
  if (!quiet) return null;
  const steps = nextSteps(items, quiet.kind, pausedAt(quiet, settings.dueDate));

  return (
    <PillarLayout className="pt-[max(1.5rem,env(safe-area-inset-top))] desktop:pt-10">
      <div className="max-w-3xl">
        <div className="flex flex-col gap-8">
          {guide ? (
            <Suspense fallback={<SkeletonText lines={6} />}>
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
      </div>
    </PillarLayout>
  );
}
