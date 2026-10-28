# expecting

A personal pregnancy companion (later perhaps newborn and parenting) for one household: a shared checklist, a week-by-week "what to expect", the surprising things people don't know, and a shared store for information. One shared space for both parents, on phone and desktop, Australian. The concept is in `docs/intent.md`. The app is five pillars: the Timeline (weeks, with a ruler to move along them), the Library (everything Expecting knows), the Planner (to do and questions), and the Journal and Toolkit (placeholders), plus built-in content (Markdoc, tailored by the answers in `content/profile.yaml`), onboarding at `/onboarding`, a step to a URL, who's holding each phone, own tasks and the shared password. The rest of the store, PWA install and offline are not.

## Docs

- [`docs/intent.md`](docs/intent.md) — what it is and why: the product, content model, checklist, store
- [`docs/architecture.md`](docs/architecture.md) — the intended shape; what is built and what is not
- [`docs/development.md`](docs/development.md) — dev server, the gate, ports, building the image, releases

Keep the argument in `docs/`; keep operating constraints here.

## Constraints

- **Store:** SQLite via `bun:sqlite` is the only store, at `DATA_DIR/expecting.db`.
- **Queries:** Drizzle ORM (`drizzle-orm/bun-sqlite`) over that same handle. `src/db/models/<domain>/schema.ts` declares a domain's tables, `repo.ts` beside it is its repository. Domains so far: `household`, `people`, `checklist`, `questions`, `auth`. `src/db/migrations/NNN_name.sql`, applied by `src/db/migrations/migrate.ts`, build the database — drizzle-kit only *generates* SQL to review (`bun run db:generate`), it never applies it.
- **Auth:** one shared password, its argon2id hash in `EXPECTING_PASSWORD_HASH` (`bun run password`), and a 400-day session cookie whose token is stored only as a SHA-256. No users, no accounts. `src/server/auth/gate.ts` holds the rule, applied twice in `src/start.ts`: request middleware judges pages and `/api/*` by path (only `/login` and `/api/health` are open), and function middleware judges every server function by the file it is defined in (only `src/api/rpc/session.ts`, which holds `login` and `logout`, is open). Nothing else goes in that file. Without the hash the dev server runs open and a production server refuses to start.
- **Timeline:** `src/lib/timeline.ts` is the spine. A `Slot` is `preconception`, pregnancy week 1–42 (completed weeks of gestation) or postpartum week 1–12 (from the birth date). The current slot is derived from the due and birth dates on read, never stored. URL keys: `preconception` (`before` still accepted), `28`, `pp3`, used as `/pregnancy?at=28`.
- **Content:** built-in items are `content/<phase>/<id>.md` (the folder is the phase, so no `phase:` in the frontmatter; the name is the id), frontmatter validated by `src/content/schema.ts`, bundled into the client by `src/content/index.ts`. A bad file fails `bun run test` (`test/content/`). Ids are stable slugs: ticks point at them, so never rename one. Each week's note is `content/weeks/<week>.md`, named for the week (`28`), with three `##` parts, The baby, Your body and For the partner, checked by `src/content/weeks.ts`. Every item and note stays `draft: true` until we have reviewed it; `checked:` only when its facts were confirmed against its source.
- **Framework:** TanStack Start (React 19). Routing is code, not file names: `src/routes/` holds definitions only — `root.tsx` (the root route), a file per route (`app.tsx`, the pathless frame that hands the phases' apps to `App`; `index.ts` for `/`; `settings.ts`), `onboarding/` (its layout route, `next.ts` for `/onboarding`, then a file per step), `auth/` (`login.ts`, at `/login`: the folder only groups it), a folder per phase (`<phase>/index.tsx`, its layout route and guard, then its own pages), `shared.ts` (the pages every phase has, built per phase), `tree.ts` (the tree's shape, and nothing else) and `search.ts` (search schemas). A new route is a new file, added to `tree.ts`. Everything that answers at `/api` lives in `src/api/`: `rest/` the server routes (`/api/health`), which `tree.ts` adds to the tree on the server only, and `rpc/` the server functions, served under `/api/rpc/` (`serverFns.base` in `vite.config.ts`). Pages live in `src/features/phases/<phase>/` or `src/features/` and read their route with `getRouteApi("/app/library")`; nothing imports from `routes/`. No `createFileRoute`. Vite is its build tool, run via `bun --bun vite`. This overrides the generic Bun guidance below about HTML imports and avoiding Vite. Server functions (in `src/api/rpc/`, the only way the browser reaches `src/server/` and the store) for the app's own data calls; server routes (`src/api/rest/`) only for endpoints outside callers need (health).
- **Rendering:** SPA mode (`spa.enabled`), in production as in dev: every page request gets the shell (`src/server/shellMode.ts` sets `TSS_SHELL`, imported first in `src/server.ts`). Don't give a route `ssr`.
- **Frontend:** React 19 + Tailwind 4 via `@tailwindcss/vite`. Three phases, each its own app in `src/features/phases/<phase>/` (`index.ts`: its `Layout` and its pillars, the navigation; its pages are its routes in `src/routes/<phase>/`; `src/features/phases/` holds the apps and nothing else), picked by `currentPhase` (`src/lib/phase.ts`) from the dates: preconception, pregnancy, postpartum. Only the pregnancy has the timeline. "Phase" is the code's word for these (the type, the folders, `useApp().phase`); never show it on a screen, which names the moment instead (getting ready, expecting, baby's here). The URL carries the phase in the code's words (`/pregnancy/planner`), but the dates decide it: each phase's layout route is a `PhaseGuard`, which sends a URL for any other phase to the same page in the household's phase, or its home (`samePageIn`, `src/lib/phase.ts`). `/` goes to the phase's home. The screens still name the moment. A page that differs by phase lives in its phase's folder; everything else by domain in the rest of `src/features/<domain>/`, which is phase-agnostic: anything only one phase has (the timeline, the pregnancy's Journal) lives in `src/features/phases/<phase>/`, and shared code asks `usePhaseApp()` what the phase's app has, never which phase it is, and links to a shared page through `usePhaseTo()` (`to("/library/$itemId")`); `src/components/` only for generic parts with no domain. Biome's `noRestrictedImports` holds the layers (see `docs/architecture.md`, Code layout). Each thing lives in one pillar; anything with a date also appears on its week in the timeline (`src/features/phases/pregnancy/timeline/`), the thread between them. New features go into a pillar, not a new top-level page. Pillars read the household through `useApp()`. See `docs/architecture.md`. Adaptive: a layout designed for a phone and one designed for desktop (`lg` and up). See `docs/architecture.md`.
- **UI kit:** `@sixthshift/design-system` (Jason's personal system), from the npm registry. Subpath imports only, e.g. `@sixthshift/design-system/button`. Check its exports before writing any UI element. The theme is Expecting's own, not Linen: `src/styles/theme/` (palette generated by `bun run palette`, never edited by hand; three themes, Baby Blue, Baby Pink and Baby Purple, switched by `data-expecting-theme`). Components use semantic tokens only, never palette colours.
- **Locale:** metric, en-AU spelling. UUID ids, zod validation.
- **Tests:** vitest via `bun run test`. Not `bun test`. Two projects in one command: everything runs in `node`, except `*.dom.test.tsx`, which gets happy-dom and Testing Library. `bun run e2e` is Playwright over the production build, specs in `e2e/` importing `e2e/fixtures.ts` (not `@playwright/test`). The gate is `check`, `test`, `lint` and `e2e`.
- **Port:** 9966 everywhere — dev, `bun run start` and the image. e2e serves on 9967.
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

This project uses TanStack Start, not Bun HTML imports. Vite is run through Bun:

```json
{ "dev": "bun --bun vite dev --host", "build": "bun --bun vite build", "start": "bun run .output/server/index.mjs" }
```

`vite.config.ts` plugins: `tanstackStart({ spa: { enabled: true } })`, `nitro({ preset: "bun" })`, `viteReact()`, `tailwindcss()`. Server functions via `createServerFn`, validated with zod. `bun:sqlite` is imported only from server code.

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
