import { describe, expect, test } from "vitest";
import type { HouseholdState } from "../../../src/features/household/load";
import { workOut } from "../../../src/features/household/workOut";
import type { ISODate } from "../../../src/lib/dates";

const today = "2026-10-30" as ISODate;

function household(over: Partial<HouseholdState> = {}): HouseholdState {
  return {
    household: { dueDate: "2027-04-01" as ISODate, baby: "unknown", onboardedAt: "2026-10-01" },
    answers: [],
    extras: [],
    ticks: {},
    ownTasks: [],
    me: null,
    people: [],
    ...over,
  } as HouseholdState;
}

const answer = (question: string, value: string) => ({ question, about: "household" as const, value, answeredBy: null, answeredAt: "2026-10-01" });
const ids = (state: HouseholdState) => new Set(workOut(state, today).items.map((i) => i.id));

describe("workOut", () => {
  test("places today in the pregnancy, or nowhere before a due date", () => {
    expect(workOut(household(), today).now).toBe(18);
    const none = workOut(household({ household: { dueDate: null, baby: "unknown", onboardedAt: null } }), today);
    expect(none.position).toBeNull();
    expect(none.now).toBeNull();
  });

  test("an answer hides what it doesn't fit, and an unknown one hides nothing", () => {
    expect(ids(household()).has("anti-d")).toBe(true);
    expect(ids(household({ answers: [answer("rhd", "negative")] })).has("anti-d")).toBe(true);
    expect(ids(household({ answers: [answer("rhd", "positive")] })).has("anti-d")).toBe(false);
  });

  test("an extra's items appear only once it's on", () => {
    expect(ids(household()).has("baby-shower")).toBe(false);
    const on = household({ extras: [{ id: "baby-shower", on: true, changedBy: null, changedAt: "2026-10-01" }] } as Partial<HouseholdState>);
    expect(ids(on).has("baby-shower")).toBe(true);
  });

  test("own tasks join the checklist", () => {
    const own = household({ ownTasks: [{ id: "x", title: "Buy a pram", week: 30, createdAt: "2026-10-01" }] } as Partial<HouseholdState>);
    expect(workOut(own, today).tasks.find((t) => t.id === "x")?.origin).toBe("own");
  });
});
