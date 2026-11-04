import { useLocation } from "@tanstack/react-router";
import { ChartGantt, ListChecks, ShoppingBasket } from "lucide-react";
import { useListsQuery } from "../../../../api/rpc/lists";
import { Rail, RailLink } from "../../../../app/desktop/components/Rail";
import { inPlanner, listsOf } from "../../../../lib/planner/lists/summaries";
import { useLines } from "../../features/lists/hooks/useLines";

/**
 * The Planner's places on a desktop, down the left of each of its pages: what
 * to do (with the appointments and the questions beside it), the chart across
 * the weeks, and the lists, each of them under Lists with what's still to get.
 * Only in the Planner's own world: while something has happened the chart
 * and the lists are put away, and its one page needs no rail.
 */
export function PlannerRail() {
  const { pathname } = useLocation();
  const lines = useLines();
  const { data: lists } = useListsQuery();
  const shown = listsOf(lines, lists.ownLists, lists.marks).filter(inPlanner);
  return (
    <Rail label="Planner">
      <RailLink to="/planner" icon={ListChecks} current={pathname === "/planner"}>
        To do
      </RailLink>
      <RailLink to="/planner/weeks" icon={ChartGantt} current={pathname === "/planner/weeks"}>
        Across the weeks
      </RailLink>
      <RailLink to="/planner/lists" icon={ShoppingBasket} current={pathname === "/planner/lists"}>
        Lists
      </RailLink>
      {shown.map((list) => (
        <RailLink
          key={list.id}
          to="/planner/lists/$listId"
          params={{ listId: list.id }}
          current={pathname === `/planner/lists/${list.id}`}
          nested
          count={list.left > 0 ? list.left : undefined}
        >
          {list.title}
        </RailLink>
      ))}
    </Rail>
  );
}
