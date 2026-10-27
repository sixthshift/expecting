import { Route } from "../../../routes/home/route";
import { Timeline } from "../../timeline/Timeline";

/** The pregnancy's home: the timeline, opened at this week or at ?at=. */
export function PregnancyHome() {
  const { at } = Route.useSearch();
  return <Timeline at={at} />;
}
