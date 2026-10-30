# Plan: dark mode

**Status (2026-10-30):** steps 1–4 built (the dark blocks, the wiring, the
switch), with an e2e for boot, switch and reload. Left: step 5's look at every
pillar in all six on a phone.

Expecting is light only: each of the three themes (`src/styles/theme/baby-*.css`)
maps the design system's semantic tokens to the palette "in light mode
(Expecting has no dark mode yet)". This plan gives all three a dark mode.

Why now, and why all three:

- **The moments that matter most are at night.** Awake at 3 a.m. wondering
  if something is normal, Emergency info when something goes wrong
  overnight, the contraction timer when it comes, and later the night feeds.
  A white screen then is harsh, and lights up the room beside a sleeping
  partner.
- **The palette and the mode are two different choices.** The palette is the
  household's (boy, girl, don't know: the same on both phones, from the
  server). The mode is each phone's (one of you may live in dark mode, the
  other not). So every palette needs both modes, six in all; a palette
  without a dark mode would let the household's answer decide whether one of
  you can have it.
- **Most of the groundwork is done.** Components read semantic tokens only
  (`--bg-normal`, `--fg-subtle`, …), so a dark mode is a second mapping per
  theme, not a change to components. The design system already has the
  machinery: `bootstrapTheme()` and `useTheme()` in
  `@sixthshift/design-system/hooks` keep light, dark or system per device, in
  `localStorage`, painted as `data-theme` on `<html>`; its Tailwind bridge
  already defines `dark:` on `[data-theme="dark"]`; and its own theme, Linen,
  is the model to follow: a `:root[data-theme="dark"]` block beside its light
  one.

## Decisions to confirm

- **Default: System (match the phone).** A phone in dark mode opens Expecting dark,
  with no setting touched.
- **A switch per phone, in settings under Appearance:** Light, Dark, Match
  phone. Not a household setting; never on the server.
- **Pastel fills in the dark.** In light mode a brand button is a deep shade
  (`sky-600`) with light text. In the dark, the pastel itself (`300`–`400`)
  as the fill with dark text keeps the theme recognisable; a deep shade on
  near-black would read as a muddy blue, pink or purple. Proposed: pastel
  fills, dark text on them.
- **Night, not just dark.** The page is a warm near-black (`mist-950` or
  darker), not pure black; colour stays in accents and is dimmer than by day,
  so nothing glows.

## How it fits together

Two attributes on `<html>`, set independently:

| Attribute | Chooses | Owner | Set by |
|---|---|---|---|
| `data-expecting-theme` | the palette: `baby-blue`, `baby-pink`, `baby-purple` | the household | `useTheme(baby)` (`src/app/hooks/useTheme.ts`), from `settingsQuery` |
| `data-theme` | the mode: `light`, `dark` | this phone | the design system's `bootstrapTheme()`, then its `useTheme()` |

Each theme file gains a dark block. The selectors pair the two, for the page
and for a preview inside it (settings' colour choice draws each palette in
place):

```css
:root[data-expecting-theme="baby-blue"],
[data-expecting-theme="baby-blue"] { /* light, as now */ }

:root[data-theme="dark"][data-expecting-theme="baby-blue"],
[data-theme="dark"] [data-expecting-theme="baby-blue"] { /* dark */ }
```

The naming clash: Expecting's hook is `useTheme`, and so is the design
system's. Once both are used, Expecting's becomes `useBabyTheme` (or
`usePalette`), so "theme" means one thing in each file.

## Steps

### 1. The palette, for the dark

