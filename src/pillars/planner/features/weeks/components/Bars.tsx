import type { Bar } from "../../../../../lib/planner/weeks";
import { BarRow } from "./BarRow";

/** The chart's rows, one for each bar. */
export function Bars({ bars }: { bars: readonly Bar[] }) {
  return (
    <ul className="flex flex-col gap-1 desktop:gap-0">
      {bars.map((bar) => (
        <li key={bar.task.id}>
          <BarRow bar={bar} />
        </li>
      ))}
    </ul>
  );
}
