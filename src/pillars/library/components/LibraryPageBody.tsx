import { SearchInput } from "@sixthshift/design-system/search-input";
import { getRouteApi, Navigate, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { useLayout } from "../../../app/hooks/useLayout";
import { isPrivateItem } from "../../../content";
import { search } from "../../../lib/library/search";
import { EntryReader } from "../desktop/components/EntryReader";
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
 * the address. An entry opened from it (`?entry=<id>`) is read over it on a
 * desktop (`EntryReader`); a phone has no reader, so it goes on to the
 * entry's page.
 */
export function LibraryPageBody({ home }: { home: ReactNode }) {
  const items = useItems();
  const narrowing = route.useSearch();
  const { q: inAddress = "", door, topic, entry } = narrowing;
  const navigate = useNavigate();
  const desktop = useLayout() === "desktop";
  // Words that find a private entry are held here, not in the address, which the browser's history keeps.
  const [held, setHeld] = useState<string | null>(null);
  const q = held ?? inAddress;
  const results = q.trim() ? search(items, q) : null;

  function onSearch(value: string) {
    const findsPrivate = value.trim() !== "" && search(items, value).some((i) => i.private);
    setHeld(findsPrivate ? value : null);
    navigate({ to: ".", search: { q: findsPrivate ? undefined : value || undefined }, replace: true, resetScroll: false });
  }

  const reader =
    entry === undefined || isPrivateItem(entry) ? null : desktop ? (
      <EntryReader itemId={entry} />
    ) : (
      <Navigate to="/library/$itemId" params={{ itemId: entry }} replace />
    );

  if (!results && (door || topic)) {
    return (
      <PillarLayout rail={<LibraryRail />} className="pt-[max(1rem,env(safe-area-inset-top))] desktop:pt-8">
        <Shelf narrowing={narrowing} />
        {reader}
      </PillarLayout>
    );
  }

  return (
    // The page takes the width for its grids (the ways in, Right now, the topics); what's searched
    // for stays a list at a reading width. A door's shelf (above) keeps the narrower page.
    <PillarLayout
      rail={<LibraryRail />}
      width="full"
      title="Library"
      lead="Everything Expecting knows, to read any time. Each piece also turns up on its week."
    >
      <SearchInput
        value={q}
        onValueChange={onSearch}
        placeholder="Can I eat brie? Is spotting normal?"
        aria-label="Search the library"
        className="mb-8 h-12 max-w-3xl text-base"
      />

      {results ? (
        <section aria-label="Results" className="flex max-w-5xl flex-col gap-3">
          <p className="text-sm text-fg-subtle">{results.length === 0 ? `Nothing about "${q}" yet.` : `${results.length} found`}</p>
          <ItemList items={results} />
        </section>
      ) : (
        home
      )}
      {reader}
    </PillarLayout>
  );
}
