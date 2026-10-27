// Generates docs/palette.html: the palette and the three themes, to look at.
//
//   bun run palette        (after palette.css), or on its own: bun run scripts/palette-sheet.ts
//
// Read from what the app actually ships, src/theme/palette.css and the theme
// files, so the sheet can't drift from them. Each family as its scale from 50
// to 950 with its contrast on white, each theme drawn in its own tokens, and
// the tokens that differ between the themes. Open the file in a browser.

const THEME_DIR = new URL("../src/theme/", import.meta.url);
const OUT = new URL("../docs/palette.html", import.meta.url);
const paletteCss = await Bun.file(new URL("palette.css", THEME_DIR)).text();

type Family = { name: string; note: string; steps: { step: number; hex: string }[] };
const families: Family[] = [];
let current: Family | null = null;
for (const line of paletteCss.split("\n")) {
  const c = /^\s*\/\*\s*(\w+):\s*(.+?)\s*\*\/\s*$/.exec(line);
  if (c) {
    current = { name: c[1]!, note: c[2]!, steps: [] };
    families.push(current);
    continue;
  }
  const v = /--color-(\w+)-(\d+):\s*(#[0-9a-f]{6})/i.exec(line);
  if (v && current) current.steps.push({ step: Number(v[2]), hex: v[3]!.toLowerCase() });
}
const hexOf: Record<string, string> = {};
for (const f of families) for (const s of f.steps) hexOf[`${f.name}-${s.step}`] = s.hex;

const REFERENCE = ["#9dc3e2", "#9dd2d8", "#fadce4", "#ffb5cc", "#e2b9db"];

function lum(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};

type Theme = { id: string; name: string; for: string; tokens: Record<string, string> };
const themes: Theme[] = [];
for (const [id, name, who] of [
  ["baby-blue", "Baby Blue", "A boy"],
  ["baby-pink", "Baby Pink", "A girl"],
  ["baby-purple", "Baby Purple", "Don't know, or a surprise · the default"],
] as const) {
  const css = await Bun.file(new URL(`${id}.css`, THEME_DIR)).text();
  const tokens: Record<string, string> = {};
  for (const m of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) tokens[m[1]!] = m[2]!.trim();
  themes.push({ id, name, for: who, tokens });
}
const resolve = (v: string) => {
  const m = /var\(--color-([\w]+-\d+)\)/.exec(v);
  return m ? hexOf[m[1]!]! : v;
};
const ref = (v: string) => /var\(--color-([\w]+-\d+)\)/.exec(v)?.[1] ?? v;

const ROLES: { label: string; token: string }[] = [
  { label: "Brand", token: "--bg-brand" },
  { label: "Brand text", token: "--fg-brand" },
  { label: "Brand, subtle", token: "--bg-brand-subtle" },
  { label: "Focus ring", token: "--focus-ring" },
  { label: "Accent, from", token: "--expecting-accent-from" },
  { label: "Accent, to", token: "--expecting-accent-to" },
  { label: "Page", token: "--expecting-page" },
  { label: "Neutral text", token: "--fg-normal" },
  { label: "Success", token: "--bg-success" },
  { label: "Warning", token: "--bg-warning" },
  { label: "Danger", token: "--bg-danger" },
];

const used = new Map<string, string[]>();
for (const t of themes)
  for (const r of ROLES.slice(0, 6)) {
    const fam = ref(t.tokens[r.token]!).split("-")[0]!;
    const list = used.get(fam) ?? [];
    if (!list.includes(t.name)) list.push(t.name);
    used.set(fam, list);
  }
const SHARED_ROLE: Record<string, string> = {
  mist: "Neutral, every theme",
  sea: "Success, every theme",
  peach: "Warning, every theme",
  cherry: "Danger, every theme",
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const familyRows = families
  .map((f) => {
    const roles = SHARED_ROLE[f.name] ? [SHARED_ROLE[f.name]] : (used.get(f.name) ?? []).map((n) => n);
    const note = f.note.replace(/^[^:]+:\s*/, "");
    const kind = f.note.split(":")[0];
    const cells = f.steps
      .map(({ step, hex }) => {
        const onWhite = contrast(hex, "#ffffff");
        const ink = onWhite >= contrast(hex, "#1b1a1e") ? "#ffffff" : "#1b1a1e";
        const isRef = REFERENCE.includes(hex);
        const aa = onWhite >= 4.5 ? "AA" : onWhite >= 3 ? "AA large" : "";
        return `<li class="sw${isRef ? " ref" : ""}"><div class="chip" style="background:${hex};color:${ink}"><span class="step">${step}</span>${isRef ? '<span class="refmark" title="A reference colour">ref</span>' : ""}</div><div class="meta"><code>${hex}</code><span class="cr">${onWhite.toFixed(1)}:1${aa ? ` <b>${aa}</b>` : ""}</span></div></li>`;
      })
      .join("");
    return `<section class="fam" id="fam-${f.name}"><header class="famhead"><h3>${f.name}</h3><p class="kind">${esc(kind ?? "")}</p><p class="note">${esc(note)}</p><ul class="roles">${roles.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></header><div class="scroll"><ol class="steps">${cells}</ol></div></section>`;
  })
  .join("\n");

const themeCards = themes
  .map((t) => {
    const v = (k: string) => resolve(t.tokens[k]!);
    const style = [
      `--t-page:${v("--expecting-page")}`,
      `--t-from:${v("--expecting-accent-from")}`,
      `--t-to:${v("--expecting-accent-to")}`,
      `--t-soft-from:${v("--expecting-accent-soft-from")}`,
      `--t-soft-to:${v("--expecting-accent-soft-to")}`,
      `--t-brand:${v("--bg-brand")}`,
      `--t-on-brand:${v("--fg-on-brand")}`,
      `--t-fg-brand:${v("--fg-brand")}`,
      `--t-subtle:${v("--bg-brand-subtle")}`,
      `--t-on-subtle:${v("--fg-on-brand-subtle")}`,
      `--t-ring:${v("--focus-ring")}`,
      `--t-fg:${v("--fg-normal")}`,
      `--t-fg-subtle:${v("--fg-subtle")}`,
      `--t-border:${v("--border-subtle")}`,
      `--t-warn-bg:${v("--bg-warning-subtle")}`,
      `--t-warn-fg:${v("--fg-on-warning-subtle")}`,
      `--t-border-warn:${v("--border-warning")}`,
    ].join(";");
    const rows = ROLES.map((r) => {
      const raw = t.tokens[r.token]!;
      const hex = resolve(raw);
      return `<tr><th scope="row">${r.label}</th><td><span class="dot" style="background:${hex}"></span><code>${esc(ref(raw).startsWith("#") ? hex : ref(raw))}</code></td></tr>`;
    }).join("");
    return `<article class="theme" style="${style}">
  <header><h3>${t.name}</h3><p>${esc(t.for)}</p></header>
  <div class="preview">
    <div class="week">
      <div class="stripe"></div>
      <p class="num">28 <span>weeks</span></p>
      <p class="line"><b>28+0</b> · 84 days to go</p>
      <div class="soft">Nobody tells you: the RSV vaccine window opens this week.</div>
      <div class="row"><span class="btn">Add task</span><span class="pill">Draft</span><span class="ring">Focused</span></div>
      <div class="warn">One task has slipped past its week</div>
    </div>
  </div>
  <table class="tokens"><tbody>${rows}</tbody></table>
</article>`;
  })
  .join("\n");

// What differs between the themes: every token whose value isn't the same in all three.
const allTokens = Object.keys(themes[0]!.tokens);
const differing = allTokens.filter((k) => new Set(themes.map((t) => t.tokens[k])).size > 1);
const diffRows = differing
  .map(
    (k) =>
      `<tr><th scope="row"><code>${k}</code></th>${themes
        .map((t) => {
          const raw = t.tokens[k]!;
          return `<td><span class="dot" style="background:${resolve(raw)}"></span><code>${esc(ref(raw).startsWith("#") ? resolve(raw) : ref(raw))}</code></td>`;
        })
        .join("")}</tr>`
  )
  .join("");

const html = `<!doctype html>
<!-- Generated by scripts/palette-sheet.ts (\`bun run palette\`). Don't edit by hand. -->
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Expecting palette</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Layout: a reference sheet. The families as long strips, 50 to 950; then the three themes side by side, drawn in their own tokens. */
:root {
  --ink: #2f2c34;           /* mist-900 */
  --ink-soft: #706c79;      /* mist-600 */
  --ground: #ffffff;
  --panel: #f7f6fa;         /* mist-50 */
  --rule: #dddbe2;          /* mist-200 */
  --accent: #e2b9db;        /* lilac, the reference */
  --display: "Bricolage Grotesque", "Avenir Next", system-ui, sans-serif;
  --body: "Nunito Sans", "Segoe UI", system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { color-scheme: dark; --ink: #edecf1; --ink-soft: #aaa7b1; --ground: #1b1a1e; --panel: #2f2c34; --rule: #43414a; }
}
:root[data-theme="dark"] { color-scheme: dark; --ink: #edecf1; --ink-soft: #aaa7b1; --ground: #1b1a1e; --panel: #2f2c34; --rule: #43414a; }

* { box-sizing: border-box; }
body { margin: 0;  background: var(--ground); color: var(--ink); font: 400 15px/1.55 var(--body); padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.wrap { max-width: 1240px; margin: 0 auto; padding-block: 40px 72px; display: flex; flex-direction: column; gap: 56px; }
h1, h2, h3 { font-family: var(--display); font-weight: 700; text-wrap: balance; margin: 0; }
h1 { font-size: clamp(32px, 5vw, 48px); letter-spacing: -0.02em; line-height: 1.05; }
h2 { font-size: 24px; letter-spacing: -0.01em; }
h3 { font-size: 18px; }
p { margin: 0; }
code { font-family: var(--mono); font-size: 12px; }
.intro { display: flex; flex-direction: column; gap: 12px; max-width: 68ch; }
.intro p { color: var(--ink-soft); }
.refs { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; padding: 0; list-style: none; }
.refs li { display: flex; align-items: center; gap: 8px; padding: 6px 12px 6px 6px; border: 1px solid var(--rule); border-radius: 999px; }
.refs .dot { width: 22px; height: 22px; }
.section { display: flex; flex-direction: column; gap: 20px; }
.section > header { display: flex; flex-direction: column; gap: 6px; max-width: 68ch; }
.section > header p { color: var(--ink-soft); }

.fam { display: grid; grid-template-columns: 210px minmax(0, 1fr); gap: 20px; padding-block: 18px; border-top: 1px solid var(--rule); }
.famhead { display: flex; flex-direction: column; gap: 4px; }
.famhead h3 { text-transform: lowercase; }
.kind { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); }
.note { font-size: 13px; color: var(--ink-soft); }
.roles { display: flex; flex-wrap: wrap; gap: 6px; padding: 0; margin: 6px 0 0; list-style: none; }
.roles li { font-size: 12px; padding: 1px 8px; border-radius: 999px; background: var(--panel); border: 1px solid var(--rule); }
.scroll { overflow-x: auto; }
.steps { display: grid; grid-template-columns: repeat(11, minmax(74px, 1fr)); gap: 6px; padding: 0; margin: 0; list-style: none; min-width: 860px; }
.sw { display: flex; flex-direction: column; gap: 6px; }
.chip { position: relative; height: 64px; border-radius: 8px; padding: 6px 8px; display: flex; align-items: flex-start; justify-content: space-between; box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.06); }
.step { font: 500 12px var(--mono); }
.sw.ref .chip { outline: 2px solid var(--ink); outline-offset: 2px; }
.refmark { font: 600 10px var(--body); letter-spacing: 0.06em; text-transform: uppercase; }
.meta { display: flex; flex-direction: column; gap: 1px; font-variant-numeric: tabular-nums; }
.cr { font-size: 11px; color: var(--ink-soft); }
.cr b { font-weight: 600; color: var(--ink); }

.themes { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.theme { display: flex; flex-direction: column; gap: 14px; }
.theme > header { display: flex; flex-direction: column; gap: 2px; }
.theme > header p { font-size: 13px; color: var(--ink-soft); }
.preview { background: var(--t-page); border: 1px solid var(--rule); border-radius: 14px; padding: 18px; color: var(--t-fg); }
.week { position: relative; background: #fff; border: 1px solid var(--t-border); border-radius: 12px; padding: 20px 16px 16px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 1px 2px rgb(0 0 0 / 0.05); overflow: hidden; }
.stripe { position: absolute; inset: 0 0 auto; height: 4px; background: linear-gradient(90deg, var(--t-from), var(--t-to)); }
.num { font: 700 36px/1 var(--display); color: var(--t-fg-brand); }
.num span { font: 400 13px var(--body); color: var(--t-fg-subtle); }
.line { font-size: 14px; }
.soft { font-size: 13px; padding: 10px 12px; border-radius: 8px; background: linear-gradient(90deg, var(--t-soft-from), var(--t-soft-to)); color: var(--t-fg); }
.row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.btn { background: var(--t-brand); color: var(--t-on-brand); font-weight: 600; font-size: 13px; padding: 7px 14px; border-radius: 8px; }
.pill { background: var(--t-subtle); color: var(--t-on-subtle); font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
.ring { font-size: 12px; padding: 4px 10px; border-radius: 8px; border: 1px solid var(--t-border); box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--t-ring); }
.warn { font-size: 13px; padding: 8px 12px; border-radius: 8px; background: var(--t-warn-bg); color: var(--t-warn-fg); border: 1px solid var(--t-border-warn); }
table { border-collapse: collapse; width: 100%; font-size: 13px; }
th { text-align: left; font-weight: 400; color: var(--ink-soft); padding: 5px 12px 5px 0; white-space: nowrap; }
td { padding: 5px 12px 5px 0; white-space: nowrap; }
tr + tr th, tr + tr td { border-top: 1px solid var(--rule); }
.dot { display: inline-block; width: 14px; height: 14px; border-radius: 50%; vertical-align: -2px; margin-right: 8px; box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.12); }
.diff { overflow-x: auto; border: 1px solid var(--rule); border-radius: 12px; padding: 8px 16px; }
.diff table { min-width: 640px; }
.diff thead th { font-weight: 600; color: var(--ink); font-family: var(--display); font-size: 14px; }
footer { color: var(--ink-soft); font-size: 13px; }

@media (max-width: 720px) {
  .fam { grid-template-columns: minmax(0, 1fr); gap: 12px; }
}
</style>
</head>
<body>
<div class="wrap">
  <header class="intro">
    <h1>Expecting palette</h1>
    <p>Every colour the three themes paint with: eight families, each a scale from 50 to 950. The five reference colours sit on the step their lightness puts them on, outlined below. Steps 600 and darker carry text; the ratio under each swatch is its contrast on white.</p>
    <ul class="refs">${REFERENCE.map((h) => `<li><span class="dot" style="background:${h}"></span><code>${h.toUpperCase()}</code></li>`).join("")}</ul>
  </header>

  <section class="section" aria-labelledby="families">
    <header><h2 id="families">Families</h2><p>One palette, shared. A theme never adds a colour of its own; it chooses which family is its brand and which two make its accent.</p></header>
    <div>${familyRows}</div>
  </section>

  <section class="section" aria-labelledby="themes">
    <header><h2 id="themes">Themes</h2><p>Each preview is drawn with that theme's own tokens: the current week's card, its accent stripe, a brand button, a subtle badge, the focus ring and a warning.</p></header>
    <div class="themes">${themeCards}</div>
  </section>

  <section class="section" aria-labelledby="diff">
    <header><h2 id="diff">What differs</h2><p>${differing.length} of the ${allTokens.length} tokens differ between the themes. Everything else (the neutrals, success, warning, danger) is the same in all three.</p></header>
    <div class="diff"><table><thead><tr><th>Token</th>${themes.map((t) => `<th>${t.name}</th>`).join("")}</tr></thead><tbody>${diffRows}</tbody></table></div>
  </section>

  <footer>Generated by <code>scripts/palette-sheet.ts</code> from <code>src/theme/palette.css</code> and the three theme files. Rerun <code>bun run palette</code> after changing either.</footer>
</div>
</body>
</html>
`;
await Bun.write(OUT, html);
console.log(`docs/palette.html: ${families.length} families, ${differing.length} of ${allTokens.length} tokens differ between the themes`);
