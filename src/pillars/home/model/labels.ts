/** The week shown, in a heading: "this week", or "that week" on a peek ("Asked that week"). */
export function whichWeek(peeking: boolean): "this week" | "that week" {
  return peeking ? "that week" : "this week";
}
