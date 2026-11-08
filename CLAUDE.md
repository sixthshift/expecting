# expecting

A pregnancy companion for two parents, Australian, on phone and desktop: one shared space that runs the admin, telling you what to do and when (directive about bookings, claims and purchases; never about her body), with a week-by-week "what to expect", the surprising things nobody tells you, and a place to keep what happens. The first version is the pregnancy alone (weeks 1–42); getting ready before it and the weeks after the birth come later. The concept is `docs/intent.md`; what each part does is `docs/product/`.

- **Five pillars:** Home (`/`; the strip opens the whole pregnancy at `/timeline`, which is not a pillar), the Library, the Planner (up next, `/planner/lists`, `/planner/appointments`, `/planner/questions`, `/planner/weeks`), the Journal (the story; `/journal/collections`; `/journal/book`) and the Drawer (the names game, Who does what, Your people, bingo).
- **Outside them:** the capture "+" on every pillar (`src/app/features/capture/`), Emergency info (`/emergency`), It's time (`/its-time`, from week 36, 32 for twins), Settings, onboarding (`/onboarding`, a step to a URL).
- **Underneath:** built-in content tailored by the answers (`src/app/features/settings/model/facts.data.ts`) and the extras (`extras.data.ts` beside it), two accounts joined by invite, uploads, the PWA (offline reads and writes), and Claude over MCP (`/api/mcp`, OAuth at `/connect`; `src/api/mcp/`).
- **Not built:** our own entries and hiding built-in ones, contacts as a store, other symptoms, and the phases before and after the pregnancy.

## Docs

- [`docs/intent.md`](docs/intent.md) — what it is and why: who it is for, the principles every part keeps, what comes later
- [`docs/architecture.md`](docs/architecture.md) — how it's built, and where the code is
- [`docs/development.md`](docs/development.md) — dev server, the gate, ports, building the image, releases
- [`docs/product/`](docs/product/README.md) — what each part does and why, as it is now; a built plan is folded in here and deleted

Keep the argument in `docs/`; keep operating constraints here.

## Constraints

The rules a change must keep. The why, and how each part fits, is `docs/architecture.md`; each pillar's `README.md` maps its code.

