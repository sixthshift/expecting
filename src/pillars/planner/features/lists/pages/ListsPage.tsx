import { ListTodo } from "lucide-react";
import { PillarLayout } from "../../../../../app/components/layout/PillarLayout";
import { inPlanner } from "../../../../../lib/planner/lists/summaries";
import { PlannerTabs } from "../../../components/PlannerTabs";
import { PlannerRail } from "../../../desktop/components/PlannerRail";
import { AddList } from "../components/addList/AddList";
import { ListCard } from "../components/listCard/ListCard";
import { useListSummaries } from "../hooks/useLines";

/**
 * The lists: what to get, a list for each purpose. The built-in ones that have
 * something on them for you, each a card with where it's up to and what's
 * next; then your own, and a new one. While something has happened, they're
 * put away, not deleted: the route draws its quiet world (`putAway`).
 */
export function ListsPage() {
  const all = useListSummaries().filter(inPlanner);
  const builtIn = all.filter((l) => l.origin === "built-in");
  const own = all.filter((l) => l.origin === "own");

  return (
    <PillarLayout
      rail={<PlannerRail />}
      tabs={{ title: "Planner", nav: <PlannerTabs /> }}
      width="full"
      back={{ to: "/planner", label: "Planner" }}
      title="Lists"
      lead="What to get, a list for each part of getting ready, ticked off together wherever you are."
      className="gap-8"
    >
      {builtIn.length > 0 ? (
        <ul className="grid gap-4 desktop:grid-cols-2 desktop:2xl:grid-cols-3">
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
          <ul className="grid gap-4 desktop:grid-cols-2 desktop:2xl:grid-cols-3">
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
    </PillarLayout>
  );
}
