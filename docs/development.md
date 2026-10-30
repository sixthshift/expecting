# Development

How to work on Expecting from a checkout. Running it is the [README](../README.md).

## Prerequisites

- [Bun](https://bun.sh) 1.4 or newer (`bun --version`). Older Bun cannot run the built server.
- Docker, only to build the image yourself.

SQLite is built into Bun, and all state is files under one directory.

## Develop

```bash
bun install
bun run dev
```

The dev server runs on http://localhost:9966, bound to all interfaces so the devcontainer's published port reaches it. 9966 is expecting's port everywhere: dev, `bun run start` and the Docker image. With the machine-wide Traefik proxy running, http://expecting.localhost works too (see `.devcontainer/CLAUDE_CODE_USAGE.md`).

The first start creates `./data/` and migrates `expecting.db`.

The first visit to a new `./data` asks you to choose the password, as the image does. Deleting `./data` starts again. `EXPECTING_LOGIN=off` in `.env` does without the password.

In VS Code, the `dev` task (`Cmd/Ctrl+Shift+B`) runs the same command in a dedicated panel.

## The gate

Run before every commit; CI runs the same four before it builds the image:

```bash
bun run check   # tsc --noEmit
bun run test    # vitest run, under Bun
bun run lint    # Biome
bun run e2e     # Playwright over the production build
```

`bun test` is a different runner and will not work. `bun run e2e` builds the app and serves it on port 9967 over an empty database, so the dev server can stay up. It needs Playwright's Chromium once per machine: `bunx playwright install chromium`. On a bare Debian container, also `bunx playwright install-deps chromium` for its system libraries. `e2e/global-setup.ts` chooses a test-only password on the empty database's first visit (`PASSWORD` in `e2e/playwright.config.ts`), and `e2e/fixtures.ts` logs each page in with it.

Tests live in `test/`, mirroring `src/`. A file named `*.dom.test.tsx` runs under happy-dom with Testing Library; everything else runs in plain `node`. Name a file `.dom.test.tsx` only when it presses something.

## Content

Built-in items are Markdown files in `content/`, one per item, with the frontmatter `src/content/schema.ts` defines. `bun run test` parses all of them, and a bad file fails the gate with its name and the problem. An item's `id` and its tasks' ids are what ticks in the database point at, so never rename one. New items are `draft: true` until reviewed, and `checked:` is set only once the facts have been confirmed against the source.

## Database

Tables are declared with Drizzle in `src/db/models/<domain>/schema.ts`. To change the schema:

```bash
bun run db:generate   # drizzle-kit writes SQL into .drizzle/ (gitignored)
```

Review it, then copy the statements into `src/db/migrations/NNN_name.sql`. The server applies pending migrations on every start; `bun run migrate` applies them without starting it.

## Run from a build

```bash
bun run build
bun run start
```

`DATA_DIR` (default `./data`) says where `expecting.db` lives; `PORT` (default 9966) is the server's port. `GET /api/health` answers `{"ok":true,"version":"…","commit":"…"}`.

## Building the image

GitHub Actions builds and publishes the image on every push to `main` (`.github/workflows/docker.yml`). To run a local build instead:

```bash
docker build -f docker/Dockerfile -t expecting:local .
cd docker && EXPECTING_IMAGE=expecting:local docker compose up -d
```

## Versions and releases

Nobody edits the version by hand. Every push to `main` bumps `package.json` by what the commits since the last tag ask for (Conventional Commits: `feat:` minor, `!` or `BREAKING CHANGE:` major, anything else patch), then commits it back as `chore(release): vX.Y.Z [skip ci]` with a matching tag and GitHub release. `bun run version:next` is the same bump run locally.

The same bump writes the release notes, `content/releases/<version>.md`: the `feat:` commits under New and the `fix:` and `perf:` ones under Fixed, each subject as it was written, so write those subjects for the two of you ("the names game", not "add NamesGame component"). A release with neither gets no file. The build bundles the file, the release commit carries it, and it can be edited by hand afterwards. After an update, each phone shows the notes for every release since the one it last saw, once (`src/app/components/WhatsNew.tsx`). It compares the version the bundle was built with to the one kept in its `localStorage` (`expecting-seen-version`). A phone with none kept starts at the version it is running and shows nothing.
