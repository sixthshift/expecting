# expecting

A personal pregnancy companion (later perhaps newborn and parenting) for one household: a shared checklist, a week-by-week "what to expect", the surprising things people don't know, and a shared store for information. One shared space for both parents, on phone and desktop, Australian. The concept is in `docs/intent.md`. The app is five pillars: the Timeline (weeks, with a ruler to move along them), the Library (everything Expecting knows), the Planner (to do and questions), and the Journal and Toolkit (placeholders), plus built-in content (Markdoc, tailored by the answers in `content/profile.yaml`), onboarding at `/welcome`, who's holding each phone, own tasks and the shared password. The rest of the store, PWA install and offline are not.

## Docs

- [`docs/intent.md`](docs/intent.md) — what it is and why: the product, content model, checklist, store
- [`docs/architecture.md`](docs/architecture.md) — the intended shape; what is built and what is not
- [`docs/development.md`](docs/development.md) — dev server, the gate, ports, building the image, releases

Keep the argument in `docs/`; keep operating constraints here.

## Constraints

- **Store:** SQLite via `bun:sqlite` is the only store, at `DATA_DIR/expecting.db`.
- **Queries:** Drizzle ORM (`drizzle-orm/bun-sqlite`) over that same handle. `src/db/models/<domain>/schema.ts` declares a domain's tables, `repo.ts` beside it is its repository. Domains so far: `household`, `people`, `checklist`, `questions`, `auth`. `src/db/migrations/NNN_name.sql`, applied by `src/db/migrations/migrate.ts`, build the database — drizzle-kit only *generates* SQL to review (`bun run db:generate`), it never applies it.
- **Auth:** one shared password, its argon2id hash in `EXPECTING_PASSWORD_HASH` (`bun run password`), and a 400-day session cookie whose token is stored only as a SHA-256. No users, no accounts. `src/server/auth/` gates every request in Start's request middleware; only `/login`, `/api/login`, `/api/logout` and `/api/health` are open. Without the hash the dev server runs open and a production server refuses to start. Login and logout are `/api/*` server routes (plain form posts that set the cookie), the one exception to "server functions for the app's own calls".
- **Timeline:** `src/lib/timeline.ts` is the spine. A `Slot` is `before`, pregnancy week 1–42 (completed weeks of gestation) or postpartum week 1–12 (from the birth date). The current slot is derived from the due and birth dates on read, never stored. URL keys: `before`, `28`, `pp3`, used as `/?at=28`.
- **Content:** built-in items are `content/<id>.md`, frontmatter validated by `src/content/schema.ts`, bundled into the client by `src/content/index.ts`. A bad file fails `bun run test` (`test/content/`). Ids are stable slugs: ticks point at them, so never rename one. Every item stays `draft: true` until we have reviewed it; `checked:` only when its facts were confirmed against its source.
- **Framework:** TanStack Start (React 19). Routing is code, not file names: `src/routes/` holds definitions only — `root.tsx` (the root route), `tree.tsx` (every page route, building the tree, and handing the apps in `src/app/` to the shell), `search.ts` (search schemas) and `api/` (the server routes, added on the server only). Pages live in `src/app/<stage>/` or `src/features/` and read their route with `getRouteApi("/app/library")`; nothing imports from `routes/`. No `createFileRoute`. Vite is its build tool, run via `bun --bun vite`. This overrides the generic Bun guidance below about HTML imports and avoiding Vite. Server functions for the app's own data calls; server routes only for `/api/*` endpoints outside callers need (health).
- **Rendering:** SPA mode (`spa.enabled`), in production as in dev: every page request gets the shell (`src/server/shellMode.ts` sets `TSS_SHELL`, imported first in `src/server.ts`). Don't give a route `ssr`.
- **Frontend:** React 19 + Tailwind 4 via `@tailwindcss/vite`. Three stages, each its own app in `src/app/<stage>/` (`index.ts`: its `Shell` and its pillars, each with its page; `src/app/` holds the apps and nothing else), picked by `src/lib/stage.ts` from the dates: preconception, pregnancy, postpartum. Only the pregnancy has the timeline. The URL never carries the stage: a pillar route's component is `stagePage("/journal")`. A page that differs by stage lives in its stage's folder; everything else by domain in `src/features/<domain>/` (its pages and parts, shared by every stage); `src/components/` only for generic parts with no domain. `src/app/` is not file-based routing. Biome's `noRestrictedImports` holds the layers (see `docs/architecture.md`, Code layout). Each thing lives in one pillar; anything with a date also appears on its week in the timeline (`src/features/timeline/`), the thread between them. New features go into a pillar, not a new top-level page. Pillars read the household through `useApp()`. See `docs/architecture.md`. Adaptive: a layout designed for a phone and one designed for desktop (`lg` and up). See `docs/architecture.md`.
- **UI kit:** `@sixthshift/design-system` (Jason's personal system), from the npm registry. Subpath imports only, e.g. `@sixthshift/design-system/button`. Check its exports before writing any UI element. The theme is Expecting's own, not Linen: `src/theme/` (palette generated by `bun run palette`, never edited by hand; three themes, Baby Blue, Baby Pink and Baby Purple, switched by `data-expecting-theme`). Components use semantic tokens only, never palette colours.
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
