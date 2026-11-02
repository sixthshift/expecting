import { getRouteApi, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useExtrasQuery } from "../../../api/rpc/extras";
import { useNamesQuery } from "../../../api/rpc/names";
import { usePeopleQuery } from "../../../api/rpc/people";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { useSettingsQuery } from "../../../api/rpc/settings";
import { extrasOn } from "../../../lib/extras";
import { dealing } from "../../../lib/names";
import { extra } from "../../settings/model/extras";
import { NamesGame } from "../components/namesGame/NamesGame";

const route = getRouteApi("/app/drawer/names");

/**
 * The names game, a page of its own, opened from the Drawer: the deck to swipe first, then the shortlist
 * and a name to add. With the Choosing a name extra; put away while something has happened.
 */
export function NamesPage() {
  const { data: names } = useNamesQuery();
  const { me, people } = usePeopleQuery().data;
  const { data: on } = useExtrasQuery({ select: (e) => extrasOn(e).has("choosing-names") });
  const { data: quiet } = useQuietQuery();
  const { data: baby } = useSettingsQuery({ select: (s) => s.baby });
  const { filter, choosable } = dealing(baby, route.useSearch().names);
  const navigate = route.useNavigate();
  const other = people.find((p) => p.id !== me?.id) ?? null;
  const naming = extra("choosing-names");

  return (
    <main className="mx-auto w-full max-w-3xl overflow-x-clip px-4 pb-16 md:px-8">
      <Link to="/drawer" className="mt-4 flex min-h-11 items-center gap-1 text-sm text-fg-subtle">
        <ChevronLeft aria-hidden size={16} /> The Drawer
      </Link>
      <h1 className="mb-4 font-display text-3xl font-semibold text-fg-strong">Baby names</h1>
      {quiet ? (
        <p className="text-sm text-fg-subtle">The names are put away while Expecting is quiet. Nothing is deleted.</p>
      ) : !on ? (
        <p className="text-sm text-fg-normal">
          The names game comes with {naming.name}.{" "}
          <Link to="/settings" search={{ ask: `extra:${naming.id}` }} className="underline">
            Turn it on in settings
          </Link>
        </p>
      ) : (
        <NamesGame
          view={names}
          other={other}
          seed={me?.id ?? ""}
          filter={filter}
          onFilter={
            choosable ? (choice) => navigate({ search: { names: choice === "all" ? undefined : choice }, replace: true, resetScroll: false }) : undefined
          }
        />
      )}
    </main>
  );
}
