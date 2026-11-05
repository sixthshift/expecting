import { SearchInput } from "@sixthshift/design-system/search-input";
import { getRouteApi, Navigate, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { useLayout } from "../../../app/hooks/useLayout";
import { isPrivateItem } from "../../../content";
import { search } from "../../../lib/library/search";
import { DoorOverview } from "../desktop/components/DoorOverview";
import { EntryBeside } from "../desktop/components/EntryBeside";
import { EntryList } from "../desktop/components/EntryList";
import { LibraryRail } from "../desktop/components/LibraryRail";
import { useItems } from "../hooks/useItems";
import { ItemList } from "./itemList/ItemList";
import { Shelf } from "./shelf/Shelf";

const route = getRouteApi("/app/library/");

/**
 * The Library's page in both worlds, all but its home: the search and its
 * results, a door or a topic opened in place (`?door=can-i`, `?topic=food`,
 * the `Shelf`), and otherwise the `home` it's given: `LibraryHome`
 * (`LibraryPage`), or while something has happened `QuietLibraryHome`
 * (`QuietLibraryPage`). Words that find a private entry are held here, not in
 * the address. On a desktop a door's shelf and a search are two columns, the
 * list narrower on the left and on the right the entry open from it
 * (`?entry=<id>`, `EntryBeside`), or while none is, the door's overview
 * (`DoorOverview`); a search opens what it found first. The home keeps its
 * width until an entry from Right now opens beside its list. A phone goes on
 * to the entry's own page.
 */
export function LibraryPageBody({ home }: { home: ReactNode }) {
  const items = useItems();
  const narrowing = route.useSearch();
  const { q: inAddress = "", door, topic, entry } = narrowing;
  const navigate = useNavigate();
  const desktop = useLayout() === "desktop";
  const beside = desktop && entry !== undefined && !isPrivateItem(entry) ? entry : null;
  // Words that find a private entry are held here, not in the address, which the browser's history keeps.
  const [held, setHeld] = useState<string | null>(null);
  const q = held ?? inAddress;
  const results = q.trim() ? search(items, q) : null;

  function onSearch(value: string) {
    const findsPrivate = value.trim() !== "" && search(items, value).some((i) => i.private);
    setHeld(findsPrivate ? value : null);
    navigate({ to: ".", search: { q: findsPrivate ? undefined : value || undefined }, replace: true, resetScroll: false });
  }

  // On a desktop a search opens what it found first beside it, in the address like any other, so it's
  // marked in the list and Back is to the search; never a private entry, which keeps out of the address.
  const top = desktop && results && !entry ? results.find((i) => !i.private) : undefined;
  useEffect(() => {
    if (top)
      void navigate({
        to: ".",
        search: (prev: Record<string, unknown>) => ({ ...prev, entry: top.id }),
        state: { list: results?.map((i) => i.id) },
        replace: true,
        resetScroll: false,
      });
  }, [top, results, navigate]);

  // A phone has nothing beside a list: the entry is its own page.
  if (!desktop && entry !== undefined) return <Navigate to="/library/$itemId" params={{ itemId: entry }} replace />;
  // The list, narrower, and beside it the entry open, or what stands in its place while none is: the
  // page keeps its shape either way. A search's has no close: closed, it would open its first again.
  const split = (list: ReactNode, waiting: ReactNode) => (
    <div className="grid grid-cols-[minmax(20rem,2fr)_minmax(0,3fr)] items-start gap-8">
      <div className="flex min-w-0 flex-col">{list}</div>
      {beside ? <EntryBeside itemId={beside} closable={!results} /> : waiting}
    </div>
  );

  if (!results && (door || topic)) {
    return (
      <PillarLayout rail={<LibraryRail />} width={desktop ? "full" : undefined} className="pt-[max(1rem,env(safe-area-inset-top))] desktop:pt-8">
        {desktop ? split(<Shelf narrowing={narrowing} />, <DoorOverview narrowing={narrowing} />) : <Shelf narrowing={narrowing} />}
      </PillarLayout>
    );
  }

  const searchBox = (
    <SearchInput
      value={q}
      onValueChange={onSearch}
      placeholder="Can I eat brie? Is spotting normal?"
      aria-label="Search the library"
      className="mb-8 h-12 max-w-3xl text-base"
    />
  );
  const found = results ? (
    <section aria-label="Results" className="flex max-w-5xl flex-col gap-3">
      <p className="text-sm text-fg-subtle">{results.length === 0 ? `Nothing about "${q}" yet.` : `${results.length} found`}</p>
      <ItemList items={results} />
    </section>
  ) : null;

  return (
    // The page takes the width for its grids (the ways in, Right now, the topics); what's searched
    // for stays a list at a reading width. A door's shelf (above) keeps the narrower page.
    <PillarLayout
      rail={<LibraryRail />}
      width="full"
      title="Library"
      lead="Everything Expecting knows, to read any time. Each piece also turns up on its week."
    >
      {desktop && results ? (
        split(
          <>
            {searchBox}
            {found}
          </>,
          <Waiting />
        )
      ) : desktop && beside ? (
        split(
          <>
            {searchBox}
            <EntryList itemId={beside} />
          </>,
          null
        )
      ) : (
        <>
          {searchBox}
          {found ?? home}
        </>
      )}
    </PillarLayout>
  );
}

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
