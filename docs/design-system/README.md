# Requests to the design system

Expecting uses `@sixthshift/design-system` (0.12.1, no patches). What it
asks of the design system goes here as a spec, one file per component, to be
carried over and built in that repo. A request is only what any app would
want; Expecting's own look stays in Expecting (`src/styles/theme/`).

`docs/components.html` shows each pattern the app still writes by hand
beside the component it would become, in every theme, light and dark;
`bun run components:sheet` regenerates its styles.

## Open

- [`message.md`](message.md): `MessageProps` should leave out HTML's own
  `title`, so a heading can be passed as `title`.
- **Card `asChild`** (a link drawn as a Card): discussed, not yet written.

## Decisions waiting

Each blocks moving hand-written parts onto a component:

1. **Card's look:** a subtle border and no shadow, like the hand-written
   panels, or Card's own border and shadow (about 16 panels).
2. **SectionTitle:** medium weight as it ships, or semibold like ours (about
   17 eyebrow labels).
3. **Progress bars:** `ProgressBar`'s flat fill, or keep the gradient
   (onboarding, Settings).
4. **Button `inline` for text links:** it underlines only on hover and has
   no 44px height (about 20 links).

## Can be done without a decision

- The hand-written text styles onto **Muted, Caption and Body**, about 107
  places, no visual change. Touches many files: best in its own worktree.
- **List and ListRow:** move `SettingList` out of settings into
  `src/components/`.

The counts are rough: recount before starting.
