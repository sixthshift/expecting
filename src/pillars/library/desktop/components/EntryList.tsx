import { useRouterState } from "@tanstack/react-router";
import { useReadsQuery } from "../../../../api/rpc/reads";
import { Verdict } from "../../components/content/Verdict";
import { ItemLink } from "../../components/itemLink/ItemLink";
import { ReadMark } from "../../components/ReadMark";
import { useItems } from "../../hooks/useItems";

/**
 * The list an entry beside it was opened from, where the page has no list of
 * its own to keep (the Library's home: Right now): the ids ItemLink keeps in
 * the history entry, each a row, the one open marked. Only those still in
 * your Library.
 */
export function EntryList({ itemId }: { itemId: string }) {
  const items = useItems();
  const { data: reads } = useReadsQuery();
  const ids = useRouterState({ select: (s) => s.location.state.list }) ?? [itemId];
  const byId = new Map(items.map((i) => [i.id, i]));
  const shown = ids.flatMap((id) => {
    const found = byId.get(id);
    return found ? [found] : [];
  });
  return (
    <ul
      aria-label="The list it's in"
      className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-bg-normal"
    >
      {shown.map((entry) => (
        <li key={entry.id}>
          <ItemLink
            itemId={entry.id}
            list={ids}
            aria-current={entry.id === itemId ? "page" : undefined}
            className={`flex min-h-11 items-center gap-2 px-3 py-2 text-sm ${entry.id === itemId ? "bg-bg-brand-subtle font-medium text-fg-strong" : "text-fg-normal hover:bg-bg-normal-hovered"}`}
          >
            <span className="min-w-0 flex-1">{entry.title}</span>
            {entry.verdict ? <Verdict verdict={entry.verdict} size="sm" /> : null}
            {reads[entry.id] ? <ReadMark /> : null}
          </ItemLink>
        </li>
      ))}
    </ul>
  );
}
