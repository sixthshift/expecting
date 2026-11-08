import { getRouteApi, Navigate, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useDeferredValue, useEffect } from "react";
import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { useLayout } from "../../../app/hooks/useLayout";
import { isPrivateItem } from "../../../content";
import type { Item } from "../../../content/schema";
import { search } from "../../../lib/library/search";
import { useLibrarySearch } from "../contexts/LibrarySearchContext";
import { DoorOverview } from "../desktop/components/DoorOverview";
import { EntryBeside } from "../desktop/components/EntryBeside";
import { EntryList } from "../desktop/components/EntryList";
import { useItems } from "../hooks/useItems";
import { VirtualItemList } from "./itemList/VirtualItemList";
import { Shelf } from "./shelf/Shelf";

const route = getRouteApi("/app/library/");

/**
 * The Library's page in both worlds, all but its home: the results of its
 * search (the box is the frame's, `LibraryFrame`), a door or a topic opened in place (`?door=can-i`, `?topic=food`,
 * the `Shelf`), and otherwise the `home` it's given: `LibraryHome`
 * (`LibraryPage`), or while something has happened `QuietLibraryHome`
 * (`QuietLibraryPage`). On a desktop a door's shelf and a search are two columns, the
 * list narrower on the left and on the right the entry open from it
 * (`?entry=<id>`, `EntryBeside`), or while none is, the door's overview
 * (`DoorOverview`); a search opens what it found first. The home keeps its
 * width until an entry from Right now opens beside its list. A phone goes on
 * to the entry's own page.
 */
export function LibraryPageBody({ home }: { home: ReactNode }) {
  const items = useItems();
  const narrowing = route.useSearch();
  const { door, topic, entry } = narrowing;
  const navigate = useNavigate();
  const desktop = useLayout() === "desktop";
  // The entry beside follows the same way: drawing a whole entry mustn't hold up the letter that opened it.
  const beside = useDeferredValue(desktop && entry !== undefined && !isPrivateItem(entry) ? entry : null);
  // The box shows each letter at once; the results follow when React has time (a letter can find most of the Library).
  const q = useDeferredValue(useLibrarySearch().q);
  const results = q.trim() ? search(items, q) : null;

  // Arriving with words and nothing beside them (a link with ?q=): the first found opens, as typing would.
  // Only for words already in the address: typing opens its own first, and while a letter's way into the
  // address is under way this would write over the page it began from.
  const top = desktop && results && !entry && narrowing.q !== undefined && narrowing.q === q ? results.find((i) => !i.private) : undefined;
  useEffect(() => {
    if (top)
      void navigate({
        to: ".",
        search: { ...narrowing, entry: top.id },
        state: { list: results?.map((i) => i.id) },
        replace: true,
        resetScroll: false,
      });
  }, [top, results, narrowing, navigate]);

  // A phone has nothing beside a list: the entry is its own page.
  if (!desktop && entry !== undefined) return <Navigate to="/library/$itemId" params={{ itemId: entry }} replace />;
  const shelf = !results && Boolean(door || topic);
  // The list, and on a desktop beside it the entry open from it, or what stands in its place while none is,
  // so the page keeps its shape: a door's overview, a search's place kept. A search's entry has no close:
  // closed, it would open its first again. On the home, only Right now's entry, open beside its list.
  const aside = !desktop ? null : beside ? (
    <EntryBeside itemId={beside} closable={!results} />
  ) : shelf ? (
    <DoorOverview narrowing={narrowing} />
  ) : results ? (
    <Waiting />
  ) : null;
  const list = shelf ? <Shelf narrowing={narrowing} /> : results ? <Found q={q} results={results} /> : beside ? <EntryList itemId={beside} /> : home;

  return (
    // The page takes the width for its grids (the ways in, Right now, the topics); what's searched
    // for stays a list at a reading width. A door's shelf on a phone keeps the narrower page.
    <PillarLayout width={shelf && !desktop ? undefined : "full"} className="pt-4 desktop:pt-6">
      {/* The frame's search heads the page, so it has no title of its own to show; a shelf has its own. */}
      {shelf ? null : <h1 className="sr-only">Library</h1>}
      <div className={aside ? SPLIT : undefined}>
        <div className="flex min-w-0 flex-col">{list}</div>
        {aside}
      </div>
    </PillarLayout>
  );
}

/** What a search found, best first: every one of them, drawn as they scroll into view. */
function Found({ q, results }: { q: string; results: readonly Item[] }) {
  return (
    <section aria-label="Results" className="flex max-w-5xl flex-col gap-3">
      <p className="text-sm text-fg-subtle">{results.length === 0 ? `Nothing about "${q}" yet.` : `${results.length} found`}</p>
      {results.length > 0 ? <VirtualItemList items={results} /> : null}
    </section>
  );
}

/** The list, narrower, and beside it what's open. */
const SPLIT = "grid grid-cols-[minmax(20rem,2fr)_minmax(0,3fr)] items-start gap-8";

/** Beside a search on a desktop while nothing found can open there (none found, or only a private one): its place kept. */
function Waiting() {
  return (
    <aside
      aria-label="Nothing open"
      className="sticky top-[calc(var(--top-bar)+1.5rem)] rounded-xl border border-border-subtle border-dashed px-8 py-10 text-fg-subtle"
    >
      What you choose from the list opens here.
    </aside>
  );
}
