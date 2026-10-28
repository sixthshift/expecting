import { SearchInput } from "@sixthshift/design-system/search-input";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { Item } from "../../content/schema";
import { arrangeLibrary, type Shelf as ShelfData } from "../../lib/library";
import { PillarHeader } from "../app/PillarLayout";
import { useApp } from "../household/useApp";
import { rangeLabel } from "./ItemCard";
import { ItemList } from "./ItemList";

/** Whether an item matches what was typed: every word, in its title or body. */
function matches(item: Item, query: string): boolean {
  const text = `${item.title} ${item.body}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}

const route = getRouteApi("/app/library");

/**
 * Everything Expecting knows, to read any time: shelves (arranged by
 * src/lib/library.ts), and search across all of it. Each item also turns up on
 * its week; here it can be found without knowing when.
 */
export function LibraryPage() {
  const { items } = useApp();
  const { q = "" } = route.useSearch();
  const navigate = useNavigate();
  const results = q.trim() ? items.filter((i) => matches(i, q)) : null;
  const shelves = arrangeLibrary(items);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader title="Library" lead="Everything Expecting knows, to read any time. Each piece also turns up on its week." />
      <SearchInput
        value={q}
        onValueChange={(value) => navigate({ to: ".", search: { q: value || undefined }, replace: true })}
        placeholder="Search the library"
        aria-label="Search the library"
        className="mb-8 max-w-xl"
      />

      {results ? (
        <section aria-label="Results" className="flex flex-col gap-3">
          <p className="text-sm text-fg-subtle">{results.length === 0 ? `Nothing about "${q}" yet.` : `${results.length} found`}</p>
          <ItemList items={results} />
        </section>
      ) : (
        <div className="flex flex-col gap-10">
          {shelves.map((shelf) => (
            <Shelf key={shelf.key} shelf={shelf}>
              {shelf.surprise ? <SurpriseCards items={shelf.items} /> : <ItemList items={shelf.items} />}
            </Shelf>
          ))}
        </div>
      )}
    </main>
  );
}

function Shelf({ shelf, children }: { shelf: ShelfData; children: ReactNode }) {
  return (
    <section aria-label={shelf.title} className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-fg-subtle uppercase">
        {shelf.surprise ? <Sparkles aria-hidden size={16} className="text-fg-brand" /> : null}
        {shelf.title}
      </h2>
      {children}
    </section>
  );
}

function SurpriseCards({ items }: { items: readonly Item[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to="/library/$itemId"
            params={{ itemId: item.id }}
            className="flex h-full flex-col gap-2 rounded-xl border border-border-subtle bg-bg-normal p-4 hover:border-border-normal"
          >
            <span className="font-medium text-fg-strong">{item.title}</span>
            <span className="mt-auto text-xs text-fg-subtle">{rangeLabel(item)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
