import { type Circle, type CirclePerson, groupsOf, HEARS, VISITS, type View } from "../../../../../../lib/circle";
import { weekdayDate } from "../../../../../../lib/labels";
import { Announcement } from "../announcement/Announcement";
import { Gifts } from "../gifts/Gifts";
import { MealTrain } from "../meals/MealTrain";
import { Grouped } from "./Grouped";

/** A view of your people: the gifts; who helps, and the meal train; who visits; or who hears first, and the words for the birth. */
export function ViewBody({ view, circle }: { view: View; circle: Circle }) {
  const { people, gifts, announcement } = circle;
  if (view === "gifts") return <Gifts people={people} gifts={gifts} />;
  if (view === "help") {
    const meta = (p: CirclePerson) => [p.help, p.mealDay ? `meals ${weekdayDate(p.mealDay)}` : null].filter(Boolean).join(" · ");
    return (
      <>
        <Grouped
          people={people}
          groups={groupsOf(people, { helping: "Helping" }, (p) => (p.help || p.mealDay ? "helping" : null), "Not asked yet")}
          view={view}
          meta={meta}
        />
        <MealTrain people={people} />
      </>
    );
  }
  return (
    <>
      <Grouped people={people} groups={view === "visitors" ? groupsOf(people, VISITS, (p) => p.visit) : groupsOf(people, HEARS, (p) => p.hears)} view={view} />
      {view === "hearing" ? <Announcement words={announcement} people={people} /> : null}
    </>
  );
}
