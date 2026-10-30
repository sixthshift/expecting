import { expect, test } from "vitest";
import { ageOn, handover } from "../../../src/features/emergency/model/handover";

const base = { facts: {}, carrying: "Sam", dueDate: "2027-02-14", today: "2026-10-30", lostOn: null } as const;

test("age counts whole years, not yet the birthday", () => {
  expect(ageOn("1992-10-31", "2026-10-30")).toBe(33);
  expect(ageOn("1992-10-30", "2026-10-30")).toBe(34);
});

test("the header: the full name over the app's, the weeks and the due date", () => {
  const h = handover({ ...base, values: { fullName: "Samantha Chen", dateOfBirth: "1992-03-03" }, facts: { babies: "twins" } });
  expect(h.name).toBe("Samantha Chen");
  expect(h.born).toEqual({ date: "1992-03-03", age: 34 });
  expect(h.pregnancy).toBe("24+5 weeks pregnant · due 14 Feb 2027 · twins");
  expect(handover({ ...base, values: {} }).name).toBe("Sam");
});

test("allergies come first and loudest; none known is said, and blank is missing", () => {
  const h = handover({ ...base, values: { allergies: "Penicillin", bloodGroup: "O negative" } });
  expect(h.rows.map((r) => r.id)).toEqual(["allergies", "blood"]);
  expect(h.rows[0]).toMatchObject({ value: "Penicillin", alert: true });
  expect(handover({ ...base, values: { noKnownAllergies: "yes" } }).rows[0]).toMatchObject({ value: "No known allergies", alert: false });
  expect(handover({ ...base, values: {} }).missing).toContain("Allergies");
});

test("the answers fill in what they can", () => {
  const h = handover({ ...base, values: {}, facts: { rhd: "negative", firstBaby: "no", previousCaesarean: "yes", birth: "caesarean" } });
  expect(Object.fromEntries(h.rows.map((r) => [r.id, r.value]))).toEqual({
    blood: "RhD negative",
    pregnancy: "Planned caesarean",
    before: "A caesarean before",
  });
  expect(h.missing).not.toContain("Blood group");
  expect(handover({ ...base, values: {}, facts: { firstBaby: "yes" } }).missing).not.toContain("Past pregnancies");
});

test("after a loss, it says when the pregnancy ended", () => {
  const h = handover({ ...base, values: {}, lostOn: "2026-08-01" });
  expect(h.pregnancy).toBe("Pregnancy loss at 11+6 weeks, on or before Sat, 1 Aug 2026");
});
