// The Drawer's tool: your people, for drafting what goes to them (the
// announcement, a "can you bring dinner"). Read only; the games stay in the
// app.

import { CircleRepo } from "../../../db/models/circle/repo";
import { HEARS, VISITS } from "../../../lib/drawer/circle";
import { answer, type Tools } from "../answer";
import { known } from "../context";

export function drawerTools({ ctx, read }: Tools) {
  read(
    "your_people",
    {
      title: "Your people",
      description:
        "The people around you two, as kept in the Drawer: each with a few words about them, when they're welcome to visit, when they hear of the birth, what they'll help with and their meal-train day; the gifts and whether they've been thanked; and the announcement written ahead. For drafting messages to them: Expecting itself sends nothing.",
    },
    () => {
      const c = ctx();
      const k = known(c);
      const { people, gifts, announcement } = new CircleRepo(c.db).all();
      const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? null;
      return answer({
        people: people.map((p) => ({
          name: p.name,
          note: p.note,
          visit: p.visit ? VISITS[p.visit] : null,
          hears: p.hears ? HEARS[p.hears] : null,
          help: p.help,
          mealDay: p.mealDay,
        })),
        gifts: gifts.map((g) => ({ from: nameOf(g.personId), what: g.what, thanked: g.thankedAt })),
        announcement: announcement ? { text: announcement.body, by: k.nameOf(announcement.by) } : null,
      });
    }
  );
}
