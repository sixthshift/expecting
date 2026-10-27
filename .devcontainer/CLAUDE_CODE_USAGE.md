# Using Claude Code and Codex in this DevContainer

Claude Code and Codex run inside the container, following the personal devcontainer standard (see the `devcontainer` skill in dotfiles — the source of truth for versions and conventions). This setup was copied from garnish's, which is the concrete reference for this project.

## Setup

1. **Ensure Docker is running**, Codex is logged in on the host (`~/.codex/auth.json` must exist), and `ssh-agent` has your key (`ssh-add --apple-use-keychain`, or `AddKeysToAgent yes` in `~/.ssh/config`) — git auth inside the container comes from agent forwarding, not mounted keys.
2. **Copy `.devcontainer/.env.example` to `.devcontainer/.env`** if it is missing; compose refuses to start without it.
3. **Open in VS Code** → `Dev Containers: Reopen in Container` (first build takes a few minutes).
4. **Authenticate Claude** once, inside the container:

```bash
claude auth login
```

Claude config persists in `claude-config`. Host Codex auth is imported into the separate `codex-config` volume during container creation; subsequent token refreshes stay container-local. Both volumes survive rebuilds.

## Every start

`.devcontainer/post-start.sh` runs on each container start (~15s): it reinstalls Claude Code, Codex, and the global dev tools to current, then runs `bun install` so a branch switch can't leave `node_modules` stale. Every step tolerates failure — if a download can't reach the network you get a warning on stderr and the version baked into the image, never a container that refuses to start. Edit the script and restart; no rebuild needed. Same for the aliases in `.devcontainer/shell-config.sh` — edit, then open a new shell.

## Using Claude Code

```bash
claude       # interactive
clauded      # claude --dangerously-skip-permissions (alias)
```

## Using Codex

```bash
codex        # interactive
codexd       # codex --yolo (alias)
```

## Isolation model — what's actually true

`clauded` and `codexd` are acceptable here because of what this container can and cannot reach:

- ✅ **No host filesystem** beyond this project's workspace and the explicit read-only Codex credential file.
- ✅ **No SSH keys in the container** — agent forwarding only; keys can be used for git, never read.
- ✅ **No docker socket** — the host Docker daemon is unreachable.
- ⚠️ **Full network egress.** A prompt-injected agent could exfiltrate anything readable inside the container: this project's source, agent credentials, and whatever is in `.devcontainer/.env`. Accepted risk — keep only low-value dev credentials in `.env`. If this project ever holds credentials whose theft would hurt, add the egress firewall (see the skill's optional blocks).
- ⚠️ Both agents run as **root inside the container** — full access within it, by design.

## Project specifics

**No database service.** expecting stores data in SQLite via `bun:sqlite`, in a file inside the workspace — there is no `db` container, no `DATABASE_URL`, and no entry in the skill's host port registry. If the project ever moves to Postgres, re-run the `devcontainer` skill rather than hand-adding a service.

Forwarded ports:

| Container port | Host port | What |
|---|---|---|
| 9966 | 9966 | Expecting dev server (`bun run dev`). With the machine-wide Traefik (`LocalWorkspace/devproxy`) running, also http://expecting.localhost on port 80, via the `traefik.*` labels in `docker-compose.dev.yml` |
| 4983 | 4985 | Drizzle Studio (`bunx drizzle-kit studio`). Nothing listens until you start it |

## Volumes and persistence

- `claude-config` → `/root/.claude` — auth/settings, survives rebuilds
- `codex-config` → `/root/.codex` — imported host auth plus container settings, survives rebuilds
- `expecting-node-modules` → `/workspace/node_modules` — container-private so Linux and macOS native binaries don't collide

No `postgres-data` or `dind-storage` — neither sidecar is in use. The SQLite file lives on the workspace bind mount, so it persists on the host and is **not** covered by a container volume.

## Departures from standard

Each of these follows garnish, which is this project's reference, over the skill:

- **Bun 1.4.2, not the skill's 1.3.9.** The built TanStack Start server needs Bun 1.4 or newer; garnish pins 1.4.2 here and in `docker/Dockerfile`.
- **`clauded` alias kept.** The skill drops it (auto mode needs no bypass since Claude Code v2.1.283); garnish still has it.
- **Drizzle Studio port without the Postgres/drizzle block.** Forwarded as in garnish, on host port 4985 so it doesn't collide with garnish's and tally's 4983. `drizzle-kit` is a project devDependency, not a global install.
- **Port 5173 not forwarded.** garnish forwards it but nothing listens there (Vite runs on the app's own port), and three other projects publish it.

## Troubleshooting

Rebuild from the Command Palette: `Dev Containers: Rebuild Container`.
