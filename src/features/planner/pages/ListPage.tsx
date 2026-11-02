import { getRouteApi, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { isApart } from "../../../lib/lists/builtIn";
import { PutAwayNotice } from "../../quiet/components/PutAwayNotice";
import { AddLine } from "../components/lists/addLine/AddLine";
import { ListHeading } from "../components/lists/heading/ListHeading";
import { Sections } from "../components/lists/sections/Sections";
import { ListPageProvider, useListPage } from "../contexts/ListPageContext";

const route = getRouteApi("/app/planner/lists/$listId");

/**
 * One list: where it's up to, then its sections as cards (flowing down two
 * columns on a desktop), each line with its tick, what's left first. "Just what's left"
 * hides the got, for the shop. Your own lines are added at the foot, the
 * not-needed folded under them. A list of your own can be renamed or
 * deleted. A list that isn't here (deleted on the other phone, or a built-in
 * one with nothing on it for you) says so. What the page works out once is
 * `ListPageProvider`; each part reads it.
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
  const { data: quiet } = useQuietQuery();
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-8">
      <div className="flex flex-col gap-6">
        {/* The bag is It's time's: back is there. */}
        <Link
          to={isApart(listId) ? "/its-time" : "/planner/lists"}
          className="-ml-2 -mb-2 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal"
        >
          <ArrowLeft aria-hidden size={16} /> {isApart(listId) ? "It's time" : "Lists"}
        </Link>
        {quiet ? (
          <PutAwayNotice subject="The lists" are className="max-w-prose" />
        ) : !summary ? (
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
      </div>
    </main>
  );
}
