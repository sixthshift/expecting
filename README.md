# Expecting

A companion for one household through trying, pregnancy and the months after the birth, running on your own network. It is meant to hold a shared checklist, a week-by-week guide to what to expect, the surprising things nobody tells you, and one place to keep everything you've both learned.

**Early days.** What's here: onboarding for both of you, the timeline (this week and every other), the Library, the Planner (a checklist that ticks everywhere, your own tasks, questions for appointments), and built-in content tailored by your answers (all still drafts until reviewed). Not yet: the Journal and the Toolkit (they say what's coming), photos, contacts, appointments, installing to the home screen, or offline use.

There are no accounts: one household password, and each phone stays logged in for months. Even so, keep it off the public internet. A VPN such as Tailscale is the intended way in from outside home.

## Quick start

You need a machine on your network with [Docker](https://docs.docker.com/get-docker/) and Compose. Pick the household password and make its hash (from a checkout, with Bun):

```bash
bun run password
```

Put the line it prints for Compose into `docker/.env`. The single quotes matter, because the hash is full of `$`:

```bash
EXPECTING_PASSWORD_HASH='$argon2id$v=19$m=65536,t=2,p=1$...'
```

Then, from `docker/`:

```bash
docker compose up -d
```

The container refuses to start without the hash.

Open `http://<that machine>:9966`.

The image is `ghcr.io/sixthshift/expecting:latest`, which GitHub Actions publishes on every push to `main`. Until that has happened once there is nothing to pull; build one locally instead ([development](docs/development.md#building-the-image)).

## Your data

Everything lives in one folder on the host: `docker/data/`, or wherever `EXPECTING_DATA_DIR` points. `docker compose down` leaves it alone.

## More

- [Intent](docs/intent.md) and [architecture](docs/architecture.md) — what it is for and how it will be built.
- [Development](docs/development.md) — working on Expecting from a checkout: the dev server, the gate, building the image, releases.
