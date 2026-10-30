// Generates src/styles/theme/palette.css: a 50–950 scale for every colour family the
// three Expecting themes paint with, from a handful of anchors.
//
//   bun run palette
//
// The anchors are the five colours of the reference palette (#9DC3E2, #9DD2D8,
// #FADCE4, #FFB5CC, #E2B9DB). Each lands, exactly, on the step whose lightness
// it already has; the rest of its scale is built around it in OKLCH, so steps
// are perceptually even and keep the anchor's hue. Families with no anchor (the
// neutral, success, warning, danger) are given a hue and a chroma chosen to sit
// with the pastels. To rework the colours, change the spec below and rerun.
//
// It also prints a contrast report: which steps can carry text on white, and
// which can take white text — the pastels themselves cannot — and, for the dark
// mode, which steps carry text on the dark page and a dark surface, and which
// fills take dark text.

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
type Step = (typeof STEPS)[number];

/** OKLCH lightness of each step: Tailwind's own ladder, roughly. */
const LIGHTNESS: Record<Step, number> = {
  50: 0.975,
  100: 0.945,
  200: 0.895,
  300: 0.825,
  400: 0.735,
  500: 0.635,
  600: 0.54,
  700: 0.46,
  800: 0.38,
  900: 0.3,
  950: 0.22,
};

type Spec = { note: string } & ({ anchor: string; pins?: Partial<Record<Step, string>> } | { hue: number; chroma: number });

const FAMILIES: Record<string, Spec> = {
  mist: { note: "neutral: a grey with a breath of lilac, so it sits with every theme", hue: 300, chroma: 0.012 },
  sky: { note: "blue, from #9DC3E2: Baby Blue's brand, Baby Purple's first colour", anchor: "#9dc3e2" },
  lagoon: { note: "aqua, from #9DD2D8: Baby Blue's second colour", anchor: "#9dd2d8" },
  blossom: { note: "pink, from #FFB5CC, with #FADCE4 as its 100: Baby Pink's brand, Baby Purple's second colour", anchor: "#ffb5cc", pins: { 100: "#fadce4" } },
  lilac: { note: "lilac, from #E2B9DB: Baby Pink's second colour, Baby Purple's brand (it sits between blue and pink)", anchor: "#e2b9db" },
  sea: { note: "success: a sea green, lagoon leaning green", hue: 168, chroma: 0.085 },
  peach: { note: "warning: a soft apricot, the one warm hue the pastels needed", hue: 62, chroma: 0.1 },
  cherry: { note: "danger: a deep rose-red, clearly apart from blossom", hue: 20, chroma: 0.15 },
};

// --- OKLCH <-> sRGB (Björn Ottosson's OKLab) ---------------------------------

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b]
    .map((c) =>
      Math.round(Math.min(1, Math.max(0, c)) * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

function rgbToOklch([r, g, b]: [number, number, number]): { l: number; c: number; h: number } {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(a, bb), h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 };
}

/** OKLCH to linear-free sRGB, or null when the colour is outside sRGB. */
function oklchToRgb(L: number, c: number, h: number): [number, number, number] | null {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  if (rgb.some((v) => v < -0.0005 || v > 1.0005)) return null;
  return rgb.map(fromLinear) as [number, number, number];
}

/** The most saturated in-gamut colour at this lightness and hue, up to `c`. */
function inGamut(L: number, c: number, h: number): string {
  let lo = 0;
  let hi = c;
  if (oklchToRgb(L, hi, h)) return rgbToHex(oklchToRgb(L, hi, h)!);
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (oklchToRgb(L, mid, h)) lo = mid;
    else hi = mid;
  }
  return rgbToHex(oklchToRgb(L, lo, h)!);
}

/**
 * Chroma along the scale: the family's own at its anchor, fuller through the
 * middle and darker steps (a pastel's deep shade should still read as its
 * colour, not as grey), and tapering at the pale and dark ends.
 */
function chromaAt(L: number, base: number): number {
  const lift = 1 + 0.7 * Math.exp(-(((L - 0.55) / 0.18) ** 2));
  const taper = L > 0.85 ? 0.45 + (0.975 - L) * 3.75 : L < 0.3 ? 0.65 + (L - 0.22) * 4 : 1;
  return base * lift * Math.min(1, taper);
}

function scale(spec: Spec): Record<Step, string> {
  let hue: number;
  let base: number;
  const pinned: Partial<Record<Step, string>> = {};
  if ("anchor" in spec) {
    const lch = rgbToOklch(hexToRgb(spec.anchor));
    hue = lch.h;
    base = lch.c / (chromaAt(lch.l, 1) || 1);
    const nearest = STEPS.reduce((best, s) => (Math.abs(LIGHTNESS[s] - lch.l) < Math.abs(LIGHTNESS[best] - lch.l) ? s : best), STEPS[0]);
    pinned[nearest] = spec.anchor.toLowerCase();
    Object.assign(pinned, spec.pins);
  } else {
    hue = spec.hue;
    base = spec.chroma;
  }
  return Object.fromEntries(STEPS.map((s) => [s, pinned[s] ?? inGamut(LIGHTNESS[s], chromaAt(LIGHTNESS[s], base), hue)])) as Record<Step, string>;
}

// --- contrast -----------------------------------------------------------------

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
}

// --- output -------------------------------------------------------------------

if (import.meta.main) {
  const families = Object.entries(FAMILIES).map(([name, spec]) => ({ name, spec, steps: scale(spec) }));

  const css = [
    "/*",
    " * Expecting — the palette. Generated by scripts/palette.ts (`bun run palette`);",
    " * edit the spec there, not this file. Shared by the three themes (baby-blue.css,",
    " * baby-pink.css, baby-purple.css), which point the design system's semantic tokens at",
    " * these. Not API for components: they read semantic tokens only.",
    " */",
    "",
    ":root {",
    ...families.flatMap(({ name, spec, steps }) => ["", `  /* ${name}: ${spec.note} */`, ...STEPS.map((s) => `  --color-${name}-${s}: ${steps[s]};`)]),
    "}",
    "",
  ].join("\n");

  await Bun.write(new URL("../src/styles/theme/palette.css", import.meta.url), css);
  console.log("wrote src/styles/theme/palette.css\n");

  console.log("contrast (AA body text needs 4.5, large text and UI 3):");
  for (const { name, steps } of families) {
    const onWhite = STEPS.filter((s) => contrast(steps[s], "#ffffff") >= 4.5);
    console.log(
      `  ${name.padEnd(8)} text on white from ${onWhite[0] ?? "—"}; white text on ${onWhite[0] ?? "—"}+ · 300 vs white ${contrast(steps[300], "#ffffff").toFixed(2)}`
    );
  }

  // The dark mode's ground: mist-950 is as dark as the page gets in the
  // palette (each theme's page is a touch darker), mist-900 the surface on it.
  const mist = families.find((f) => f.name === "mist")!.steps;
  const upTo = (steps: Record<Step, string>, on: string) => STEPS.filter((s) => contrast(steps[s], on) >= 4.5).at(-1) ?? "—";
  console.log("\nin the dark (page mist-950, surface mist-900):");
  for (const { name, steps } of families) {
    const darkText = STEPS.filter((s) => contrast(steps[s], mist[950]) >= 4.5);
    console.log(
      `  ${name.padEnd(8)} text on the page up to ${upTo(steps, mist[950])}, on a surface up to ${upTo(steps, mist[900])}; dark text on ${darkText.at(-1) ?? "—"} and lighter · 400 vs mist-950 ${contrast(steps[400], mist[950]).toFixed(2)}`
    );
  }
}