- `scripts/palette.ts` builds a 50–950 scale per family from a lightness
  ladder (`LIGHTNESS`, 0.975 down to 0.22). Check whether the dark ends are
  enough: `mist-950` (#1b1a1e) as the page, `mist-900` as a raised surface.
  If the page wants to be darker or warmer, add a step (`975`), generated,
  never hand-edited.
- Extend the contrast report it prints: today, which steps carry text on
  white; add which steps carry text on the dark page and on a dark surface,
  and which pastel fills carry dark text. That report is the check for
  step 2.

### 2. A dark block in each theme

Start with Baby Purple (the default, and the one most households see), review
it on a phone, then Baby Blue and Baby Pink.

Every token the light block sets, re-pointed for the dark. Roughly, after
Linen's dark block:

| Token family | Light | Dark |
|---|---|---|
| `--bg-normal`, `--bg-subtle` | white, `mist-50` | `mist-900`, `mist-800` |
| `--bg-strong` | `mist-800` | `mist-100` (inverted: light on dark) |
| `--bg-brand` | `sky-600` | `sky-300` or `400`, with dark `--fg-on-brand` |
| `--bg-brand-subtle` | `sky-100` | `sky-900` or `950`, dimmed |
| `--bg-success/warning/danger*` | `600` fills, `100` tints | `400` fills, `900`/`950` tints |
| `--fg-normal`, `--fg-strong` | `mist-900` | `mist-50`, `mist-100` |
| `--fg-subtle` | `mist-500` | `mist-400` |
| `--fg-brand` | `sky-700` | `sky-300` |
| `--fg-on-brand*` | `mist-50` | `mist-950` (dark text on pastel fills) |
| `--border-subtle`, `--border-normal` | `mist-100`, `mist-300` | `mist-800`, `mist-700` |
| `--bg-overlay` | `rgba(0,0,0,.5)` | `rgba(0,0,0,.6)`, as Linen |
| `--focus-ring` | `sky-500` | `sky-400` |

Hovered, pressed and disabled steps follow the same direction: in the dark,
hovering goes lighter, not darker.

Expecting's own tokens:

- `--expecting-page`: a warm near-black, the theme's temperature kept (a
  breath of blue, pink or lilac), as the light page is "white, at most a
  temperature".
- `--expecting-accent-from/-to`: the pastels, a step deeper and a little less
  chroma, so the gradients (the onboarding bar, the Emergency card, item
  cards' top edge, the stork) don't glow.
- `--expecting-accent-soft-from/-to`: the tints become dark (`900`/`950`),
  for the panels drawn on them (settings' summary, the extra on offer, the
  names game).

Each theme file's header comment drops "(Expecting has no dark mode yet)" and
says what the dark block does.

### 3. Wiring

- **Boot without a flash.** `THEME_BOOT_SCRIPT` (`src/lib/theme.ts`, inlined
  in `<head>` by `src/app/pages/Document.tsx`) paints the palette before the
  page draws. Extend it, or add a second, to set `data-theme` the same way:
  the stored mode, or the phone's (`prefers-color-scheme`) when it's "match
  phone". It must read the design system's storage key (`theme`, a JSON
  string) so the two never disagree.
- **Start the design system's mode.** Call `bootstrapTheme()` once on the
  client (in `App`, and in onboarding's layout, which sits outside it), so
  "system" follows the phone when it changes mid-session, and another
  tab's change applies.
- **Native parts.** `color-scheme: dark` in the dark blocks, so scrollbars,
  form controls and the date picker turn dark too.
- **The phone's bar.** A `<meta name="theme-color">` for each mode
  (`media="(prefers-color-scheme: dark)"`), set from the page colour, so the
  status bar matches. Updated when the mode is chosen by hand.

### 4. The switch

In settings, under Appearance (`features/settings/components/appearance/`), its own
section beside Session (who's holding it, log out): Light, Dark, System, with the design system's
`useTheme()` behind it. It changes at once, before any save, as the colour
choice does. The colour choice's swatches draw each palette in the current
mode, so you see what you'd get.

### 5. Checks

- **Contrast, all six.** Every text token on every surface it's used on, AA
  (4.5:1) for body text, 3:1 for large text and UI edges. The palette
  report from step 1 covers the pairs; a short script or test over the
  resolved tokens catches a regression.
- **A look at every pillar, in all six**, on a phone: This week, the
  timeline (its windows chart and week map are the most colourful), an item
  of each type (the triage levels and verdict badges especially), the
  Planner, the Drawer, Emergency info, onboarding, settings.
- **e2e:** a phone set to dark opens dark with no flash (`data-theme` is set
  before the first paint), the switch changes it and it survives a reload,
  and the palette still follows the household's answer in either mode.
- **Hard-coded colours.** Search components for anything not a semantic
  token (`white`, `black`, hex, `rgba`) and for comments that assume a light
  page ("on white so it shows on the tint", in `SettingsPage.tsx`).

## Not in this plan

- Per-palette dark tuning beyond the token mapping (a different neutral per
  theme in the dark, say). Only if the review asks for it.
- Dimming images and photos at night: there are none yet (bump photos wait
  for uploads).
- A scheduled dark mode (dark after sunset). System does this already
  on phones that schedule it.
