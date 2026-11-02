import { getRouteApi } from "@tanstack/react-router";
import { useNamesQuery } from "../../../api/rpc/names";
import { usePeopleQuery } from "../../../api/rpc/people";
import { useSettingsQuery } from "../../../api/rpc/settings";
import { dealing } from "../../../lib/names";
import { otherOf } from "../../../lib/people";
import { DrawerFrame } from "../../drawer/components/frame/DrawerFrame";
import { NamesGame } from "../components/namesGame/NamesGame";

const route = getRouteApi("/app/drawer/names");

/**
 * The names game, a page of its own, opened from the Drawer: the deck to swipe first, then the shortlist
 * and a name to add. With the Choosing a name extra; put away while something has happened.
 */
export function NamesPage() {
  const { data: names } = useNamesQuery();
  const { me, people } = usePeopleQuery().data;
  const { data: baby } = useSettingsQuery({ select: (s) => s.baby });
  const { filter, choosable } = dealing(baby, route.useSearch().names);
  const navigate = route.useNavigate();
  const other = otherOf(people, me);

  return (
    <DrawerFrame title="Baby names" putAway={{ subject: "The names", are: true }} extras={["choosing-names"]}>
      <NamesGame
        view={names}
        other={other}
        seed={me?.id ?? ""}
        filter={filter}
        onFilter={choosable ? (choice) => navigate({ search: { names: choice === "all" ? undefined : choice }, replace: true, resetScroll: false }) : undefined}
      />
    </DrawerFrame>
  );
}
