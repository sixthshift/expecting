import { SearchInput } from "@sixthshift/design-system/search-input";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { closest, search } from "../../../../lib/library";
import { useItems } from "../../hooks/useItems";
import { ItemList } from "../ItemList";

/**
 * Where an address that leads nowhere might have meant: a search filled from
 * its words, and the few entries closest to them. What's typed here stays on
 * the page, and the way on to the Library carries it only when it finds
 * nothing private.
 */
export function LookFor({ clues }: { clues: string }) {
  const items = useItems();
  const [words, setWords] = useState(clues);
  const found = closest(items, words);
  const findsPrivate = words.trim() !== "" && search(items, words).some((i) => i.private);

  return (
    <section aria-label="Looking for" className="flex flex-col gap-3">
      <SearchInput value={words} onValueChange={setWords} placeholder="What were you looking for?" aria-label="Search the library" className="h-12 text-base" />
      {found.length > 0 ? (
        <>
          <p className="text-sm text-fg-subtle">{words === clues ? "Maybe one of these:" : "Closest in the Library:"}</p>
          <ItemList items={found} />
        </>
      ) : words.trim() !== "" ? (
        <p className="text-sm text-fg-subtle">Nothing in the Library by that name.</p>
      ) : null}
      {words.trim() !== "" ? (
        <Link
          to="/library"
          search={findsPrivate ? {} : { q: words.trim() }}
          className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal"
        >
          Search the whole Library
          <ChevronRight aria-hidden size={16} />
        </Link>
      ) : null}
    </section>
  );
}
