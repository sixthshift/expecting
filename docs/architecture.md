# Architecture

How expecting is built. What it is and why: [intent.md](intent.md). Running it: [development.md](development.md).

## Built so far

The five pillars (the timeline, the Library, the Planner, and placeholders for the Journal and Toolkit), built-in content in Markdoc tailored by the household's answers, onboarding, who's holding each phone, own tasks, questions for appointments, the due and birth dates, and the shared password. Not yet: the rest of the store (appointments, scans and photos, contacts, symptoms, names), our own items, hiding built-in items, the PWA manifest, the service worker, offline reads and writes. Everything below is the intended shape; where it isn't built, it says so.

Expecting has the same shape as garnish. Where this file says "as garnish", garnish's `docs/architecture.md` is the reference.

## Shape

- One Bun process. TanStack Start on Nitro's Bun preset serves the app, server functions and `/api/*` routes.
- One SQLite file, `DATA_DIR/expecting.db`, through Drizzle.
- One directory of uploads, `DATA_DIR/uploads/`, for scans and photos.
- One Docker container, with `DATA_DIR` on a mounted volume. That volume is everything worth backing up.

```
phone (PWA) ──server fns / HTTP──▶ TanStack Start (Nitro, Bun) ──▶ bun:sqlite ──▶ expecting.db
                                                              └──▶ uploads/      (DATA_DIR volume)
content/ (in the repo, bundled at build) ──▶ built-in items
```

## Access: one shared password

