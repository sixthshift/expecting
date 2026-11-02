import { getRouteApi, Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, Suspense, use, useEffect, useRef } from "react";
import { useChecklistQuery } from "../../../api/rpc/checklist";
import { useExtrasQuery } from "../../../api/rpc/extras";
import { useAnswersQuery } from "../../../api/rpc/facts";
import { readsSaves, useReadsQuery } from "../../../api/rpc/reads";
import { useSave } from "../../../app/hooks/useSave";
import { Skeleton, SkeletonText } from "../../../components/loading/Skeleton";
import { NothingHere } from "../../../components/NothingHere";
import { builtInItems, isPrivateItem } from "../../../content";
import type { Item } from "../../../content/schema";
import { extrasOn } from "../../../lib/extras";
import { factsOf } from "../../../lib/facts";
import { weekInSentence } from "../../../lib/labels";
import { cluesIn } from "../../../lib/library/clues";
import { DOOR_INFO, type Door, doorOf } from "../../../lib/library/doors";
import { QUIET_ITEM } from "../../../lib/quiet";
import { PapersAbout } from "../../journal/components/entries/papers/PaperList";
import { QuestionsAbout } from "../../questions/components/QuestionsAbout";
import { QuietSwitch } from "../../quiet/components/quietSwitch/QuietSwitch";
import { extra } from "../../settings/model/extras";
import { AskAtAppointment } from "../components/askAtAppointment/AskAtAppointment";
import { ItemCard } from "../components/ItemCard";
import { ItemLink } from "../components/itemLink/ItemLink";
import { LookFor } from "../components/lookFor/LookFor";
import { QuickExit } from "../components/private/QuickExit";
import { Related } from "../components/related/Related";
import { useItems } from "../hooks/useItems";
import { useSwipe } from "../hooks/useSwipe";
import { pageOf } from "../model/pageOf";

const route = getRouteApi("/app/library/$itemId");

/** One item on its own page, with the way to its week in the whole pregnancy. */
export function LibraryItemPage() {
  const { itemId } = route.useParams();
  const { data: checklist } = useChecklistQuery();
  const items = useItems();
  const { data: facts } = useAnswersQuery({ select: factsOf });
  const { data: extras } = useExtrasQuery({ select: extrasOn });
  const item = items.find((i) => i.id === itemId);
  // Hidden by an answer, rather than not there at all: say so, and open settings at it.
  const hidden = item ? undefined : builtInItems.find((i) => i.id === itemId);
  const offExtra = hidden?.extra && !extras.has(hidden.extra) ? extra(hidden.extra) : undefined;
  const hiddenBy = hidden ? Object.entries(hidden.when).find(([key, answers]) => facts[key] !== undefined && !answers.includes(facts[key]))?.[0] : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-8">
      <div className="max-w-3xl">
        {item?.private ? <Private itemId={item.id} /> : null}
        <WayBack item={item} />
        {item ? (
          <Through item={item} items={items}>
            <Suspense fallback={<ItemSkeleton title={item.title} />}>
              <Page item={item} ticks={checklist.ticks} />
            </Suspense>
          </Through>
        ) : hidden ? (
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
              ) : (
                <>
                  Your answers in{" "}
                  <Link to="/settings" search={{ ask: hiddenBy }} className="underline">
                    settings
                  </Link>{" "}
                  say this one doesn't apply to you. Change an answer and it comes back.
                </>
              )}
            </p>
          </div>
        ) : (
          // No entry by this name: an old or cut-short link. Look for what it meant.
          <div className="flex flex-col gap-6">
            <NothingHere title="Not in the Library" />
            <LookFor key={itemId} clues={cluesIn(itemId)} />
          </div>
        )}
      </div>
    </main>
  );
}

/** The item with its page, once loaded: the card, a question to ask at the next appointment and those asked from it, the papers you kept about it, its week in the whole pregnancy, and what it links to. Something has happened's guide has its switch. */
function Page({ item, ticks }: { item: Item; ticks: Record<string, string> }) {
  const page = use(pageOf(item));
  // Opened is read: marked once its words are on the page. Never a private entry, which leaves no trace.
  const { data: read } = useReadsQuery({ select: (reads) => Boolean(reads[item.id]) });
  const markRead = useSave(readsSaves.markRead);
  useEffect(() => {
    if (!item.private && !read) markRead({ itemId: item.id });
  }, [item.id, item.private, read, markRead]);
  return (
    <>
      <ItemCard item={item} page={page} ticks={ticks} />
      {item.id === QUIET_ITEM ? <QuietSwitch /> : null}
      <AskAtAppointment item={item} page={page} />
      {/* What you kept about it: never under a private entry, which nothing can point at. */}
      {item.private ? null : <QuestionsAbout itemId={item.id} />}
      {item.private ? null : <PapersAbout itemId={item.id} />}
      {item.from !== null ? (
        <Link
          to="/timeline"
          search={{ at: item.from }}
          replace={item.private}
          className="flex min-h-11 items-center gap-2 self-start text-sm text-fg-subtle hover:text-fg-normal"
        >
          <CalendarRange aria-hidden size={16} className="text-fg-brand" />
          See {weekInSentence(item.from)} in the whole pregnancy
        </Link>
      ) : null}
      <Related ids={page.related} />
    </>
  );
}

