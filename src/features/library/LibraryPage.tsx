import { SearchInput } from "@sixthshift/design-system/search-input";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { type ReactNode, useState } from "react";
import type { Item } from "../../content/schema";
import { arrangeLibrary, type Shelf as ShelfData } from "../../lib/library";
import { PillarHeader } from "../app/PillarLayout";
import { usePhaseApp } from "../app/usePhaseApp";
import { useApp } from "../household/useApp";
import { rangeLabel } from "./ItemCard";

const route = getRouteApi("/app/library");

/** Whether an item matches what was typed: every word, in its title or body. */
function matches(item: Item, query: string): boolean {
  const text = `${item.title} ${item.body}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}

/**
 * Everything Expecting knows, to read any time: shelves in the order the
 * phase's app asks for (`usePhaseApp().library`, arranged by
 * src/lib/library.ts), and search across all of it. Each item also turns up on
 * its week; here it can be found without knowing when.
 */
export function LibraryPage() {
  const { items, phase } = useApp();
  const { library } = usePhaseApp();
  const { q = "" } = route.useSearch();
  const navigate = useNavigate({ from: "/library" });
  const results = q.trim() ? items.filter((i) => matches(i, q)) : null;
  const shelves = arrangeLibrary(items, phase, library);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader title="Library" lead="Everything Expecting knows, to read any time. Each piece also turns up on its week." />
      <SearchInput
        value={q}
        onValueChange={(value) => navigate({ search: { q: value || undefined }, replace: true })}
        placeholder={library.search}
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
  const [open, setOpen] = useState(!shelf.folded);
  const heading = (
    <>
      {shelf.surprise ? <Sparkles aria-hidden size={16} className="text-fg-brand" /> : null}
      {shelf.title}
      {shelf.folded ? <span className="font-normal normal-case tracking-normal">{shelf.items.length}</span> : null}
    </>
  );
  return (
    <section aria-label={shelf.title} className="flex flex-col gap-3">
      {shelf.folded ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 items-center gap-2 self-start text-sm font-semibold tracking-wide text-fg-subtle uppercase hover:text-fg-normal"
        >
          {heading}
          <ChevronDown aria-hidden size={16} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
      ) : (
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-fg-subtle uppercase">{heading}</h2>
      )}
      {open ? children : null}
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

function ItemList({ items }: { items: readonly Item[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-bg-normal">
      {items.map((item) => (
        <li key={item.id}>
          <Link to="/library/$itemId" params={{ itemId: item.id }} className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-bg-normal-hovered">
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-fg-strong">{item.title}</span>
              <span className="text-xs text-fg-subtle">
                {rangeLabel(item)}
                {item.surprise ? " · nobody tells you" : ""}
              </span>
            </span>
            <ChevronRight aria-hidden size={18} className="shrink-0 text-fg-subtle" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
