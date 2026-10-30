import { SearchInput } from "@sixthshift/design-system/search-input";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useNow } from "../../../api/rpc/settings";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import type { Item } from "../../../content/schema";
import { arrangeLibrary, type Shelf as ShelfData } from "../../../lib/library";
import { CanIDoor, IsThisNormalDoor, NobodyTellsYouDoor } from "../components/doors/Doors";
import { rangeLabel } from "../components/ItemCard";
import { ItemList } from "../components/ItemList";
import { RightNow } from "../components/rightNow/RightNow";
import { useItems } from "../hooks/useItems";

/** Whether an item matches what was typed: every word, in its title, the question it answers, its other names or its summary. */
function matches(item: Item, query: string): boolean {
  const text = `${item.title} ${item.ask ?? ""} ${item.aliases.join(" ")} ${item.summary ?? ""}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}

const route = getRouteApi("/app/library");

/** The Nobody tells you shelf's anchor, which its door goes down to. */
const SURPRISE_ANCHOR = "nobody-tells-you";

/**
 * Everything Expecting knows, by the question you came with: search first,
 * then the doors (Can I…?, Is this normal?, Nobody tells you), then what's open
 * right now, then everything on its shelf (src/lib/library.ts). Each item also
 * turns up on its week; here it can be found without knowing when.
 */
export function LibraryPage() {
  const items = useItems();
  const now = useNow();
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
        placeholder="Can I eat brie? Is spotting normal?"
        aria-label="Search the library"
        className="mb-8 h-12 text-base lg:max-w-2xl"
      />

      {results ? (
        <section aria-label="Results" className="flex flex-col gap-3">
          <p className="text-sm text-fg-subtle">{results.length === 0 ? `Nothing about "${q}" yet.` : `${results.length} found`}</p>
          <ItemList items={results} />
        </section>
      ) : (
        <div className="flex flex-col gap-10 lg:gap-12">
          <nav aria-label="Ways in" className="grid gap-2 sm:grid-cols-3 sm:gap-3 lg:gap-4">
            <CanIDoor />
            <IsThisNormalDoor />
            <NobodyTellsYouDoor count={items.filter((i) => i.surprise).length} anchor={SURPRISE_ANCHOR} />
          </nav>
          {now !== null ? <RightNow items={items} now={now} /> : null}
          <section aria-labelledby="everything" className="flex flex-col gap-6">
            <h2 id="everything" className="text-lg font-display font-semibold text-fg-strong">
              Everything, by topic
            </h2>
            <div className="flex flex-col gap-8">
              {shelves.map((shelf) => (
                <Shelf key={shelf.key} shelf={shelf}>
                  {shelf.surprise ? <SurpriseCards items={shelf.items} /> : <ItemList items={shelf.items} />}
                </Shelf>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Shelf({ shelf, children }: { shelf: ShelfData; children: ReactNode }) {
  return (
    <section aria-label={shelf.title} id={shelf.surprise ? SURPRISE_ANCHOR : undefined} className="flex scroll-mt-6 flex-col gap-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-fg-subtle uppercase">
        {shelf.surprise ? <Sparkles aria-hidden size={16} className="text-fg-brand" /> : null}
        {shelf.title}
      </h3>
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
            {item.summary ? <span className="text-sm text-fg-normal">{item.summary}</span> : null}
            <span className="mt-auto text-xs text-fg-subtle">{rangeLabel(item)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