- No users, no accounts. One password, set as an environment variable and stored only as a hash.
- Logging in sets a long-lived, HTTP-only session cookie, so a phone stays logged in for months.
- Chosen over **no auth** (garnish's choice), because this data is personal and the app is meant to be reachable from a phone at the hospital. Chosen over **two accounts**, because nothing needs to be private from the other parent.
- Login attempts are rate limited: ten failures in fifteen minutes locks that client out, in memory.
- Sessions are rows holding the SHA-256 of the cookie's token, so a copy of the database is not a login. A session lives 400 days from its last use.
- Every request passes request middleware, which judges it by path: pages without a session redirect to `/login`, other `/api/*` calls get a 401, and only `/login` and `/api/health` are open.
- Server functions answer under `/api/rpc/`, each at a generated id, so request middleware lets those calls on, and function middleware judges each one by the file it is defined in: without a session, only `src/api/rpc/session.ts` answers. That file holds `login` and `logout`, ordinary server functions like the rest, so the app has one way of calling the server, and `src/api/rest/` is left for callers that aren't the app.
- Without `EXPECTING_PASSWORD_HASH` the dev server runs open; a production server refuses to start.

### Who's holding the phone

- The household's people are rows (`person`: a name, and `carrying` or `partner`). A device says which one it is once, and remembers it in a `expecting_person` cookie (`src/api/rpc/people.ts`).
- That cookie is not authentication: anyone past the password can say they are anyone. It is how Expecting can say who logged something and speak to each of you.
- It is separate from the session cookie, so it works on a dev server running open, and logging out doesn't forget who you are.

Open, and it decides the PWA: a service worker and installing to the home screen need HTTPS, which plain `http://<lan-host>:9966` is not. Tailscale (`tailscale serve` gives HTTPS on a `*.ts.net` name) is the easiest way to get both. Also open: whether expecting is reachable outside the LAN, and how — a VPN such as Tailscale, or public through the reverse proxy. The password is needed either way; a public route raises the bar for everything else.

## Phases

Expecting is three apps over one household: getting ready, the pregnancy, and the baby's here. Each is a folder, `src/features/phases/<phase>/`, whose `index.ts` lists its whole app: its layout, and its pillars in navigation order. Its pages are its routes, under its own path (`src/routes/<phase>/`), and its home is at `/<phase>`.

| Phase | When | Pillars | Home |
|---|---|---|---|
| **preconception** | No due date, and the answer to "expecting yet?" is not yet | Getting ready, Library, Planner | What's best done before (`src/features/phases/preconception/Home.tsx`), and "we're expecting" |
| **pregnancy** | A due date, or expecting without one yet | Timeline, Library, Planner, Journal, Toolkit | The timeline |
| **postpartum** | A birth date, or 42 weeks done with none | This week, Library, Planner, Journal, Toolkit | This week (`src/features/phases/postpartum/Home.tsx`); the Toolkit is the newborn's |

- **"Phase" is the code's word, never the screen's.** The type, `src/features/phases/<phase>/`, `PhaseApp`, `useApp().phase` and the timeline's slots all say phase. The screens name the moment instead: getting ready, expecting, baby's here. ("Stage" is kept for the stages of labour, which the Library explains.)
- **Derived, never stored** (`currentPhase`, `src/lib/phase.ts`), like the current week. Entering a due date or a birth date is what moves the household on; clearing the birth date moves it back.
- **The URL says the phase; the dates decide it.** Each phase's pages sit under its path, in the code's words: `/preconception`, `/pregnancy/planner`, `/postpartum/journal`. The phase is still a fact about the household, like this week, so each phase's layout route is a guard (`PhaseGuard`): a URL for any other phase (a link from week 39, opened after the birth; the page open as a due date is entered) goes to the same page in the household's phase, or its home when that phase hasn't the page (`samePageIn`, `src/lib/phase.ts`). `/` goes to the phase's home, and `/settings`, the same in every phase, sits outside them all.
- **The rest of `src/features/` is phase-agnostic; anything only one phase has lives in that phase.** The timeline is the pregnancy's (`src/features/phases/pregnancy/timeline/`), and so are its Journal and Toolkit, as the newborn's are its own. What every phase can use is a feature: onboarding, settings and login sit outside any phase; the Library, the Planner, tasks, questions and a week (`src/features/weeks/`, drawn on the timeline and on the newborn's This week) work in any. The store and the rules in `src/lib/` are shared too: an entry from week 39 is still yours after the birth.
- **A shared page keeps its frame in every phase; the phase tunes it.** The Library and the Planner look and work the same everywhere, so what you learned in the pregnancy is where your thumb expects it at 3 am. What differs is what comes first, and the phase's `index.ts` says it. The Planner (`planner:`): getting ready groups by now and once you're expecting, as it has no weeks to count; the pregnancy and the newborn group by week. The pregnancy still lets getting ready's open tasks slip (folic acid matters at week 6); the newborn leaves the pregnancy's behind, folded under "From the pregnancy", since an RSV vaccine can't be had after the birth. The questions are for your GP, the next appointment, or the next check-up. The Library (`library:`, arranged by `src/lib/library.ts`): getting ready puts its own items on a first shelf; the pregnancy leads with the things nobody tells you; the newborn puts the baby, recovery, check-ups and paperwork first, prompts search with "Is this normal?", and folds the pregnancy's reading away under "From the pregnancy". Every phase's Library still has every item, and search looks through all of them.
- **Shared code asks what the phase's app has, never which phase it is.** `usePhaseApp()` gives the current `PhaseApp`, and `usePhaseTo()` the path of a shared page in it (`to("/library/$itemId")` is `/pregnancy/library/$itemId` while expecting); an item's page offers "See week 28 on the timeline" only where `usePhaseApp().timeline`. A phase that gains its weeks says `timeline: true` in its `index.ts`, and the links appear. When a shared page diverges, its phase's routes point at a page in its own folder instead.
- **A route per page, per phase.** A phase's own pages are files in its folder (`src/routes/pregnancy/journal.ts`); the pages every phase has are built for each by one factory (`src/routes/shared.ts`). A page only one phase has is just a route there. The navigation is the phase's pillars, typed against the route tree, so a pillar can't point at a page that isn't there.
- `App` (`src/features/app/App.tsx`, the `app` route's component) keeps what every phase shares, the theme and the content context, and draws the phase's `Layout` with its pillars. The layouts share `PillarLayout` (`src/features/app/PillarLayout.tsx`), the sidebar and tab bar; each phase's `Layout` is where its own things around the pillars go.
- **Naming.** "Shell" means only what TanStack Start means by it: the HTML document (`shellComponent`, our `Document`) and SPA shell mode. The component that picks an app is `App`; what's drawn around the pillars is a layout.
- Only the pregnancy has the timeline; an item's page links to its week only there.

## Code layout

```
src/
  features/     a folder per domain: its pages and its parts
    phases/     the three apps and nothing else: <phase>/ (index.ts, Layout, its own pages), and index.ts listing them
    …           the rest phase-agnostic (app, household, weeks, tasks, questions, library, planner, settings, onboarding, auth)
  components/   generic parts with no domain: Page, DateForm, Coming
  lib/          pure rules and types: no React, no router, no store
  content/      the built-in items, bundled
  routes/       the pages' routes, definitions only: root.tsx, a file per route, <phase>/ (its layout and pages), shared.ts, tree.ts (the shape), search.ts
  api/          everything that answers at /api
    rest/       the server routes: fixed URLs for callers outside the app (/api/health)
    rpc/        the server functions: what the app calls, run on the server (/api/rpc/<id>)
  db/ server/   server only: the store, auth, boot
```

Biome holds the boundaries (`noRestrictedImports` in `biome.json`): only `db/`, `server/` and `api/` import the store or `server/`, and nothing else imports `api/rest/`, so the browser reaches the server only through `api/rpc/`; nothing imports `routes/` (a page reads its route through `getRouteApi`); `lib/` and `content/` import no React, router or server; the rest of `features/` and `components/` never import `features/phases/` (the route tree hands the apps to `App`); and no phase imports another. Routes are code, a file per route in `src/routes/`, put together in `tree.ts`.

## The pillars

In the pregnancy, the app is five pillars in its frame: a sidebar on a desktop, a tab bar on a phone.

| Pillar | Route | Holds |
|---|---|---|
| **Timeline** | `/` | The weeks: the thread the other four meet on |
| **Library** | `/library`, `/library/<id>` | Everything Expecting knows: shelves in the order the phase wants (a "nobody tells you" shelf, a shelf per topic), search (`?q=`), each item on its own page |
| **Planner** | `/planner` | To do, grouped by when it matters (`src/lib/planner.ts`), and the questions for whoever you'll see next |
| **Journal** | `/journal` | What happens, kept. *Placeholder: says what is coming.* |
| **Toolkit** | `/toolkit` | Things to use in the moment. *Placeholder.* |

- **One load for all of them.** The `app` route loads the household, the checklist, the people and the questions once; `useApp()` (`src/features/household/useApp.ts`) tailors the items and tasks and places "now". Moving between pillars is instant, and they never disagree. A change goes through `useAction` (`src/features/household/useAction.ts`): it saves, then reloads that one load, so every pillar sees it.
- **The frame provides what content renders against** (the answers, now, the questions already on your list), so a Markdoc tag works the same on the timeline and in the Library.
- **Settings sits in the frame too**; onboarding and login don't.
- **Each thing lives in one pillar and meets the others on the timeline.** A task is the Planner's, and shows in its week; an asked question is the Planner's, and lands in the week it was asked; an item is the Library's, and appears in the week it starts.

## The timeline

One scroll of weeks, from getting ready (preconception) through pregnancy weeks 1–42 to 12 weeks after the birth, opened at this week (`src/features/phases/pregnancy/timeline/`), and only in the pregnancy. It has no views: what used to be views are the Planner and the Library's shelves.

- **Weeks are bands.** The current week is open, with the gestation line, what has slipped, what is still running from earlier weeks, and a link to the questions waiting for the next appointment. Every other week is folded to one line of what's in it (`2 new · 1 to do`) until opened. Each item appears once, in the week it starts. The rules are in `src/lib/timelineView.ts`, tested apart from the screen.
- **The ruler moves along it.** It's a vertical rail down the right edge on the desktop and a scrubber just above the tab bar on a phone (`--tab-bar` holds the bar's height). Both are one `Ruler` component and an ARIA slider: drag or tap to scrub; arrows step a week, Page Up/Down four, Home/End the ends. Each week shows a dot when something starts and amber when a task there has slipped. "Now" is marked, and so is the week in view (the last week whose top has passed a reading line under the sticky bar).
- **Adding happens where it belongs.** An own task is added inside its week, or in the Planner for this week. A question is added in the Planner.
- `?at=28` opens at another week; an item's page links to its week this way.

## Adaptive

- Both sizes get a designed layout. Desktop: the pillars in a sidebar on the left; on the timeline, the ruler in its own column on the right and a sticky week number beside each week; the Planner in two columns. Phone: the tab bar under the thumb, settings behind a gear at the top of each pillar, the scrubber above the tab bar. Item bodies keep a readable line length at every size.
- Tap targets are at least 44px. No hover-only interactions. Safe areas are respected.
- e2e loads every page at both sizes (`phone` and `desktop` projects).

## Theme

Expecting has its own theme, not the design system's Linen. It's built from a reference palette: `#9DC3E2` blue, `#9DD2D8` aqua, `#FADCE4` blush, `#FFB5CC` pink, `#E2B9DB` lilac.

- **Palette** (`src/styles/theme/palette.css`): a 50–950 scale per family, generated by `bun run palette` from `scripts/palette.ts`. The reference colours sit exactly on the step their lightness puts them; the rest of each scale is built around them in OKLCH. The families are sky, lagoon, blossom (pink), lilac, mist (the neutral), sea (success), peach (warning) and cherry (danger). Steps 600 and darker carry text, and a test holds them to AA contrast on white; the pastels themselves can't.
- **The sheet** (`docs/palette.html`): every family and the three themes, drawn from the CSS the app ships, to open in a browser. `bun run palette` writes it after the palette (`scripts/palette-sheet.ts`).
- **Three themes**, chosen by one question in Settings (boy, girl, or don't know / keeping it a surprise):
  - **Baby Blue** (`baby-blue.css`): a boy. Blue brand, sky-to-aqua accent.
  - **Baby Pink** (`baby-pink.css`): a girl. Pink brand, pink-to-lilac accent.
  - **Baby Purple** (`baby-purple.css`): don't know or surprise, and the default. Lilac brand, blue-to-pink accent.
- Each theme sets every semantic token the design system reads, in light mode only (there's no dark mode yet). Each also sets Expecting's own `--expecting-accent-*` pair, for the gradients in progress bars (onboarding, an item's window of weeks). The page is white with at most a temperature (`--expecting-page`): a cool white in Baby Blue, a warm white in Baby Pink, plain white in Baby Purple. Colour comes in accents (the brand, the progress bars, the ruler), never as a fill. Never as a border on one side of a box, either: a card is outlined all round or not at all. Neutral, success, warning, danger, the corner scale and the type stacks are shared.
- `data-expecting-theme` on `<html>` picks the theme (`src/lib/theme.ts`). The answer is stored on the household (`baby`). The browser remembers the last theme in `localStorage`, and an inline script in `<head>` applies it before paint, so a reload doesn't flash Baby Purple.
- The three are separate files on purpose, so each can be judged on its own. If they turn out to differ only in brand, they can merge into one theme with named brands, which the design system supports through `data-brand`.

## PWA

- **Installable.** A web app manifest, icons, and Apple metas, as garnish.
- **Service worker.** Hand-written, no Workbox, emitted by a small Vite plugin, as garnish.
- **Offline reads.** Built-in content is bundled with the app, so every week reads offline. The app shell and the last-fetched data are cached. Hospital Wi-Fi is unreliable, and the hospital bag checklist has to open there.
- **Offline writes.** Ticking a task or adding a note while offline is queued and sent on reconnect, using garnish's outbox pattern. Photo uploads need a connection.

## Onboarding

- `/onboarding` asks the first-run questions, one to a screen and each at its own URL (`/onboarding/due`, `/onboarding/q/cover`; routes in `src/routes/onboarding/`, screens in `src/features/onboarding/steps/`), so the phone's back gesture goes back a question. The frame sends anyone there who still has a step: a new household gets all of them, a new phone only "who's this?".
- After an answer, `/onboarding?after=due` goes on to the next step still to ask, worked out afresh (`stepAfter`), since an answer can change what's left: "not yet" drops the due date. A URL for a step that isn't asked goes to the one that is.
- Which steps a device sees is a pure function of what is known (`src/lib/onboarding.ts`): who, then whether you're expecting (or getting ready), then the due date and the baby's colours when expecting, then every `asked: onboarding` question in `content/profile.yaml`, then where Expecting will open.
- Each answer is saved as it's given, so a reload resumes. A household with a due date from before onboarding existed counts as onboarded.
- Getting ready with no due date opens the timeline at the getting-ready band; entering a due date later moves it into the pregnancy.

## Tailoring

- `content/profile.yaml` holds the questions. The household's answers are a JSON object of question id to answer id on the household row: adding a question is a content change, not a migration. Settings shows every question, built from the file.
- An item's `when:` hides it on a definite answer; `{% if equals($cover, "yes") %}` tailors a passage. An unanswered question hides nothing, so the `{% else %}` branch is the general wording.
- `src/content/profile.ts` has the rules (`applies`), tested apart from the screen.

## Content

- Built-in items live in the repo as `content/<phase>/<id>.md`, one Markdoc file per item, with frontmatter for weeks, category, `when`, source, last checked and linked tasks. `content/profile.yaml`, the questions every phase is tailored by, sits above the folders.
- **The folder is the item's phase,** and the file's name is its id: the frontmatter has no `phase:`, and a file outside a phase's folder or named for another id fails the gate. An item belongs to exactly one phase. Its phase says *when it matters*, not who can read it: every phase's Library has every item, so in week 34 the newborn's are there to read ahead.
- Bodies are Markdoc: Markdown plus declared tags (`src/content/markdoc.ts`), each drawn by a component in `src/features/library/content/`. `{% ask %}` is a suggested question, added to your list in one tap; `{% window %}` draws an item's weeks against today. Every tag, attribute, `$question` and answer is checked as the content loads.
- They are validated with zod when the content module loads, and `bun run test` loads it, so a malformed item fails the gate, not the page.
- Each item's weeks are its phase and a range of weeks within it (`preconception`, pregnancy 1–42, postpartum 1–12), the same `Slot` that `src/lib/timeline.ts` derives the current week as.
- Each item and each linked task has a stable id in its frontmatter. Ticks and hides in the database point at that id, so editing an item's wording never loses state.
- Chosen over **content in the database**, because built-in content is reviewed like code: diffs, history, and a build that refuses bad data.

Our own items are rows in the database with the same fields. One read path merges the two, so screens never ask where an item came from.

## Data

The database holds only what we create:

- our own items and their tasks
- task state: ticked, and when — for built-in and own tasks alike
- hidden built-in items
- appointments, questions, contacts, symptoms, baby names
- photo records; the files themselves are in `uploads/`
- the household: the due date, the birth date, the baby's colours, the answers to the profile questions, and when onboarding finished
- the household's people
- sessions

The current week is derived from the due date and the birth date on read, never stored.

## Backups

`DATA_DIR` holds the database and the uploads, and nothing else. Back up the volume with the host's existing backup. A backup is only trusted once a restore has been tested.

Open: which host — Castle or Tower — and so which backup job covers it.
