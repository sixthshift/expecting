// The generated palette keeps the promise the themes rely on: steps 600 and
// darker can carry text on white (and take white text). Reworking the colours
// in scripts/palette.ts can't quietly break that.
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { contrast } from "../../../scripts/palette";

const css = readFileSync(new URL("../../../src/styles/theme/palette.css", import.meta.url), "utf8");
const tokens = [...css.matchAll(/--color-([a-z]+)-(\d+): (#[0-9a-f]{6});/g)].map(([, family, step, hex]) => ({
  family: family!,
  step: Number(step),
  hex: hex!,
}));

test("every family has a full 50–950 scale", () => {
  const families = new Set(tokens.map((t) => t.family));
  expect([...families].sort()).toEqual(["blossom", "cherry", "lagoon", "lilac", "mist", "peach", "sea", "sky"]);
  for (const f of families) expect(tokens.filter((t) => t.family === f).map((t) => t.step)).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
});

test("the reference colours are in it, exactly", () => {
  for (const hex of ["#9dc3e2", "#9dd2d8", "#fadce4", "#ffb5cc", "#e2b9db"]) expect(tokens.map((t) => t.hex)).toContain(hex);
});

test("600 and darker read on white, at AA for body text", () => {
  for (const t of tokens.filter((t) => t.step >= 600)) {
    expect(contrast(t.hex, "#ffffff"), `${t.family}-${t.step} ${t.hex}`).toBeGreaterThanOrEqual(4.5);
  }
});