- **Store:** SQLite via `bun:sqlite` is the only store, at `DATA_DIR/expecting.db`; uploads' bytes are files beside it (`DATA_DIR/uploads/<id>/`), each with its `upload` row, typed by their first bytes, never SVG or HTML (architecture, Uploads). Expecting keeps papers and finds them; it never reads them (no values, no "normal").
- **Queries:** Drizzle (`drizzle-orm/bun-sqlite`) over that handle: a domain's tables in `src/db/models/<domain>/schema.ts`, its repository in `repo.ts` beside it, a class extending `Repo` (`src/db/connection/client.ts`).
- **Migrations:** `src/db/migrations/NNN_name.sql`, applied by `migrate.ts` (and by the dev server as soon as the file exists). Never edit one already written: add the next. drizzle-kit only *generates* SQL to review (`bun run db:generate`), never applies it.
- **Auth:** two accounts, one each, joined by invite (architecture, Access). The session cookie is the only way the server knows who you are (`personId()`, which throws without one). `src/server/auth/gate.ts` holds the rule: by path for pages and `/api/*`, by defining file for server functions. Only `src/api/rpc/session.ts` is open, and nothing else goes in it. `EXPECTING_LOGIN=off` stops asking for passwords, not who you are.
- **Timeline:** `src/lib/timeline.ts` is the spine. A `Week` is 1–42 and is its own URL key (`/timeline?at=28`). The current week is derived from the due date on read, never stored.
- **Content:** built-in entries are `content/items/<id>.md`, validated by `src/content/schema.ts`; a bad file fails `bun run test`. Ids are stable: never rename one (ticks and lines point at them). How to write one is `content/README.md`; the bar and calls, `content/REVIEW.md`. A `deadline` or `decide_by` only from the entry's source. Never add a draft marker: an entry ships only once written and reviewed; `checked:` only when its facts were confirmed against its source. `private: true` leaves no trace in the shared space (no tasks, `decide_by`, `when`, extra or `{% ask %}`; never offered unasked); every link to an entry is `ItemLink`, which masks a private one; `src/server/privacy/` refuses any input naming one, and `test/server/private.test.ts` lists every write path. Week notes (`content/weeks/<week>.md`) and day reads (`content/days/<week>/<day>.md`) are checked by `src/content/weeks.ts` and `days.ts`. The questions and the extras drive behaviour, so they are typed lists in `src/app/features/settings/model/` (`facts.data.ts`, `extras.data.ts`), not in `content/`, which is only the writing.
- **Framework:** TanStack Start (React 19), built with Vite run via `bun --bun vite` (this overrides the generic Bun guidance below). Routing is code: each pillar and feature with addresses has a `routes/` folder of definitions only, a file per route and an `index.ts` for its subtree; `src/routes/` keeps only `root.tsx`, `app.tsx`, `notFound.ts` and `tree.ts`. Nothing imports a `routes/` folder but other routes and `tree.ts`; pages read their route with `getRouteApi`. No `createFileRoute`. A search schema lives on the leaf that owns it; a loader on a path-only route only when every child reads it. A page that differs while something has happened is chosen in its route by `worlds(normal, quiet)` or `putAway({…})` (`src/app/features/quiet/`).
- **Server:** the app's own data calls are server functions in `src/api/rpc/<thing>.ts`, each beside its query and `use<Thing>Query` hook (made by `queryHook`), and are the only way the browser reaches `src/server/` and the store. Server routes (`src/api/rest/`) only for outside callers (health, `/api/mcp`, OAuth) and two plain-URL exceptions: an upload's bytes and an appointment's `.ics`.
- **Rendering:** SPA mode, in production as in dev (`src/server/shellMode.ts`). Don't give a route `ssr`.
- **Code layout:** pages and parts live in `src/pillars/<pillar>/` (`features/<feature>/` under it for what has its own store or pages) and, outside the pillars, `src/app/features/<feature>/`. Each has one shape, a folder only where needed: `pages/`, `components/<aspect>/`, `hooks/`, `contexts/` (one page context at most), `model/` (no React), `routes/`, and `mobile/`, `desktop/`, `quiet/` for what only one world draws. `src/components/` only for generic parts with no domain. `lib/` and `content/` may import nothing from `features/` but Settings' `model/`. Biome's `noRestrictedImports` holds the layers. New features go into a pillar, not a new top-level page. No phases in the code (no phase type, no birth date) for now.
- **Data in the app:** the query cache is the only store of data, a query per thing; no data provider and no aggregate. A page context (`contexts/<Page>PageContext.tsx`) holds a page's state and what its parts must agree on, reading queries through their hooks, never keeping a copy.
- **Saves:** every save goes through the outbox (`src/app/model/outbox.ts`): a `Save` beside its server function, listed in `src/app/model/saves.ts`, made with `useSave`; its `apply` must give the same answer run twice. A save that can't wait for a connection is `useAction`; a call that isn't a save, `usePending`.
- **Quiet** (something has happened) is a mirror world: what differs is in `quiet/`, its rules `src/lib/<pillar>/quiet.ts`; only the route chooses, no page or layout checks quiet, and the address is the same.
- **Adaptive:** a mobile and a desktop experience (≥1024px). `useLayout()` chooses where the structure differs (never draw both and hide one); `mobile:`/`desktop:` variants for the same structure sized differently; no `lg:` (a test keeps it out). On a desktop what you look at opens in the side panel (`ItemLink`, `DetailSheet`); something to do and be done with stays a modal.
- **UI kit:** `@sixthshift/design-system` (Jason's), subpath imports only (`@sixthshift/design-system/button`); check its exports before writing any UI element. The theme is `src/styles/theme/`: the palette is generated by `bun run palette`, never edited by hand. Components use semantic tokens only, never palette colours.
- **Locale:** metric, en-AU spelling. UUID ids, zod validation.
- **Tests:** vitest via `bun run test`, never `bun test`; `*.dom.test.tsx` get happy-dom. `bun run e2e` is Playwright over the production build; specs import `e2e/fixtures.ts`, not `@playwright/test`. The gate is `check`, `test`, `lint` and `e2e`.
- **Port:** 9966 everywhere (dev, `bun run start`, the image); e2e serves on 9967.
- **PWA:** the service worker is hand-written (`src/pwa/worker.js`, no Workbox), emitted in a build only; queries are `networkMode: "offlineFirst"`. A save with an upload keeps its parts on the phone first and sends them later (architecture, PWA).
- **Parallel sessions:** a stream of work in a worktree is `.claude/worktrees/<name>` on `feat/<name>`; `bun install` there first, and pass `--port` to the dev server (9966 is strictPort). e2e takes its own port and waits its turn, so run it in the background. `main`'s tree may hold another session's uncommitted work: commit only your own files, and run the gate on a clean tree when it's dirty.
- **Deploy:** one Docker container, SQLite file on a volume.

## Conventions

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Tests use vitest, run as `bun run test`. Never `bun test`. This overrides the generic Bun guidance.
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- HTTP is handled by TanStack Start's server (Nitro, Bun preset). Don't add `express` or a second server.
- `bun:sqlite` for SQLite, with Drizzle as the query builder over it. Don't use `better-sqlite3`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Frontend

TanStack Start, not Bun HTML imports (see Framework above); `vite.config.ts` holds the plugins. Server functions via `createServerFn`, validated with zod. `bun:sqlite` is imported only from server code.

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
