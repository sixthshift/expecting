import { Card } from "@sixthshift/design-system/card";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useLists } from "../../../api/rpc/lists";
import { useQuiet } from "../../../api/rpc/quiet";
import { leftSaying, listsOf } from "../../../lib/lists";
import { AddList } from "../components/addList/AddList";
import { useLines } from "../hooks/useLines";

/**
 * The lists: what to get, a list per job. The built-in ones that have
 * something on them for you, then your own, each with what's left. While
 * something has happened, they're put away, not deleted.
 */
export function ListsPage() {
  const lines = useLines();
  const { data: lists } = useLists();
  const { data: quiet } = useQuiet();
  const all = listsOf(lines, lists.ownLists, lists.marks);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-8">
      <div className="flex max-w-3xl flex-col gap-6">
        <div>
          <Link to="/planner" className="-ml-2 mb-4 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal">
            <ArrowLeft aria-hidden size={16} /> Planner
          </Link>
          <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">Lists</h1>
          <p className="mt-1 max-w-prose text-fg-subtle">What to get, a list for each job, ticked off together.</p>
        </div>
        {quiet ? (
          <p className="max-w-prose text-sm text-fg-subtle">The lists are put away while Expecting is quiet. Nothing is deleted.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {all.map((list) => (
                <li key={list.id}>
                  <Link
                    to="/planner/lists/$listId"
                    params={{ listId: list.id }}
                    className="block rounded-xl focus-visible:ring-2 focus-visible:ring-border-focus"
                  >
                    <Card size="md" className="flex items-center gap-3 hover:bg-bg-normal-hovered">
                      <span className="flex flex-1 flex-col gap-0.5">
                        <span className="font-semibold text-fg-strong">{list.title}</span>
                        {list.about ? <span className="text-sm text-fg-normal">{list.about}</span> : null}
                        <span className="text-sm text-fg-subtle">{leftSaying(list.id, list)}</span>
                      </span>
                      <ChevronRight aria-hidden size={18} className="shrink-0 text-fg-subtle" />
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
            <AddList />
          </>
        )}
      </div>
    </main>
  );
}
