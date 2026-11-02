import { ExternalLink } from "lucide-react";
import type { ISODate } from "../../../../lib/dates";
import { fullDate } from "../../../../lib/labels";
import { useEntry } from "../../contexts/LibraryItemPageContext";

/** Where every claim comes from, and when a second reader last checked them. */
export function Sources() {
  const { page } = useEntry();
  if (page.sources.length === 0) return null;
  return (
    <div className="flex flex-col gap-1 border-t border-border-subtle pt-3 text-xs text-fg-subtle">
      <h2 className="font-semibold tracking-wide uppercase">{page.sources.length === 1 ? "Source" : "Sources"}</h2>
      <ul className="flex flex-col gap-1">
        {page.sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
              {source.title}
              <ExternalLink aria-hidden size={12} />
            </a>
          </li>
        ))}
      </ul>
      {page.checked ? <p>Checked against them {fullDate(page.checked as ISODate)}</p> : null}
    </div>
  );
}
