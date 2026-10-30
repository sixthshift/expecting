# Architecture

How expecting is built. What it is and why: [intent.md](intent.md). Running it: [development.md](development.md).

## Built so far

The pregnancy's six pillars (This week, the timeline, the Library, the Planner, and placeholders for the Journal and the Drawer), built-in content in Markdoc tailored by the household's answers, onboarding, who's holding each phone, own tasks, questions for appointments, the due date, and the shared password. Getting ready and the weeks after the birth are out of the first version ([One app, the pregnancy](#one-app-the-pregnancy)). Not yet: the rest of the store (appointments, scans and photos, contacts, symptoms), our own items, hiding built-in items, offline writes. Everything below is the intended shape; where it isn't built, it says so.

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

- No users, no accounts. One password, chosen on the first visit and stored only as its argon2id hash, in the database (`password`, one row).
- Until it is chosen, `/login` asks for it, and whoever reaches it first chooses it. Accepted because it is self-hosted on the household's own network: the household sets it straight after starting the container, and if someone beat them to it, they delete the data folder and start again. There is no way to change or reset it in the app; a new database is the reset. Chosen over a hash in an environment variable, which made setup a command to run and a `$`-quoting trap in `.env`.
- Logging in sets a long-lived, HTTP-only session cookie, so a phone stays logged in for months.
- Chosen over **no auth** (garnish's choice), because this data is personal and the app is meant to be reachable from a phone at the hospital. Chosen over **two accounts**, because nothing needs to be private from the other parent.
- Login attempts are rate limited: ten failures in fifteen minutes locks that client out, in memory.
- Sessions are rows holding the SHA-256 of the cookie's token, so a copy of the database is not a login. A session lives 400 days from its last use.
- Every request passes request middleware, which judges it by path: pages without a session redirect to `/login`, other `/api/*` calls get a 401, and only `/login` and `/api/health` are open.
- Server functions answer under `/api/rpc/`, each at a generated id, so request middleware lets those calls on, and function middleware judges each one by the file it is defined in: without a session, only `src/api/rpc/session.ts` answers. That file holds `choosePassword`, `login` and `logout`, ordinary server functions like the rest, so the app has one way of calling the server, and `src/api/rest/` is left for callers that aren't the app.
- `EXPECTING_LOGIN=off` turns logins off: every request gets through, `/login` sends you on, and Settings offers no Log out. For a household that keeps it on a LAN it trusts and would rather not have a password at all. On is the default, so leaving the variable out never opens anything, and a value that is neither `on` nor `off` is an error rather than a guess. The dev server reads it too. Turning it back on later asks for a password on the next visit if none was ever chosen.

### Who's holding the phone

- The household's people are rows (`person`: a name, and `carrying` or `partner`). A device says which one it is once, and remembers it in a `expecting_person` cookie (`src/api/rpc/people.ts`).
- That cookie is not authentication: anyone past the password can say they are anyone. It is how Expecting can say who logged something and speak to each of you.
- It is separate from the session cookie, so it works with logins off just as with them on, and logging out doesn't forget who you are.

Open, and it decides the PWA: a service worker and installing to the home screen need HTTPS, which plain `http://<lan-host>:9966` is not. Tailscale (`tailscale serve` gives HTTPS on a `*.ts.net` name) is the easiest way to get both. Also open: whether expecting is reachable outside the LAN, and how — a VPN such as Tailscale, or public through the reverse proxy. The password is needed either way; a public route raises the bar for everything else.

## One app, the pregnancy

The first version of Expecting is the pregnancy alone: weeks 1–42, from the due date. Getting ready before a pregnancy and the weeks after the birth were built as apps of their own (preconception and postpartum, each a phase with its own pillars) and taken out to keep the first version small. The code has no phases now: no phase type, no phase in the URL, no birth date.

- **The URL is the page.** Home is `/`, and each pillar sits at its own path: `/timeline`, `/library`, `/library/<id>`, `/planner`, `/journal`, `/drawer`, and `/settings` beside them. The navigation is `PILLARS` (`src/app/components/layout/pillars.ts`), typed against the route tree, so a pillar can't point at a page that isn't there.
- `App` (`src/app/pages/App.tsx`, the `app` route's component) keeps the household's colours and the content context, and draws the pillars in `PillarLayout` (`src/app/components/layout/PillarLayout.tsx`), the sidebar and tab bar.
- **Naming.** "Shell" means only what TanStack Start means by it: the HTML document (`shellComponent`, our `Document`) and SPA shell mode. The component around the pillars is `App`; what's drawn around them is a layout.
- **When the other phases come back,** the pregnancy's week stops being the whole timeline: a slot becomes a phase and a week, and the content's folders say which phase an item is in. Git history has both apps as they were.

## Code layout

```
src/
  app/          the app itself, not a domain: the document, the frame around the pillars (App, PillarLayout, PILLARS), the error and not-found pages, useAction; in a feature's shape
  features/     a folder per domain: its pages and its parts (home, timeline, library, planner, journal, drawer, names, weeks, tasks, questions, settings, onboarding, auth)
  components/   generic parts with no domain: Page, DateForm, Coming
  lib/          pure rules and types: no React, no router, no store
  content/      the built-in items, bundled
  routes/       the pages' routes, definitions only: root.tsx, a file per route, onboarding/, tree.ts (the shape), search.ts
  api/          everything that answers at /api
    rest/       the server routes: fixed URLs for callers outside the app (/api/health)
    rpc/        the server functions: what the app calls, run on the server (/api/rpc/<id>)
  db/ server/   server only: the store, auth, boot
  pwa/          the service worker (worker.js), the Vite plugin that emits it, and its registration
```

Every feature has one predictable shape, each folder only where it has something: `pages/` its pages (what a route draws), `components/` its parts (a folder per aspect, as settings' `facts/`, `extras/`, `colour/`, `appearance/`, `session/`, and loose the parts they share, as `SettingRow`), `hooks/` its hooks (`useItems`, `useTasks`, `useAction`), and `model/` what has no React in it: rules, types, paths. Settings' `model/` is the one the rest of the app (`lib/`, `content/`, `api/rpc/`) may import too. Settings owns the questions and the extras, wherever they are drawn: `AskNow` on This week and `OfferExtra` in onboarding are its components.

```
features/settings/
  pages/        SettingsPage
  components/   SettingRow; facts/ (FactsForm, AskNow), extras/ (ExtrasList, OfferExtra), colour/, appearance/, session/
  model/        facts.ts + facts.data.ts (the questions), extras.ts + extras.data.ts (the extras)

features/library/
  pages/        LibraryPage, LibraryItemPage
  components/   ItemCard, ItemList; content/ (the Markdoc tags), doors/, related/, rightNow/
  hooks/        useItems
  model/        pageOf
```

Biome holds the boundaries (`noRestrictedImports` in `biome.json`): only `db/`, `server/` and `api/` import the store or `server/`, and nothing else imports `api/rest/`, so the browser reaches the server only through `api/rpc/`; nothing imports `routes/` (a page reads its route through `getRouteApi`); and `lib/` and `content/` import no React, router or server, and nothing from `features/` but `features/settings/model/` (the questions and extras: pure, and held to the same rule). Routes are code, a file per route in `src/routes/`, put together in `tree.ts`.

## The pillars

The app is six pillars in its frame: a sidebar on a desktop, a tab bar on a phone.

| Pillar | Route | Holds |
|---|---|---|
| **This week** | `/` | Home: where you are as its heading (the week, the baby's size, how far along), To do now (the most urgent few, `src/features/tasks/components/toDoNow/ToDoNow.tsx`), the week's note (the one in force: its own, or the latest before it), what Expecting needs to know, what's worth knowing this week, Coming up (the next eight weeks after To do now's two, `comingUp` in `src/lib/todo.ts`) and the questions waiting. Desktop: the week on the left, the doing on the right. A step back or ahead peeks at another week (`/?at=29`): its own note, what's worth knowing and what's best done then, with a way back to this week. |
| **Timeline** | `/timeline`, `?at=28` | Every week: the thread the others meet on |
| **Library** | `/library`, `/library/<id>` | Everything Expecting knows, by the question you came with: search (`?q=`, results replace the page), then three doors (Can I…? and Is this normal?, marked "Coming" until their content types arrive; Nobody tells you, down to its shelf), then Right now (the items open this week, soonest-closing first, with where each window stands), then everything by topic: the "nobody tells you" shelf and a shelf per topic. The rules are in `src/lib/library.ts`; the doors in `src/features/library/components/doors/Doors.tsx`. Each item on its own page leads with its summary and tasks, then the body and source |
| **Planner** | `/planner` | To do, so there's always somewhere to start (`src/lib/planner.ts`): progress so far, Next up (the one thing to do first, with when, whose and why), Also now (the rest of To do now, in the same order as This week), then folded away On the horizon (by the week each next asks of you: opens, best by or deadline), Missed earlier and Done. Beside it, the questions for the next appointment |
| **Journal** | `/journal` | What happens, kept. *Placeholder: says what is coming.* |
| **Drawer** | `/drawer` | The handy things: baby names, the bump booth, the contraction timer, the hospital bag. *Built: Emergency info (`/drawer/emergency`: the pregnancy at a glance, who to call with each number a call button, what a doctor will ask and the numbers you'll be asked for; the fields are fixed in `src/lib/emergency.ts`, the values the `emergency` table, shared and editable by both) and the names game, with the Choosing a name extra; the rest says what is coming.* |

- **A query per thing, beside its server function.** Each file in `src/api/rpc/` holds both sides of one thing: its server functions, its query, and the query's hook, named for what it holds (`useSettings`, `useAnswers`, `useExtras`, `usePeople`, `useChecklist`, `useQuestions`, `useNames`, `useEmergency`). A hook is only a shortcut: `useSuspenseQuery` over its query, returned as is for the caller to destructure, with any options it's given overriding the defaults. What's worked out from one query is a `select`, which runs only when the data changes and keeps its result between renders: `const { data: facts } = useAnswers({ select: factsOf })`, `useExtras({ select: extrasOn })`. `settings.ts` also has `usePosition()` and `useNow()`, which need today as well as the due date. TanStack Start's compiler turns each server function into a fetch in the browser and drops what only its handler imports, so a page can import the file whole. The `app` route's loader makes sure of the queries nearly every page reads, side by side, before any pillar draws; the names and Emergency info only their pages load. The query cache is the only state: no provider, no context, no aggregate. A component reads the queries and hooks it needs; `useItems()` (the items the facts and extras fit, `src/features/library/hooks/useItems.ts`) and `useTasks()` (their tasks, timed, then your own, `src/features/tasks/hooks/useTasks.ts`) combine several, each a pure function (`tailorItems`, `tailorTasks`) in a `useMemo`, about a tenth of a millisecond, so each caller doing its own costs nothing. Moving between pillars is instant, and they never disagree once a save is in. A change goes through `useAction` (`src/app/hooks/useAction.ts`): it saves, then refetches the queries on screen with the page still drawn (never the loading page, which would lose your place), and only then resolves, so what comes next draws what was saved. The queries come back one at a time, so what's on screen can be half-new until then: onboarding keeps its step drawn while a save is pending, rather than react to a half-refetched state. A failed save says so in a toast; an ended session goes to log in. Every change goes through it: a save that doesn't leaves the queries stale.
- **The frame provides what content renders against** (the answers, now, the questions already on your list), so a Markdoc tag works the same on the timeline and in the Library.
- **Settings sits in the frame too**; onboarding and login don't.
- **A week's note reads as whoever holds the phone:** the baby, then your body or the partner's part, with a toggle to read it as the other (`src/features/weeks/components/weekNote/WeekNote.tsx`).
- **Each thing lives in one pillar and meets the others on the timeline.** A task is the Planner's, and shows in its week; an asked question is the Planner's, and lands in the week it was asked; an item is the Library's, and appears in the week it starts.

## The timeline

The map: the whole pregnancy at once, weeks 1–42 under their trimesters (`src/features/timeline/`). A week's detail is This week's, not the timeline's: every week links to `/?at=<week>`. It has no views: what used to be views are the Planner and the Library's shelves. The rules are in `src/lib/timelineMap.ts`, tested apart from the screen.

- **A week is a line** (`WeekMap`): its note's title, or a landmark (Halfway, Full term, Due date), and what it has: what opens, what's to do or has slipped, what's done, the questions asked there. Today is marked.
- **The windows are what each item asks of you, across its weeks** (an item with tasks, from its first week to its last), coloured by where they stand: open now, ahead, closed or done. They are a chart across the pregnancy (`WindowsChart`), with the trimesters behind them, the landmarks as faint lines and today as a line; each row goes to its item. On a desktop the labels are a column beside the chart; on a phone the chart is the width of the screen and each label sits over its bar, starting where the bar does (or ending where it does, late in the pregnancy).
- **Below the chart, the weeks:** one column on a phone, with a Today button to its line; three on a desktop, a trimester each.
- **Expecting knows what to do; you don't fill it in.** The weeks carry no add box. An own task, for the odd thing Expecting couldn't know, is added at the foot of the Planner's To do, for this week, and shows on its week like any other. A question is added in the Planner.
- `?at=28` opens at another week; an item's page links to its week this way.

## Adaptive

- Both sizes get a designed layout. Desktop: the pillars in a sidebar on the left; on the timeline, the windows as a chart and the weeks in three columns; the Planner in two columns. Phone: the tab bar under the thumb, settings behind a gear at the top of each pillar, the timeline's chart the width of the screen, each label over its bar. Item bodies keep a readable line length at every size.
- Tap targets are at least 44px. No hover-only interactions. Safe areas are respected.
- e2e loads every page at both sizes (`phone` and `desktop` projects).

## Theme

Expecting has its own theme, not the design system's Linen. It's built from a reference palette: `#9DC3E2` blue, `#9DD2D8` aqua, `#FADCE4` blush, `#FFB5CC` pink, `#E2B9DB` lilac.

- **Palette** (`src/styles/theme/palette.css`): a 50–950 scale per family, generated by `bun run palette` from `scripts/palette.ts`. The reference colours sit exactly on the step their lightness puts them; the rest of each scale is built around them in OKLCH. The families are sky, lagoon, blossom (pink), lilac, mist (the neutral), sea (success), peach (warning) and cherry (danger). Steps 600 and darker carry text, and a test holds them to AA contrast on white; the pastels themselves can't. In the dark it's the other way round: 300 and lighter carry text on a dark surface (`mist-900`), and 400 and lighter take dark text (`mist-950`), held by the same test.
- **The sheet** (`docs/palette.html`): every family and the three themes, drawn from the CSS the app ships, to open in a browser. `bun run palette` writes it after the palette (`scripts/palette-sheet.ts`).
- **Three themes**, chosen by one question in Settings (boy, girl, or don't know / keeping it a surprise):
  - **Baby Blue** (`baby-blue.css`): a boy. Blue brand, sky-to-aqua accent.
  - **Baby Pink** (`baby-pink.css`): a girl. Pink brand, pink-to-lilac accent.
  - **Baby Purple** (`baby-purple.css`): don't know or surprise, and the default. Lilac brand, blue-to-pink accent.
- Each theme sets every semantic token the design system reads, in light mode and again in dark. Each also sets Expecting's own `--expecting-accent-*` pair, for the gradients in progress bars (onboarding, an item's window of weeks). The page is white with at most a temperature (`--expecting-page`): a cool white in Baby Blue, a warm white in Baby Pink, plain white in Baby Purple. By night it's a near-black with the same temperature, surfaces rise from it in mist, fills are the pastels themselves (400) with dark text, and coloured text is the 300s, so nothing glows. Colour comes in accents (the brand, the progress bars, the timeline's windows), never as a fill. Never as a border on one side of a box, either: a card is outlined all round or not at all. Neutral, success, warning, danger, the corner scale and the type stacks are shared.
- `data-expecting-theme` on `<html>` picks the theme (`src/lib/theme.ts`). The answer is a setting (`baby`, in `settingsQuery`). The browser remembers the last theme in `localStorage`, and an inline script in `<head>` applies it before paint, so a reload doesn't flash Baby Purple.
- **Light or dark is the phone's, not the household's.** `data-theme` on `<html>` picks the mode, kept per phone by the design system (`bootstrapTheme()` and `useTheme()` from `@sixthshift/design-system/hooks`, in `localStorage` under `theme`): Light, Dark or System (the default: match the phone), switched under Appearance in Settings. The same boot script paints it before the first frame, reading the design system's key so the two never disagree. `Root` (`src/app/pages/Root.tsx`, the root route's component, so login and onboarding too) starts the design system's mode and points `<meta name="theme-color">` at the page as drawn. Each theme's dark block answers to `[data-theme="dark"]` paired with its `data-expecting-theme`, and to a preview inside a dark page. Expecting's own hook is `useBabyTheme` (`src/app/hooks/useBabyTheme.ts`), so "theme" means one thing in each file.
- The three are separate files on purpose, so each can be judged on its own. If they turn out to differ only in brand, they can merge into one theme with named brands, which the design system supports through `data-brand`.

## PWA

Both need HTTPS, except on `localhost`: how expecting gets it is still open ([Access](#access-one-shared-password)).

- **Installable.** `public/manifest.webmanifest` (standalone, white like the page), the icons rendered from `public/favicon.svg` (192 and 512, and a maskable 512 with the Baby inside the safe zone), and the Apple metas in `src/routes/root.tsx`. All public files, served ahead of the gate, so the login page has them.
- **Service worker.** Hand-written, no Workbox: `src/pwa/worker.js`. `src/pwa/vite.ts` emits it as `/sw.js` from the client build, with the build's files written in above it (`VERSION`, `CORE`, `PAGES`), so a build that changes a file is a new worker, which takes over at once and drops the old caches. `Root` registers it (`src/pwa/register.ts`), in a build only; dev unregisters any a build left behind, since both are on 9966.
- **Offline reads.** Built: every page answers with the same shell, so the worker keeps one; it fetches the app's files as it installs, and the items' pages (a chunk each, some 900) just after, so every item reads offline, opened before or not. Each server function's last answer is kept as it's fetched (`expecting-data`). Pages and data go to the network first and fall back to what's kept, after four seconds if the network is slow (hospital Wi-Fi), and the slow answer still refreshes the cache; the build's files come from the cache first. The queries are `networkMode: "offlineFirst"`, so they ask with the phone offline and the worker answers. A 401 forgets the kept data, as does logging out (`forgetData`); a new build forgets it too, since its shape may have changed. The e2e spec `e2e/offline.spec.ts` takes the phone offline.
- **Offline writes.** *Not built.* A save with no connection fails at once and says so (`useAction`'s toast): mutations are `networkMode: "always"`, since the default would hold the save, its spinner turning, until the phone is back online. The intent: ticking a task or adding a note while offline is queued and sent on reconnect, using garnish's outbox pattern; the open question is the reads, which would show the kept answer, from before the queued change, until it's sent. Photo uploads need a connection.

## Onboarding

- `/onboarding` asks the first-run questions, one to a screen and each at its own URL (`/onboarding/due`, `/onboarding/q/cover`; routes in `src/routes/onboarding/`, screens in `src/features/onboarding/components/steps/`), so the phone's back gesture goes back a question. The frame sends anyone there who still has a step: a new household gets all of them, a new phone only "who's this?".
- After an answer, `/onboarding?after=due` goes on to the next step still to ask, worked out afresh (`stepAfter`), since what's left can change: the other phone may have finished onboarding meanwhile. A URL for a step that isn't asked goes to the one that is.
- Which steps a device sees is a pure function of what is known (`src/lib/onboarding.ts`): who, then the due date and the baby's colours, then every `asked: onboarding` question in `src/features/settings/model/facts.data.ts` (once for each of you where it is about each, and only where its `when` fits the answers so far), then where Expecting will open.
- Each answer is saved as it's given, so a reload resumes. A household with a due date from before onboarding existed counts as onboarded.
- With the due date skipped, This week asks for it, and every week is still readable on the timeline.

## Tailoring

- `src/features/settings/model/facts.data.ts` holds the questions; `src/features/settings/model/facts.ts` reads them and has the rules (`applies`, `checkWhen`), and `src/lib/facts.ts` what the answers become (`factsOf`, `questionsDue`, `timeTask`), both tested apart from the screen. Settings shows every question, built from the file: in its `group` (the sections, `GROUPS`), each a row with its answer, who gave it and when This week asks again (`nextAsked`), opening to change it and to list what it decides (`decides`: the items its `when`, `$id` or a deadline reads). `/settings?ask=<key>` opens at a question, as a hidden item's page links to the answer that hid it.
- An item's `when:` hides it on a definite answer; `{% if equals($cover, "yes") %}` tailors a passage. An unanswered question hides nothing, and neither does `unsure`, so nothing is written against it (`checkWhen` refuses it) and the `{% else %}` branch is the general wording.

### Facts

The answers are what Expecting knows about the household, asked as the pregnancy unfolds, not a profile filled in once.

- **Questions are code, not content:** they drive behaviour (onboarding, settings, what an item shows), so they are a typed list in `src/features/settings/model/facts.data.ts`, checked as it loads by `facts.ts` beside it, co-located with settings, the feature that owns them, not a file in `content/`. Their ids are types (`QuestionId`, and `ExtraId` for the extras), so code naming one is checked by `tsc`; content names them as strings, checked by the tests. A new one is still not a migration. Each has:
  - `type`: `choice` (its `answers`) or `date`. *Not built: `text`, until a question needs it.*
  - `about`: `household`, or `each`, asked once for each of you and worded with your name (`Does {name} work?`; "the partner" before they've joined). A fact's key is the id, or the id and whose: `cover`, `work.partner`; content writes the same, `when: { work.partner: [employee] }`, `$work.partner`.
  - `when:`, the rule items use, so a question waits on another answer: a previous caesarean is asked only when this isn't the first baby. In a question about each of you, a bare `work` is the same person's.
  - `asked: onboarding`, to be asked up front, and `week`, when This week asks it.
- **Answers are rows,** in the `answer` table (`src/db/models/facts/`): the question, whose it is (`household`, `carrying` or `partner`), the value, who answered and when. A new answer is a new row and the latest counts, so a fact keeps its history. A skip ("Not now", or Skip for now in onboarding) or a clear is a row with no value.
- **The history decides when to ask again** (`questionsDue`). A question comes up on This week (`src/features/settings/components/facts/AskNow.tsx`, three at a time) once its `week` has come, while it is unknown or `unsure`. Answered or skipped before its week, it comes back at its week; since then, only four weeks after (`ASK_AGAIN_AFTER`), so "not sure" isn't asked every week.
- **Who answered** puts who's who to use: settings says "Jason answered, 3 Oct".
- **A task can be timed from a fact** (`timeTask`): `deadline: { before: leaveStart, weeks: 10, week: 30 }` is notice to the employer 10 weeks before leave begins, whose leave by the task's `who` (the earlier of the two for one you do together), and best by moves up to meet it. Until the date is known, `week` stands in. This is what makes the plan a schedule.
- **Facts are not records.** A fact changes what Expecting tells you to do; a record is something you look up. The birth suite's number is a contact, and a planned caesarean's date is an appointment, even where a fact (`birth: caesarean`) points at it. Without this line, the facts grow into the whole store.
- The code's word is **facts**. The screens say "About you", "Expecting needs to know", or ask the question itself.

## Extras

- The optional parts of Expecting, `src/features/settings/model/extras.data.ts`: off until one of you turns one on, unlike a question, which hides nothing until answered. Read by `src/features/settings/model/extras.ts`; what the choices mean is `src/lib/extras.ts` (`extrasOn`, `inExtras`, `extraToOffer`).
- An item with `extra: <id>` is shown only while that extra is on, so `useItems` drops it, and `useTasks` its tasks, from every pillar. Its own page says which extra it's part of and links to the switch (`/settings?ask=extra:<id>`).
- An extra can be only for some households (`when`, as an item's), is offered in onboarding only with `onboarding: true`, and sits in a group in settings (`EXTRA_GROUPS`). An extra can bring a feature as well as items: Choosing a name brings the names game in the Drawer (`baby_name` and `name_vote`; `src/api/rpc/names.ts` answers only as the person holding the phone, with their own votes and the matches, never the other's votes).
- The household's choices are the `extra` table, a row per extra once decided (on or off, who, when); no row is undecided. Onboarding's extras step decides them all, or none if skipped; This week offers the first undecided one whose `offer` week has come, once.

## Content

- Built-in items live in the repo as `content/items/<id>.md`, one Markdoc file per item, with frontmatter for weeks, category, `when`, source, last checked and linked tasks. The questions it is tailored by (`src/features/settings/model/facts.data.ts`) and the extras (`src/features/settings/model/extras.data.ts`) are not in `content/`: they shape what the app does, so they sit with settings, in `src/features/settings/`.
- **The file's name is its id:** a file outside `items/` or named for another id fails the gate.
- Bodies are Markdoc: Markdown plus declared tags (`src/content/markdoc.ts`), each drawn by a component in `src/features/library/components/content/`. `{% ask %}` is a suggested question, added to your list in one tap; `{% window %}` draws an item's weeks against today. Every tag, attribute, `$question` and answer is checked as the content loads.
- **This week** is its own shape, `content/weeks/<week>.md`, named for the week (`28`): a title, the baby's size (length head to bottom in cm, weight in g, and something that size), and three parts, each a `##` heading in this order: The baby, Your body, For the partner (`src/content/weeks.ts`). Each part is Markdoc like an item's body. The note is on This week (and on a peek at its week), and its title is its week's line on the timeline.
- They are validated with zod when the content module loads, and `bun run test` loads it, so a malformed item fails the gate, not the page.
- Each item's weeks are a range within 1–42, the same `Week` that `src/lib/timeline.ts` derives the current week as.
- **A linked task has a window and an owner:** `opens` (defaults to the item's first week), `due` (best by, defaults to its last), an optional hard `deadline` (on or after `due`, by week 42, from the item's source), and `who` (`carrying`, `partner` or `together`, the default). `src/lib/todo.ts` orders the open ones into To do now; `whose()` in `src/lib/people.ts` names the owner for the phone holding it ("Yours", "Sam's").
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
- the settings (`settings`, one row): the due date, the baby's colours, and when onboarding finished
- the answers to the questions, every one kept (see [Facts](#facts))
- the household's people
- sessions

The current week is derived from the due date on read, never stored.

## Backups

`DATA_DIR` holds the database and the uploads, and nothing else. Back up the volume with the host's existing backup. A backup is only trusted once a restore has been tested.

Open: which host — Castle or Tower — and so which backup job covers it.
