import { expect, test } from "vitest";
import { EMERGENCY_IDS, telHref, tidyValue } from "../../src/lib/emergency";

test("a phone number becomes a tel: link of its digits", () => {
  expect(telHref("(02) 9999 0000")).toBe("tel:0299990000");
  expect(telHref(" +61 2 9999-0000 ")).toBe("tel:+61299990000");
  expect(telHref("1800 022 222")).toBe("tel:1800022222");
});

test("a value loses trailing spaces and blank lines at either end", () => {
  expect(tidyValue("\n  Royal Hospital  \n1 Main St  \n\n")).toBe("Royal Hospital\n1 Main St");
  expect(tidyValue("   ")).toBe("");
});

test("each field has its own id", () => {
  expect(new Set(EMERGENCY_IDS).size).toBe(EMERGENCY_IDS.length);
});
