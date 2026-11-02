import { SearchInput } from "@sixthshift/design-system/search-input";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { useNow } from "../../../api/rpc/settings";
import { search } from "../../../lib/library/search";
import { Doors } from "../components/doors/Doors";
import { HardDoor } from "../components/doors/HardDoor";
import { ItemList } from "../components/itemList/ItemList";
import { LibraryFrame } from "../components/LibraryFrame";
import { RightNow } from "../components/rightNow/RightNow";
import { Shelf } from "../components/shelf/Shelf";
import { Topics } from "../components/topics/Topics";
import { useItems } from "../hooks/useItems";

const route = getRouteApi("/app/library");

/**
 * Everything Expecting knows, by the question you came with (src/lib/library/doors.ts).
 * Its home lists none of the entries: search first, then the doors, what's open
 * right now, the topics, and the quiet door for when it's hard. A door or a
 * topic opens in place (`?door=can-i`, `?topic=food`), narrowed by chips. Each
 * item also turns up on its week; here it can be found without knowing when.
 * While something has happened, the quiet door comes first, and nothing is
 * open right now.
 */
export function LibraryPage() {
  const items = useItems();
  const now = useNow();
  const { data: quiet } = useQuietQuery();
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
      <LibraryFrame>
        <Shelf narrowing={narrowing} />
      </LibraryFrame>
    );
  }

  return (
    <LibraryFrame header>
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
        <div className="flex flex-col gap-10 lg:gap-12">
          {quiet ? <HardDoor /> : null}
          <Doors />
          {now !== null && !quiet ? <RightNow now={now} /> : null}
          <Topics />
          {quiet ? null : <HardDoor />}
        </div>
      )}
    </LibraryFrame>
  );
}
