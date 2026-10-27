import { Timeline } from "../../components/timeline/Timeline";
import { Route } from "./route";

/** The timeline, opened at this week. */
export function HomePage() {
  const { at } = Route.useSearch();
  return <Timeline at={at} />;
}
