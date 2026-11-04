import { getRouteApi } from "@tanstack/react-router";
import { PillarLayout } from "../../../../../app/components/layout/PillarLayout";
import { listBack } from "../../../../../lib/planner/lists/builtIn";
import { PlannerRail } from "../../../desktop/components/PlannerRail";
import { AddLine } from "../components/addLine/AddLine";
import { ListHeading } from "../components/heading/ListHeading";
import { Sections } from "../components/sections/Sections";
import { ListPageProvider, useListPage } from "../contexts/ListPageContext";

const route = getRouteApi("/app/planner/lists/$listId");

/**
 * One list: where it's up to, then its sections as cards (flowing down two
 * columns on a desktop), each line with its tick, what's left first. "Just what's left"
 * hides the got, for the shop. Your own lines are added at the foot, the
 * not-needed folded under them. A list of your own can be renamed or
 * deleted. A list that isn't here (deleted on the other phone, or a built-in
 * one with nothing on it for you) says so. What the page works out once is
 * `ListPageProvider`; each part reads it. While something has happened, the
 * lists are put away: the route draws its quiet world (`putAway`).
 */
export function ListPage() {
  const { listId } = route.useParams();
  return (
    <ListPageProvider listId={listId}>
      <List />
    </ListPageProvider>
  );
}

function List() {
  const { listId, summary } = useListPage();
  return (
    <PillarLayout rail={<PlannerRail />} className="gap-6" back={listBack(listId)}>
      {!summary ? (
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-display font-semibold text-fg-strong">Not here</h1>
          <p className="text-fg-subtle">This list isn't here any more. It may have been deleted on the other phone.</p>
        </div>
      ) : (
        <>
          <ListHeading summary={summary} />
          <Sections />
          <AddLine listId={listId} />
        </>
      )}
    </PillarLayout>
  );
}
