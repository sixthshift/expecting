// The Library's shelves, in the order a phase wants them. Pure, so the order is
// tested apart from the screen. Every phase's Library has every item; what a
// phase changes is what comes first (src/app/<phase>/index.ts):
//
//   lead       a first shelf of the phase's own items, when it names one
//   first      the topics it puts first, in its order
//   surprise   the things nobody tells you
//   topics     the rest of the topics, in their usual order
//   behind     earlier phases' items, folded at the end, when it leaves them behind
//
// An item sits on one shelf, except that a surprise also stays on its topic.
// Search, on the page, looks through everything.

import { CATEGORIES, type Category, type Item } from "../content/schema";
import { comparePhases, type Phase } from "./timeline";

/** How a phase arranges its Library. */
export type LibraryPlan = {
  /** A first shelf of this phase's own items, and its title. */
  lead?: string;
  /** Topics to put first, in this order; the rest follow in their usual order. */
  first: readonly Category[];
  /** Whether earlier phases' items stay on their shelves, or are left behind on one folded shelf at the end. */
  earlier: "keep" | "leave-behind";
  /** That shelf's title: "From the pregnancy". */
  behind?: string;
};

export type Shelf = {
  key: string;
  title: string;
  items: Item[];
  /** Drawn as cards, the things nobody tells you. */
  surprise: boolean;
  /** Folded until opened: what an earlier phase left. */
  folded: boolean;
};

export function arrangeLibrary(items: readonly Item[], phase: Phase, plan: LibraryPlan): Shelf[] {
  const earlier = (i: Item) => plan.earlier === "leave-behind" && comparePhases(i.from.phase, phase) < 0;
  const here = items.filter((i) => !earlier(i));
  const leading = plan.lead ? here.filter((i) => i.from.phase === phase) : [];
  const shelved = here.filter((i) => !leading.includes(i));
  const shelf = (key: string, title: string, of: Item[], kind: Partial<Pick<Shelf, "surprise" | "folded">> = {}): Shelf => ({
    key,
    title,
    items: of,
    surprise: kind.surprise ?? false,
    folded: kind.folded ?? false,
  });
  const topic = (c: Category) =>
    shelf(
      c,
      CATEGORIES[c],
      shelved.filter((i) => i.category === c)
    );
  const rest = (Object.keys(CATEGORIES) as Category[]).filter((c) => !plan.first.includes(c));

  return [
    plan.lead ? shelf("lead", plan.lead, leading) : null,
    ...plan.first.map(topic),
    shelf(
      "surprise",
      "Nobody tells you",
      here.filter((i) => i.surprise),
      { surprise: true }
    ),
    ...rest.map(topic),
    plan.behind ? shelf("behind", plan.behind, items.filter(earlier), { folded: true }) : null,
  ].filter((s): s is Shelf => s !== null && s.items.length > 0);
}
