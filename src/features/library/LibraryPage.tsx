import { SearchInput } from "@sixthshift/design-system/search-input";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { PillarHeader } from "../../app/Frame";
import { useApp } from "../../app/useApp";
import { rangeLabel } from "../../components/ItemCard";
import { CATEGORIES, type Category, type Item } from "../../content/schema";

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
 * Everything Expecting knows, to read any time: the shelf of things nobody tells
 * you, then a shelf for each topic. Each item also turns up on its week in the
 * timeline; here it can be found without knowing when.
 */
export function LibraryPage() {
  const { items } = useApp();
  const { q = "" } = route.useSearch();
  const navigate = useNavigate({ from: "/library" });
  const results = q.trim() ? items.filter((i) => matches(i, q)) : null;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader title="Library" lead="Everything Expecting knows, to read any time. Each piece also turns up on its week in the timeline." />
      <SearchInput
        value={q}
        onValueChange={(value) => navigate({ search: { q: value || undefined }, replace: true })}
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
          <Shelf title="Nobody tells you" icon>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items
                .filter((i) => i.surprise)
                .map((item) => (
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
          </Shelf>
          {(Object.keys(CATEGORIES) as Category[]).map((category) => {
            const shelf = items.filter((i) => i.category === category);
            return shelf.length > 0 ? (
              <Shelf key={category} title={CATEGORIES[category]}>
                <ItemList items={shelf} />
              </Shelf>
            ) : null;
          })}
        </div>
      )}
    </main>
  );
}

function Shelf({ title, icon = false, children }: { title: string; icon?: boolean; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-fg-subtle uppercase">
        {icon ? <Sparkles aria-hidden size={16} className="text-fg-brand" /> : null}
        {title}
      </h2>
      {children}
    </section>
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
