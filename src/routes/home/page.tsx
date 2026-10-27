import { Timeline } from "../../components/timeline/Timeline";
import { Route } from "./route";

/** The app is the timeline, opened at this week. */
export function HomePage() {
  const { state, questions } = Route.useLoaderData();
  const { view, at } = Route.useSearch();
  return <Timeline state={state} questions={questions} view={view ?? "all"} at={at} />;
}
