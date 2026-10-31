import { Button } from "@sixthshift/design-system/button";
import { toast } from "@sixthshift/design-system/overlay";
import { Copy } from "lucide-react";
import { type CirclePerson, mealTrain, rosterText } from "../../../../lib/circle";
import { formatDate } from "../../../../lib/dates";
import { handOff } from "../../model/share";

const day = (d: Parameters<typeof formatDate>[0]) => formatDate(d, { weekday: "short", day: "numeric", month: "short" });

/** The meal train: who brings dinner which day, and the roster handed to whoever organises it. Nothing while nobody has a day. */
export function MealTrain({ people }: { people: readonly CirclePerson[] }) {
  const train = mealTrain(people);
  if (train.length === 0) return null;

  async function handRoster() {
    if ((await handOff(rosterText(people, day))) === "copied") toast({ title: "The roster is copied" });
  }

  return (
    <section aria-labelledby="meal-train" className="flex flex-col gap-2">
      <h2 id="meal-train" className="text-sm font-semibold text-fg-normal">
        The meal train
      </h2>
      <ul className="flex flex-col">
        {train.map((p) => (
          <li key={p.id} className="flex min-h-9 items-center gap-3 text-sm">
            <span className="w-28 shrink-0 text-fg-subtle">{day(p.mealDay)}</span>
            <span className="text-fg-strong">{p.name}</span>
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" className="w-fit" onClick={handRoster}>
        <Copy aria-hidden size={16} /> Hand on the roster
      </Button>
    </section>
  );
}
