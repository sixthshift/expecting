import { Spinner } from "@sixthshift/design-system/spinner";
import { getRouteApi, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarRange } from "lucide-react";
import { Suspense, use } from "react";
import { useChecklist } from "../../../api/rpc/checklist";
import { useExtras } from "../../../api/rpc/extras";
import { useAnswers } from "../../../api/rpc/facts";
import { builtInItems } from "../../../content";
import type { Item } from "../../../content/schema";
import { extrasOn } from "../../../lib/extras";
import { factsOf } from "../../../lib/facts";
import { DOOR_INFO, doorOf } from "../../../lib/library";
import { weekLabel } from "../../../lib/timeline";
import { extra } from "../../settings/model/extras";
import { ItemCard } from "../components/ItemCard";
import { Related } from "../components/related/Related";
import { useItems } from "../hooks/useItems";
import { pageOf } from "../model/pageOf";

const route = getRouteApi("/app/library/$itemId");

/** One item on its own page, with the way to its week on the timeline. */
export function LibraryItemPage() {
  const { itemId } = route.useParams();
  const { data: checklist } = useChecklist();
  const items = useItems();
  const { data: facts } = useAnswers({ select: factsOf });
  const { data: extras } = useExtras({ select: extrasOn });
  const item = items.find((i) => i.id === itemId);
  // Hidden by an answer, rather than not there at all: say so, and open settings at it.
  const hidden = item ? undefined : builtInItems.find((i) => i.id === itemId);
  const tailoredOut = hidden !== undefined;
  const offExtra = hidden?.extra && !extras.has(hidden.extra) ? extra(hidden.extra) : undefined;
  const hiddenBy = hidden ? Object.entries(hidden.when).find(([key, answers]) => facts[key] !== undefined && !answers.includes(facts[key]))?.[0] : undefined;

  return (
    <main className="mx-auto max-w-3xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-8">
      {/* Back to the door it's behind, where it was most likely found. */}
      <Link
        to="/library"
        search={item ? { door: doorOf(item) } : {}}
        className="-ml-2 mb-4 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal"
      >
        <ArrowLeft aria-hidden size={16} /> {item ? DOOR_INFO[doorOf(item)].title : "Library"}
      </Link>
      {item ? (
        <div className="flex flex-col gap-4">
          <Suspense
            fallback={
              <p className="flex min-h-40 items-center justify-center gap-2 text-sm text-fg-subtle">
                <Spinner size="sm" /> Opening {item.title}
              </p>
            }
          >
            <Page item={item} ticks={checklist.ticks} />
          </Suspense>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-display font-semibold text-fg-strong">Not in your library</h1>
          <p className="text-fg-subtle">
            {offExtra ? (
              <>
                It's part of {offExtra.name}, an extra that's off.{" "}
                <Link to="/settings" search={{ ask: `extra:${offExtra.id}` }} className="underline">
                  Turn it on in settings
                </Link>{" "}
                and it appears everywhere it belongs.
              </>
            ) : tailoredOut ? (
              <>
                Your answers in{" "}
                <Link to="/settings" search={{ ask: hiddenBy }} className="underline">
                  settings
                </Link>{" "}
                say this one doesn't apply to you. Change an answer and it comes back.
              </>
            ) : (
              "There's nothing at this address."
            )}
          </p>
        </div>
      )}
    </main>
  );
}

/** The item with its page, once loaded: the card, its week on the timeline, and what it links to. */
function Page({ item, ticks }: { item: Item; ticks: Record<string, string> }) {
  const page = use(pageOf(item));
  return (
    <>
      <ItemCard item={item} page={page} ticks={ticks} />
      {item.from !== null ? (
        <Link to="/timeline" search={{ at: item.from }} className="flex min-h-11 items-center gap-2 self-start text-sm text-fg-subtle hover:text-fg-normal">
          <CalendarRange aria-hidden size={16} className="text-fg-brand" />
          See {weekLabel(item.from).toLowerCase()} on the timeline
        </Link>
      ) : null}
      <Related ids={page.related} />
    </>
  );
}
