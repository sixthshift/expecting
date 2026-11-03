import { WeekColumns } from "../components/WeekColumns";
import { ThisWeekPageProvider } from "../contexts/ThisWeekPageContext";

/**
 * This week, home: what you open the app for. Where you are first, then what
 * to do now (after the next appointment, once it's within a fortnight), how you are today, the week day by day (its note, read as you, then a read a day), the week's heads-up, what
 * Expecting needs to know, what's worth knowing this week, and what's coming. On a desktop the
 * week sits on the left and the doing on the right; on a phone it's one
 * column, the doing first.
 *
 * A peek at another week (?at=29) shows that week instead: its note, its
 * heads-up, what's worth knowing, what's best done then, its appointments,
 * and the notes kept then. What to do now stays with now; this week's notes stay in the Journal.
 *
 * While something has happened, the route draws `QuietThisWeekPage` instead
 * (`worlds`): support and the next steps.
 */
export function ThisWeekPage() {
  return (
    <ThisWeekPageProvider>
      <WeekColumns />
    </ThisWeekPageProvider>
  );
}
