import { expect, test } from "vitest";
import { type Person, whose } from "../../src/lib/people";

const jason: Person = { id: "j", name: "Jason", role: "partner" };
const sam: Person = { id: "s", name: "Sam", role: "carrying" };

test("whose a task is, from the phone holding it", () => {
  expect(whose("partner", jason, [jason, sam])).toBe("Yours");
  expect(whose("carrying", jason, [jason, sam])).toBe("Sam's");
  expect(whose("together", jason, [jason, sam])).toBe("Together");
});

test("with nobody in the role yet, the role names it", () => {
  expect(whose("carrying", jason, [jason])).toBe("The birth parent's");
  expect(whose("partner", null, [])).toBe("The partner's");
});
