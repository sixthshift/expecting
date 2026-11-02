import { Card } from "@sixthshift/design-system/card";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useListsQuery } from "../../../../api/rpc/lists";
import { inPlanner, leftSaying, listsOf } from "../../../../lib/lists";
import { useLines } from "../../hooks/useLines";
import { listIcon } from "../icons";

/** The Planner's way into the lists: each with what's left on it, and all of them. */
export function ListsWayIn() {
  const lines = useLines();
  const { data: lists } = useListsQuery();
  const all = listsOf(lines, lists.ownLists, lists.marks).filter(inPlanner);

  return (
    <section aria-labelledby="lists-heading" className="flex flex-col gap-3">
      <h2 id="lists-heading" className="text-lg font-display font-semibold text-fg-strong">
        Lists
      </h2>
      <Card size="md" className="flex flex-col">
        {all.map((list) => {
          const Icon = listIcon(list.id);
          return (
            <Link
              key={list.id}
              to="/planner/lists/$listId"
              params={{ listId: list.id }}
              className="flex min-h-11 items-center justify-between gap-3 text-fg-normal hover:text-fg-strong"
            >
              <span className="flex items-center gap-2 font-medium">
                <Icon aria-hidden size={16} className="text-fg-brand" />
                {list.title}
              </span>
              <span className="flex items-center gap-1 text-sm text-fg-subtle">
                {leftSaying(list.id, list)}
                <ChevronRight aria-hidden size={16} />
              </span>
            </Link>
          );
        })}
        <Link to="/planner/lists" className="flex min-h-11 items-center text-sm text-fg-subtle underline hover:text-fg-normal">
          {all.length === 0 ? "Start a list of your own" : "All lists, and one of your own"}
        </Link>
      </Card>
    </section>
  );
}
