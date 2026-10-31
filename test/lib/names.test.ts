import { expect, test } from "vitest";
import { tidyName } from "../../src/lib/names";

test("a name is tidied as typed: trimmed, and capitalised only if typed all in lower case", () => {
  expect(tidyName("  mary   jane ")).toBe("Mary Jane");
  expect(tidyName("o'brien-smith")).toBe("O'Brien-Smith");
  expect(tidyName("McKenzie")).toBe("McKenzie");
  expect(tidyName("zoë")).toBe("Zoë");
});
