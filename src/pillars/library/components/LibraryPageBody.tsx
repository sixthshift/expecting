import { SearchInput } from "@sixthshift/design-system/search-input";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { search } from "../../../lib/library/search";
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
 * the address.
 */
export function LibraryPageBody({ home }: { home: ReactNode }) {
  const items = useItems();
  const narrowing = route.useSearch();
  const { q: inAddress = "", door, topic } = narrowing;
  const navigate = useNavigate();
  // Words that find a private entry are held here, not in the address, which the browser's history keeps.
  const [held, setHeld] = useState<string | null>(null);
  const q = held ?? inAddress;
  const results = q.trim() ? search(items, q) : null;

  function onSearch(value: string) {
    const findsPrivate = value.trim() !== "" && search(items, value).some((i) => i.private);
    setHeld(findsPrivate ? value : null);
    navigate({ to: ".", search: { q: findsPrivate ? undefined : value || undefined }, replace: true, resetScroll: false });
  }

  if (!results && (door || topic)) {
    return (
      <PillarLayout rail={<LibraryRail />} className="pt-[max(1rem,env(safe-area-inset-top))] desktop:pt-8">
        <Shelf narrowing={narrowing} />
      </PillarLayout>
    );
  }

  return (
    <PillarLayout rail={<LibraryRail />} title="Library" lead="Everything Expecting knows, to read any time. Each piece also turns up on its week.">
      <SearchInput
        value={q}
        onValueChange={onSearch}
        placeholder="Can I eat brie? Is spotting normal?"
        aria-label="Search the library"
        className="mb-8 h-12 max-w-3xl text-base"
      />

      {results ? (
        <section aria-label="Results" className="flex flex-col gap-3">
          <p className="text-sm text-fg-subtle">{results.length === 0 ? `Nothing about "${q}" yet.` : `${results.length} found`}</p>
          <ItemList items={results} />
        </section>
      ) : (
        home
      )}
    </PillarLayout>
  );
}
