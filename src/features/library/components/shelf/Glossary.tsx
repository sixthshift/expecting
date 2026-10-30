import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import type { Group } from "../../../../lib/library";

const letterId = (letter: string) => `letter-${letter === "#" ? "other" : letter}`;

/**
 * The glossary, A to Z: a row of letters to jump by, then each term, which
 * opens in place to say what it means, with the way to its whole page.
 */
export function Glossary({ groups }: { groups: readonly Group[] }) {
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Letters" className="flex flex-wrap gap-1">
        {groups.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => document.getElementById(letterId(g.key))?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="flex size-9 items-center justify-center rounded-md text-sm font-medium text-fg-brand hover:bg-bg-brand-subtle"
          >
            {g.title}
          </button>
        ))}
      </nav>
      {groups.map((g) => (
        <section key={g.key} id={letterId(g.key)} aria-label={g.title} className="flex scroll-mt-6 flex-col gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">{g.title}</h2>
          <ul className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-bg-normal">
            {g.items.map((item) => (
              <li key={item.id}>
                <details className="group">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-2.5 hover:bg-bg-normal-hovered [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1 text-fg-strong">{item.title}</span>
                    <ChevronDown aria-hidden size={16} className="shrink-0 text-fg-subtle transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="flex flex-col gap-2 px-4 pb-4">
                    {item.aliases.length > 0 ? <p className="text-sm text-fg-subtle">Also called {item.aliases.join(", ")}</p> : null}
                    {item.summary ? <p className="text-fg-normal">{item.summary}</p> : null}
                    <Link to="/library/$itemId" params={{ itemId: item.id }} className="w-fit text-sm font-medium text-fg-brand underline">
                      Read more about {item.title}
                    </Link>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
