import { expect, test } from "vitest";
import { nextToVote, tidyName } from "../../src/lib/names";

test("a name is tidied as typed: trimmed, and capitalised only if typed all in lower case", () => {
  expect(tidyName("  mary   jane ")).toBe("Mary Jane");
  expect(tidyName("o'brien-smith")).toBe("O'Brien-Smith");
  expect(tidyName("McKenzie")).toBe("McKenzie");
  expect(tidyName("zoë")).toBe("Zoë");
});

test("the next to vote on is the oldest not yet voted on", () => {
  const view = {
    names: [
      { id: "a", name: "Ada", mine: true },
      { id: "b", name: "Iris", mine: null },
    ],
    matches: [],
    together: true,
  };
  expect(nextToVote(view)?.name).toBe("Iris");
  expect(nextToVote({ ...view, names: [view.names[0]!] })).toBeUndefined();
});
