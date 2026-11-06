import { useLocation, useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useLayout } from "../../../app/hooks/useLayout";
import { search } from "../../../lib/library/search";
import { useItems } from "../hooks/useItems";

type LibrarySearch = {
  /** The words searched: the address's `?q=`, or words held here because they find a private entry. */
  q: string;
  /** Search for `value`, from any of the Library's pages: to its results, the first open beside them on a desktop. */
  onSearch: (value: string) => void;
};

const LibrarySearchContext = createContext<LibrarySearch | null>(null);

/**
 * The Library's search, for every page in it (`LibraryFrame`): what's
 * searched, and searching. Words that find a private entry are held here, not
 * in the address the browser's history keeps, and only on the page they were
 * typed on. On a desktop a search opens what it found first beside it, chosen
 * with the words in the same step, so the entry beside never blinks out
 * between two letters; never a private entry, which keeps out of the address.
 */
export function LibrarySearchProvider({ children }: { children: ReactNode }) {
  const items = useItems();
  const desktop = useLayout() === "desktop";
  const navigate = useNavigate();
  const router = useRouter();
  const pathname = useLocation({ select: (l) => l.pathname });
  const inAddress = useSearch({ strict: false, select: (s: { q?: string }) => s.q ?? "" });
  const [held, setHeld] = useState<string | null>(null);
  // The same, as of the last letter typed rather than the last drawn: letters come faster than the page.
  const holding = useRef<string | null>(null);
  const atSearch = pathname === "/library";
  const q = held !== null && atSearch ? held : inAddress;
  // Held words go with the page they were typed on.
  useEffect(() => {
    if (!atSearch) {
      holding.current = null;
      setHeld(null);
    }
  }, [atSearch]);

  function onSearch(value: string) {
    const found = value.trim() !== "" ? search(items, value) : [];
    const findsPrivate = found.some((i) => i.private);
    const first = desktop ? found.find((i) => !i.private) : undefined;
    // A search under way, as the address is now (not as last drawn): its words there, or held.
    const now = router.latestLocation;
    const searching = now.pathname === "/library" && (Boolean((now.search as { q?: string }).q) || holding.current !== null);
    holding.current = findsPrivate ? value : null;
    setHeld(holding.current);
    void navigate({
      to: "/library",
      search: { q: findsPrivate ? undefined : value || undefined, entry: first?.id },
      state: { list: found.map((i) => i.id) },
      // A search is a step in the history, so Back returns to where it began (the Library's home, a
      // door, an entry); each letter after the first takes the last one's place.
      replace: searching,
      resetScroll: now.pathname !== "/library",
    });
  }

  return <LibrarySearchContext.Provider value={{ q, onSearch }}>{children}</LibrarySearchContext.Provider>;
}

export function useLibrarySearch(): LibrarySearch {
  const value = useContext(LibrarySearchContext);
  if (!value) throw new Error("useLibrarySearch is used inside LibrarySearchProvider (LibraryFrame).");
  return value;
}
