import { expect, test } from "vitest";
import { splitPhones } from "../../src/lib/phones";

test("the numbers services use, as they're written", () => {
  expect(splitPhones("Call triple zero (000), PANDA on 1300 726 306 or Lifeline on 13 11 14.")).toEqual([
    "Call triple zero (",
    { phone: "000" },
    "), PANDA on ",
    { phone: "1300 726 306" },
    " or Lifeline on ",
    { phone: "13 11 14" },
    ".",
  ]);
  expect(splitPhones("MensLine on 1300 78 99 78, PBB 1800882436")).toEqual(["MensLine on ", { phone: "1300 78 99 78" }, ", PBB ", { phone: "1800882436" }]);
});

test("not numbers that only look like them", () => {
  for (const text of ["10,000 steps", "13 to 27 weeks", "at 13 weeks", "1.000 mg", "weeks 13 and 14"]) expect(splitPhones(text)).toEqual([text]);
});
