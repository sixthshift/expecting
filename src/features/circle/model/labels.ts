// Your people's words: what each view is for, and a view's name as its
// switch says it.

import { type Circle, toThank, VIEWS, type View } from "../../../lib/circle";

/** What each view is for, under its name. */
export const ABOUT: Record<View, string> = {
  visitors: "Who's welcome in hospital, who in the first weeks home, and who not yet.",
  hearing: "Who hears of the birth first, who next, and who with everyone.",
  help: "Who can help with what in the first weeks, and the meal train.",
  gifts: "Who gave what, ticked off as you thank them.",
};

/** A view's name, with the gifts still to thank for. */
export function viewLabel(view: View, circle: Circle): string {
  const left = view === "gifts" ? toThank(circle.gifts).length : 0;
  return left > 0 ? `${VIEWS[view].title} · ${left} to thank` : VIEWS[view].title;
}
