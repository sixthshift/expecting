import { Spinner } from "@sixthshift/design-system/spinner";
import { getRouteApi, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, CalendarRange } from "lucide-react";
import { Suspense, use, useEffect } from "react";
import { useChecklist } from "../../../api/rpc/checklist";
import { useExtras } from "../../../api/rpc/extras";
import { useAnswers } from "../../../api/rpc/facts";
import { builtInItems } from "../../../content";
import type { Item } from "../../../content/schema";
import { extrasOn } from "../../../lib/extras";
import { factsOf } from "../../../lib/facts";
import { DOOR_INFO, doorOf } from "../../../lib/library";
import { QUIET_ITEM } from "../../../lib/quiet";
import { weekLabel } from "../../../lib/timeline";
import { QuietSwitch } from "../../quiet/components/quietSwitch/QuietSwitch";
import { extra } from "../../settings/model/extras";
import { ItemCard } from "../components/ItemCard";
import { QuickExit } from "../components/private/QuickExit";
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
      {item?.private ? <Private itemId={item.id} /> : null}
      {/* Back to the door it's behind, where it was most likely found; from a private entry, in its place in the history. */}
      <Link
        to="/library"
        search={item ? { door: doorOf(item) } : {}}
        replace={item?.private}
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

/** The item with its page, once loaded: the card, its week on the timeline, and what it links to. Something has happened's guide has its switch. */
function Page({ item, ticks }: { item: Item; ticks: Record<string, string> }) {
  const page = use(pageOf(item));
  return (
    <>
      <ItemCard item={item} page={page} ticks={ticks} />
      {item.id === QUIET_ITEM ? <QuietSwitch /> : null}
      {item.from !== null ? (
        <Link
          to="/timeline"
          search={{ at: item.from }}
          replace={item.private}
          className="flex min-h-11 items-center gap-2 self-start text-sm text-fg-subtle hover:text-fg-normal"
        >
          <CalendarRange aria-hidden size={16} className="text-fg-brand" />
          See {weekLabel(item.from).toLowerCase()} on the timeline
        </Link>
      ) : null}
      <Related ids={page.related} />
    </>
  );
}

/**
 * A private entry's page: the quick exit, and its address kept out of the
 * address bar. Every link to one already masks it (ItemLink); one typed in or
 * opened from outside the app is masked here, in its place.
 */
function Private({ itemId }: { itemId: string }) {
  const navigate = useNavigate();
  // Shown by its own address: not while leaving, when the location is already the next page's and this one is still drawn.
  const bare = useRouterState({ select: (s) => s.location.pathname === `/library/${itemId}` && s.location.maskedLocation === undefined });
  useEffect(() => {
    // A state of its own, or the router would take it for the same place and change nothing.
    if (bare) navigate({ to: "/library/$itemId", params: { itemId }, mask: { to: "/library" }, state: (s) => ({ ...s, masked: true }), replace: true });
  }, [bare, itemId, navigate]);
  return <QuickExit />;
}
