import { Tabs } from "@sixthshift/design-system/tabs";
import { useState } from "react";
import { Read } from "../../components/dayByDay/Read";
import { WeekNote } from "../../components/weekNote/WeekNote";
import { useWeekDays } from "../../hooks/useWeekDays";

/**
 * The week, day by day, on a desktop: a tab a day, the week's note first and a
 * read for each day after it that's out, each shown whole at a reading width,
 * one at a time. It opens where the phone's carousel does (`useWeekDays`):
 * today's in this week, the note in a week peeked at.
 */
export function DayTabs() {
  const { week, days, opening, showSize, titles, when } = useWeekDays();
  const [at, setAt] = useState(String(days[opening]?.day ?? 0));
  if (week === null || days.length === 0) return null;
  const draw = (d: (typeof days)[number]) =>
    d.note ? <WeekNote note={d.note} showSize={showSize} eyebrow={when(d.day)} /> : <Read read={d.read} label={when(d.day)} titles={titles} />;
  // One day alone (a week ahead has only its note) needs no tabs.
  if (days.length === 1 && days[0]) return <section aria-label={`Week ${week}, day by day`}>{draw(days[0])}</section>;

  return (
    <section aria-label={`Week ${week}, day by day`}>
      <Tabs
        value={at}
        onValueChange={setAt}
        items={days.map((d) => ({
          value: String(d.day),
          label: d.note ? `Week ${d.note.week}` : when(d.day),
          content: () => draw(d),
        }))}
      >
        <Tabs.List className="mb-4" />
        <Tabs.Panels />
      </Tabs>
    </section>
  );
}
