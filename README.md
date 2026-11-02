# Expecting

A pregnancy companion for two parents, running on your own server. It runs
the admin (what to book, claim and buy, and when), says what to expect week
by week, keeps what happens, and gives you both one place for all of it.
Australian, on phone and desktop.

What's here: This week (where you are and what to do now), the Library
(some 900 entries from Australian sources, tailored by your answers), the
Planner (to do, lists of what to get, appointments and questions for them),
the Journal (notes, movements, feelings, photos, papers, the firsts) and
the Drawer (the names game and other things you do together), with
Emergency info, a page for the night labour starts, and a way to connect
Claude. It installs to the home screen and works with no signal (over
HTTPS). Getting ready before a pregnancy and the months after the birth
come later.

Each of you has an account and your own password (or none, if you turn
logins off), and each phone stays logged in for months. Even so, keep it
off the public internet: a VPN such as Tailscale is the intended way in
from outside home. (Connecting the Claude app is the exception, and needs a
public HTTPS address: [Claude](docs/product/mcp.md).)

## Quick start

You need a machine on your network with [Docker](https://docs.docker.com/get-docker/) and Compose. From `docker/`:

```bash
docker compose up -d
```

Open `http://<that machine>:9966`. The first visit sets it up: which of you you are, your name and your password. Until then, whoever reaches the page first sets it up, so do it straight away. The other of you joins by an invite you make in Settings. If you forget your password, the other can make you a link to choose a new one; if you're alone and forget it, put `EXPECTING_LOGIN=off` in `docker/.env`, restart, choose a new one in Settings, then take the line out and restart again. If someone else got there first, stop the container and delete `docker/data/` to start again (which deletes everything else too).

If it stays on a home network you trust and you'd rather have no password, put `EXPECTING_LOGIN=off` in `docker/.env` and run `docker compose up -d` again. Each phone still says which of you is holding it.

The image is `ghcr.io/sixthshift/expecting:latest`, which GitHub Actions publishes on every push to `main`. Until that has happened once there is nothing to pull; build one locally instead ([development](docs/development.md#building-the-image)).

## Your data

Everything lives in one folder on the host: `docker/data/`, or wherever `EXPECTING_DATA_DIR` points. `docker compose down` leaves it alone.

## More

- [Intent](docs/intent.md) — what it's for, and the principles it keeps.
- [Product](docs/product/README.md) — what each part does, and why.
- [Architecture](docs/architecture.md) — how it's built.
- [Development](docs/development.md) — working on Expecting from a checkout: the dev server, the gate, building the image, releases.
