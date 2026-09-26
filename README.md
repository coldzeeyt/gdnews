# GDNews — Geometry Dash news hub

A small full-stack app that pulls together:

- **Live** — YouTube live status for a configurable list of GD creators
- **Demonlist** — the current Pointercrate top 10 hardest demons
- **Patch notes** — curated Geometry Dash version history, released and upcoming
- **Daily/Weekly** — the current daily level and weekly demon (via GDBrowser)
- **Updates / Leaks / Upcoming** — sourced from r/geometrydash, auto-categorized by flair + keywords
- An **upcoming-demons watchlist** on the Upcoming page — hyped extreme demons not yet on the list, which drop off automatically once they get placed
- A **progress tracker** on the home page for a creator working on a specific level (manually updated - there's no API for stream attempt counts)

Every section works independently — if you haven't set up a given API key
yet, that section just says so instead of breaking the rest of the site.

## Stack

- `server/` — Node/Express API (also serves the built frontend as static files)
- `client/` — Vite + React + Tailwind, multi-page via React Router

## Local development

```bash
npm install
npm run install:client

# terminal 1
npm run dev:server

# terminal 2
npm run dev:client   # opens on :5173, proxies /api to :3000
```

For production-style local testing:

```bash
npm run build   # builds client/dist
npm start       # serves API + built client on :3000
```

## Configuration (all optional — see `.env.example`)

| Feature | Env vars | Where to get them |
|---|---|---|
| Live status | `YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/) — enable "YouTube Data API v3", create an API key |
| Updates/Leaks/Upcoming | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` | [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) — "create app", type **script** |

Demonlist (Pointercrate) and Daily/Weekly (GDBrowser) need no keys — both are
public APIs.

Copy `.env.example` to `.env` for local dev and run with:

```bash
node --env-file=.env server/index.js
```

On Railway, set these as service variables instead (see below).

### Editing the creator list

Edit `server/config/creators.json`:

```json
[
  { "displayName": "Doggie", "youtube": "@doggiedasher" }
]
```

`youtube` is the channel's `@handle`. YouTube live checks cost 100 quota
units per creator per check (default quota is 10,000/day). Adjust
`YOUTUBE_LIVE_TTL_MINUTES` if you add more creators or want tighter polling.

### Editing the upcoming-demons watchlist

Edit `server/data/upcomingDemons.json` — add `{ "name", "note", "link" }`
entries for hyped extreme demons you want tracked. The `/api/watchlist`
route automatically checks each name against the live Pointercrate list and
drops any entry that's already been placed, so you don't have to remember
to remove them once they're verified.

### Editing the progress tracker

Edit `server/data/progress.json` to update the creator/level/attempts shown
on the home page. There's no public API for in-progress verification
attempts, so this is manually maintained.

### Editing patch notes

Edit `server/data/patchNotes.json` — each entry has `version`, `status`
(`released` or `upcoming`), `date`, `title`, and a `highlights` array.

## Deploying to Railway

This repo deploys as a single Railway service:

1. New project → Deploy from GitHub repo → pick this repo/branch.
2. Build command: `npm run build`. Start command: `npm start`. (Railway's
   Nixpacks builder picks these up automatically from `package.json`.)
3. Add the environment variables from the table above (or leave them unset —
   the site still works, just with those sections showing "not configured").
4. Generate a domain from the service's Settings → Networking tab.

No database or extra services are needed — everything is fetched live from
public APIs and cached in memory (demonlist: 30 min, feed: 10 min, live
status: 2 min, daily/weekly: 15 min).
