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

// The dark blocks lean on the other end: text in colour is the 300s on a
// surface (mist-900), and fills are the 400s with dark text (mist-950) on them.
const hexOf = (family: string, step: number) => tokens.find((t) => t.family === family && t.step === step)!.hex;

test("in the dark, 300 and lighter read on a surface, at AA for body text", () => {
  for (const t of tokens.filter((t) => t.step <= 300)) {
    expect(contrast(t.hex, hexOf("mist", 900)), `${t.family}-${t.step} ${t.hex}`).toBeGreaterThanOrEqual(4.5);
  }
});

test("in the dark, 400 and lighter take dark text, at AA for body text", () => {
  for (const t of tokens.filter((t) => t.step <= 400)) {
    expect(contrast(t.hex, hexOf("mist", 950)), `${t.family}-${t.step} ${t.hex}`).toBeGreaterThanOrEqual(4.5);
  }
});