/**
 * Back to where it was found. Opened from one of the Library's lists, that's
 * Back, to the list as you left it, scrolled where you were (the router keeps
 * the Library's places, src/router.tsx). Otherwise, the door it's behind; from
 * a private entry, in its place in the history.
 */
function WayBack({ item }: { item: Item | undefined }) {
  const router = useRouter();
  const from = useRouterState({ select: (s) => s.location.state.from });
  const list = from !== undefined && from.split("?")[0] === "/library" ? new URLSearchParams(from.split("?")[1] ?? "") : undefined;
  const door = list?.get("door");
  const label = list ? (door && door in DOOR_INFO ? DOOR_INFO[door as Door].title : "Library") : item ? DOOR_INFO[doorOf(item)].title : "Library";
  return (
    <Link
      to="/library"
      search={item ? { door: doorOf(item) } : {}}
      replace={item?.private}
      onClick={(e) => {
        if (!list) return;
        e.preventDefault();
        router.history.back();
      }}
      className="-ml-2 mb-4 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal"
    >
      <ArrowLeft aria-hidden size={16} /> {label}
    </Link>
  );
}

/**
 * An entry opened from a list (its ids kept in the history entry, by ItemLink):
 * swipe left for the next in it, right for the one before, or the links at the
 * foot. Each takes this page's place in the history, so Back is to the list.
 * Only those still in your Library: one an answer hides is passed over.
 */
function Through({ item, items, children }: { item: Item; items: readonly Item[]; children: ReactNode }) {
  const list = useRouterState({ select: (s) => s.location.state.list });
  const from = useRouterState({ select: (s) => s.location.state.from });
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const ids = list?.filter((id) => items.some((i) => i.id === id)) ?? [];
  const at = ids.indexOf(item.id);
  const [before, after] = at < 0 ? [] : [items.find((i) => i.id === ids[at - 1]), items.find((i) => i.id === ids[at + 1])];
  const go = (to: Item | undefined) =>
    to &&
    list &&
    navigate({
      to: "/library/$itemId",
      params: { itemId: to.id },
      mask: isPrivateItem(to.id) ? { to: "/library" } : undefined,
      state: { list, from },
      replace: true,
    });
  useSwipe(ref, { onLeft: after && (() => go(after)), onRight: before && (() => go(before)) });

  return (
    <div ref={ref} className="flex flex-col gap-4">
      {children}
      {before || after ? (
        <nav aria-label="Through the list" className="mt-2 grid grid-cols-2 gap-3 border-t border-border-subtle pt-4">
          {before ? (
            <ItemLink itemId={before.id} list={list} replace className="flex min-h-11 items-start gap-1 rounded-md text-sm text-fg-subtle hover:text-fg-normal">
              <ChevronLeft aria-hidden size={16} className="mt-0.5 shrink-0" />
              <span className="flex flex-col">
                <span className="text-xs">Previous</span>
                <span className="text-fg-normal">{before.title}</span>
              </span>
            </ItemLink>
          ) : (
            <span />
          )}
          {after ? (
            <ItemLink
              itemId={after.id}
              list={list}
              replace
              className="flex min-h-11 items-start justify-end gap-1 rounded-md text-right text-sm text-fg-subtle hover:text-fg-normal"
            >
              <span className="flex flex-col">
                <span className="text-xs">Next</span>
                <span className="text-fg-normal">{after.title}</span>
              </span>
              <ChevronRight aria-hidden size={16} className="mt-0.5 shrink-0" />
            </ItemLink>
          ) : null}
        </nav>
      ) : null}
    </div>
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

/** The entry's card while its words come (seldom seen: the route loads them first): its title, already known, then lines where the words go. */
function ItemSkeleton({ title }: { title: string }) {
  return (
    <div role="status" aria-label={`Opening ${title}`} className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-bg-normal p-4 lg:p-6">
      <Skeleton className="h-5 w-32" />
      <h1 className="text-2xl font-display font-semibold text-fg-strong">{title}</h1>
      <SkeletonText lines={3} />
      <SkeletonText lines={5} className="mt-2" />
    </div>
  );
}
