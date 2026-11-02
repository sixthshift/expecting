import { useCircleQuery } from "../../../../../../api/rpc/circle";
import { toThank } from "../../../../../../lib/drawer/circle";

/** Your people in a line, for its tile in the Drawer: how many, and the gifts still to thank for. */
export function CircleSummary() {
  const { data: circle } = useCircleQuery();
  const count = circle.people.length;
  const thanks = toThank(circle.gifts).length;
  return count === 0
    ? "Who visits, who hears first, who helps, and who gave what: kept by you both."
    : `${count === 1 ? "1 person" : `${count} people`}${thanks > 0 ? `, ${thanks} ${thanks === 1 ? "gift" : "gifts"} to thank for` : ""}.`;
}
