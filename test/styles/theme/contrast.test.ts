// Every theme, light and dark, keeps its text readable where it is drawn: the
// semantic tokens resolved from each theme file through the palette, then
// checked pair by pair at AA — 4.5:1 for body text, 3:1 for UI edges and marks.
// A change to a token mapping, or to the palette under it, can't quietly make
// one of the six unreadable.
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { contrast } from "../../../scripts/palette";

const read = (file: string) => readFileSync(new URL(`../../../src/styles/theme/${file}`, import.meta.url), "utf8");

const palette = Object.fromEntries([...read("palette.css").matchAll(/(--color-[a-z]+-\d+): (#[0-9a-f]{6});/g)].map(([, name, hex]) => [name!, hex!]));

const NAMED: Record<string, string> = { white: "#ffffff", black: "#000000" };

/** One block's tokens, each resolved to a hex (the overlay, an rgba, is left out). */
function resolve(block: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const [, name, raw] of block.matchAll(/(--[a-z-]+):\s*([^;]+);/g)) {
    const value = raw!.trim();
    const hex = NAMED[value] ?? (value.startsWith("var(") ? palette[value.slice(4, -1)] : value);
    if (hex?.match(/^#[0-9a-f]{6}$/i)) tokens[name!] = hex;
  }
  return tokens;
}

// Surfaces: the page and the design system's two, where any text may go.
const SURFACES = ["--expecting-page", "--bg-normal", "--bg-subtle"];
// Tints: panels in a colour. Quiet text on them is fg-normal, not fg-subtle.
const TINTS = [
  "--expecting-accent-soft-from",
  "--expecting-accent-soft-to",
  "--bg-brand-subtle",
  "--bg-success-subtle",
  "--bg-warning-subtle",
  "--bg-danger-subtle",
];
const INTENTS = ["brand", "success", "warning", "danger"];
const STATES = ["", "-hovered", "-pressed"];

const BODY: [fg: string, bg: string][] = [
  ...SURFACES.flatMap((bg) =>
    ["--fg-strong", "--fg-normal", "--fg-subtle", "--fg-brand", "--fg-success", "--fg-warning", "--fg-danger"].map((fg) => [fg, bg] as [string, string])
  ),
  ...TINTS.flatMap((bg) => ["--fg-strong", "--fg-normal", "--fg-brand"].map((fg) => [fg, bg] as [string, string])),
  ...INTENTS.flatMap((x) => [
    [`--fg-${x}`, `--bg-${x}-subtle`] as [string, string],
    ...STATES.flatMap(
      (s) =>
        [
          [`--fg-on-${x}-subtle${s}`, `--bg-${x}-subtle${s}`],
          [`--fg-on-${x}${s}`, `--bg-${x}${s}`],
          [`--fg-on-${x}-strong${s}`, `--bg-${x}-strong${s}`],
        ] as [string, string][]
    ),
  ]),
  ...STATES.map((s) => [`--fg-on-strong${s}`, `--bg-strong${s}`] as [string, string]),
];

// UI: the focus ring and the edges and marks that carry meaning — a strong or
// brand border, and the brand's text colour used as a fill (the timeline's
// open windows and its now line, the Planner's steps). Hairlines between
// things (border-subtle, border-normal) only separate, and are left to taste.
const UI: [fg: string, bg: string][] = SURFACES.flatMap((bg) =>
  ["--focus-ring", "--border-strong", "--border-brand", "--fg-brand"].map((fg) => [fg, bg] as [string, string])
);

for (const theme of ["baby-purple", "baby-blue", "baby-pink"]) {
  const [light, dark] = [...read(`${theme}.css`).matchAll(/\{([^}]*)\}/g)].map(([, block]) => resolve(block!));

  for (const [mode, tokens] of [
    ["light", light!],
    ["dark", dark!],
  ] as const) {
    describe(`${theme}, ${mode}`, () => {
      const ratio = (fg: string, bg: string) => {
        expect(tokens[fg], `${fg} is set`).toBeDefined();
        expect(tokens[bg], `${bg} is set`).toBeDefined();
        return contrast(tokens[fg]!, tokens[bg]!);
      };

      test("body text reads at 4.5:1 on every surface it is used on", () => {
        for (const [fg, bg] of BODY) expect(ratio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      });

      test("the focus ring, and edges and marks that carry meaning, at 3:1", () => {
        for (const [fg, bg] of UI) expect(ratio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(3);
      });
    });
  }
}
