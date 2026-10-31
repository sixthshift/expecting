import { Link } from "@tanstack/react-router";
import { ArrowLeft, ListTodo } from "lucide-react";
import { useLists } from "../../../api/rpc/lists";
import { useQuiet } from "../../../api/rpc/quiet";
import { inPlanner, listsOf } from "../../../lib/lists";
import { AddList } from "../components/addList/AddList";
import { ListCard } from "../components/listCard/ListCard";
import { useLines } from "../hooks/useLines";

/**
 * The lists: what to get, a list per job. The built-in ones that have
 * something on them for you, each a card with where it's up to and what's
 * next; then your own, and a new one. While something has happened, they're
 * put away, not deleted.
 */
export function ListsPage() {
  const lines = useLines();
  const { data: lists } = useLists();
  const { data: quiet } = useQuiet();
  const all = listsOf(lines, lists.ownLists, lists.marks).filter(inPlanner);
  const builtIn = all.filter((l) => l.origin === "built-in");
  const own = all.filter((l) => l.origin === "own");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-8">
      <div className="flex flex-col gap-8">
        <div>
          <Link to="/planner" className="-ml-2 mb-4 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal">
            <ArrowLeft aria-hidden size={16} /> Planner
          </Link>
          <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">Lists</h1>
          <p className="mt-1 max-w-prose text-fg-subtle">What to get, a list for each job, ticked off together wherever you are.</p>
        </div>
        {quiet ? (
          <p className="max-w-prose text-sm text-fg-subtle">The lists are put away while Expecting is quiet. Nothing is deleted.</p>
        ) : (
          <>
            {builtIn.length > 0 ? (
              <ul className="grid gap-4 lg:grid-cols-2">
                {builtIn.map((list) => (
                  <li key={list.id}>
                    <ListCard list={list} />
                  </li>
                ))}
              </ul>
            ) : null}
            <section aria-labelledby="your-lists" className="flex flex-col gap-4">
              <h2 id="your-lists" className="text-lg font-display font-semibold text-fg-strong">
                Your lists
              </h2>
              {own.length > 0 ? (
                <ul className="grid gap-4 lg:grid-cols-2">
                  {own.map((list) => (
                    <li key={list.id}>
                      <ListCard list={list} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex max-w-xl items-start gap-3 rounded-xl border border-dashed border-border-normal p-4">
                  <ListTodo aria-hidden size={18} className="mt-0.5 shrink-0 text-fg-subtle" />
                  <p className="text-sm text-fg-normal">
                    For anything Expecting doesn't know: a Bunnings run, what to ask Mum to bring, the market on Saturday. You both see it and tick it.
                  </p>
                </div>
              )}
              <AddList />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
