# Expecting

A companion for one household through the pregnancy, running on your own network. Getting ready before it and the months after the birth come later. It is meant to hold a shared checklist, a week-by-week guide to what to expect, the surprising things nobody tells you, and one place to keep everything you've both learned.

**Early days.** What's here: onboarding for both of you, this week (where you are and what matters now), the timeline (every week), the Library, the Planner (a checklist that ticks everywhere, your own tasks, questions for appointments), and built-in content tailored by your answers (all still drafts until reviewed). Not yet: the Journal and the Drawer's handy things (they say what's coming), photos, contacts, appointments, or saving changes with no connection. It installs to the home screen and reads offline (over HTTPS).

There are no accounts: one household password (or none, if you turn logins off), and each phone stays logged in for months. Even so, keep it off the public internet. A VPN such as Tailscale is the intended way in from outside home.

## Quick start

You need a machine on your network with [Docker](https://docs.docker.com/get-docker/) and Compose. From `docker/`:

```bash
docker compose up -d
```

Open `http://<that machine>:9966`. The first visit asks you to choose the household password; after that, every phone and computer logs in with it. Until it is chosen, whoever reaches the page first chooses it, so do it straight away. If someone else got there first, or you forget it, stop the container and delete `docker/data/` to start again (which deletes everything else too).

If it stays on a home network you trust and you'd rather have no password, put `EXPECTING_LOGIN=off` in `docker/.env` and run `docker compose up -d` again. Each phone still says who's holding it.

The image is `ghcr.io/sixthshift/expecting:latest`, which GitHub Actions publishes on every push to `main`. Until that has happened once there is nothing to pull; build one locally instead ([development](docs/development.md#building-the-image)).

## Your data

Everything lives in one folder on the host: `docker/data/`, or wherever `EXPECTING_DATA_DIR` points. `docker compose down` leaves it alone.

## More

- [Intent](docs/intent.md) and [architecture](docs/architecture.md) — what it is for and how it will be built.
- [Development](docs/development.md) — working on Expecting from a checkout: the dev server, the gate, building the image, releases.
