# Handoff: design-system components (1 November 2026)

## Where things stand

- Expecting is on `@sixthshift/design-system` **0.12.1**, with no patches.
- The code is committed: `b73b394` ("chore: design system 0.12.1, one width
  for the pillars, a components sheet"), and the gate passed on it.
- This folder (`docs/design-system/`) was never committed and was lost from
  disk; it was rewritten on 1 November from the session that made it.
  Commit it, so it isn't lost again.

## What was done

1. **Found the repeated patterns.** `docs/components.html` shows each
   hand-written pattern as it is today and the component it would become, in
   all three themes, light and dark. `bun run components:sheet`
   (`scripts/components-sheet.ts`) regenerates its styles from the app's own
   Tailwind and theme.
2. **Mapped them against the design system.** Five were already covered by
   the design system: Card, SectionTitle, Button `inline`, Message and
   ProgressBar. So were the Muted, Caption and Body text styles, which are
   written out by hand about 107 times.
3. **Agreed a way of working.** Requests to the design system go as specs in
   this folder, built in the design-system repo. Only generic asks;
   Expecting's own look stays in Expecting.
4. **Upgraded 0.11.0 → 0.12.0 → 0.12.1.**
   - Added the four new shadow steps (`--box-shadow-xs` to `-lg`) to
     `src/styles/theme/index.css`. Without them every shadow renders flat.
   - Retired the old `preventScroll` patch: 0.12.1 fixes it upstream.
5. **Moved the app onto design-system components:**
   - **Message** in `TooSick` and `MovementsChanged`
     (`src/features/journal/components/entries/…`, `role="alert"`), `Triage`
     (compound parts, `role="note"`, `h3` titles) and the Library's "Worried
     now?" in `Shelf.tsx` (`role="note"`). `Ask` gained a `className`.
   - **Card `variant="placeholder"`** for `PlaceReady`
     (`src/features/journal/components/thisWeek/WeekPage.tsx`).
     Tests pass, but it hasn't been checked visually.

## Requests to the design system

| Spec | Status |
|---|---|
| [`message.md`](message.md) | Done in 0.12.0. **Follow-up open:** `MessageProps` should leave out HTML's own `title`, as Card's props do, so a heading can be passed as `title`. |
| [`focus-scroll.md`](focus-scroll.md) | Done in 0.12.1, including TimePicker. |
| Card `asChild` (a link drawn as a Card) | Discussed; the spec is deliberately not written yet. |

## Decisions waiting

These block the remaining migrations:

1. **Card's look:** a subtle border and no shadow (like the hand-written
   panels), or Card's own border and shadow. This blocks moving about 16
   hand-written panels onto Card.
2. **SectionTitle:** medium weight as it ships, or semibold like ours. This
   blocks 17 eyebrow labels.
3. **Progress bars:** a flat fill using `ProgressBar`, or keep the gradient
   (Onboarding, Settings).
4. **Button `inline` for text links:** it underlines only on hover and has no
   44px height (13 links and 7 "more" links).

## Can be done without a decision

- Replace the hand-written text styles with **Muted, Caption and Body**,
  about 107 places, with no visual change. It touches many files, so it's
  best done in its own worktree while nothing else is mid-edit there.
- **List and ListRow:** move `SettingList` out of settings into
  `src/components/`. Nothing in the design system covers it.

The counts above are from 31 October; the Journal refactor since has moved
files, so recount before starting.
