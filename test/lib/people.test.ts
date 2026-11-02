import { expect, test } from "vitest";
import { nameBy, OTHER_ONE, otherName, otherOf, type Person, whose, whoseBy } from "../../src/lib/people";

const jason: Person = { id: "j", name: "Jason", role: "partner" };
const sam: Person = { id: "s", name: "Sam", role: "carrying" };

test("whose a task is, from the phone holding it", () => {
  expect(whose("partner", jason, [jason, sam])).toBe("Yours");
  expect(whose("carrying", jason, [jason, sam])).toBe("Sam's");
  expect(whose("together", jason, [jason, sam])).toBe("Together");
});

test("with nobody in the role yet, the role names it", () => {
  expect(whose("carrying", jason, [jason])).toBe("The pregnant parent's");
  expect(whose("partner", null, [])).toBe("The partner's");
});

test("whose something one of you added is, by who added it", () => {
  expect(whoseBy("j", jason, [jason, sam])).toBe("Yours");
  expect(whoseBy("s", jason, [jason, sam])).toBe("Sam's");
  expect(whoseBy("gone", jason, [jason, sam])).toBeNull();
  expect(whoseBy(null, jason, [jason, sam])).toBeNull();
});

test("the other of the two, from the phone holding it", () => {
  expect(otherOf([jason, sam], jason)).toBe(sam);
  expect(otherOf([jason], jason)).toBeNull();
  expect(otherName([jason, sam], sam)).toBe("Jason");
  expect(otherName([jason], jason)).toBe(OTHER_ONE);
  expect(OTHER_ONE).toBe("The other one");
});

test("who one of you is, by id: you, a name, or nobody", () => {
  expect(nameBy("j", jason, [jason, sam])).toBe("You");
  expect(nameBy("j", jason, [jason, sam], "you")).toBe("you");
  expect(nameBy("s", jason, [jason, sam])).toBe("Sam");
  expect(nameBy("gone", jason, [jason, sam])).toBeNull();
  expect(nameBy(null, jason, [jason, sam])).toBeNull();
});
