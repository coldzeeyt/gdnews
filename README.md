# GDNews — Geometry Dash news hub

A small full-stack app that pulls together:

- **Live** — YouTube live status for a pinned list of GD creators, plus a "live right now" discovery section that surfaces anyone else currently streaming Geometry Dash on YouTube
- **Demonlist** — the current Pointercrate top 10 hardest demons
- **Patch notes** — curated Geometry Dash version history, released and upcoming
- **Daily/Weekly** — the current daily level and weekly demon (via GDBrowser)
- **Updates** — official RobTop announcements from Geometry Dash's Steam news feed
- **Leaks** — a hand-curated, self-maintained list (no public API exists for this)
- **Upcoming** — an extreme-demon watchlist (auto-drops entries once verified) plus event/contest previews from Steam news
- A **live progress tracker** (home page widget + full `/live-stats` page) showing attempt percentages for whichever creator/level is currently being tracked, updated in real time from a passcode-gated `/admin` panel — there's no public API for stream attempt counts, so this is how it gets fed live during a stream

Everything except live status works with **zero configuration** - no API
keys, no accounts to register. Live status is the one opt-in feature, and
even without it the rest of the site works fine.

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

## Configuration (optional — see `.env.example`)

| Feature | Env vars | Where to get them |
|---|---|---|
| Live status | `YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/) — enable "YouTube Data API v3", create an API key |

Everything else (Pointercrate, Steam news, GDBrowser) is a public, keyless
API — nothing to sign up for.

Copy `.env.example` to `.env` for local dev and run with:

```bash
node --env-file=.env server/index.js
```

On Railway, set `YOUTUBE_API_KEY` as a service variable if you want live
status (see below).

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

### Editing leaks

Edit `server/data/leaks.json` — an array of
`{ "id", "title", "url", "summary", "category": "leak", "date", "author" }`
entries. There's no reliable public API for datamines/leaks, so this list is
maintained by hand (a scheduled Claude Code routine keeps it fresh — see
below).

### Live progress tracker (`/admin`)

Go to `/admin`, enter the passcode (`ADMIN_PASSCODE`, defaults to
`08092013`), set the streamer + level you're watching, and log each
attempt's percentage (decimals supported) plus an optional note as it
happens. It shows up on the home page and `/live-stats` within seconds -
both poll every 5-15s. `server/data/progress.json` is only used to seed the
very first run; after that, all state lives in whatever `DATA_DIR` points
at (a Railway volume in production, see below), not in git.

### Editing patch notes

Edit `server/data/patchNotes.json` — each entry has `version`, `status`
(`released` or `upcoming`), `date`, `title`, and a `highlights` array.

## Keeping content fresh without doing it yourself

A weekly Claude Code routine checks for newly-hyped extreme demons and any
patch-note changes, and pushes updates to `server/data/*.json` on its own.
(The live progress tracker isn't part of this — that's fed directly through
`/admin` in real time, not through data files.) Nothing here requires manual
upkeep unless you want to override what it finds.

## Deploying to Railway

This repo deploys as a single Railway service:

1. New project → Deploy from GitHub repo → pick this repo/branch.
2. Build command: `npm run build`. Start command: `npm start`. (Railway's
   Nixpacks builder picks these up automatically from `package.json`.)
3. Optionally add `YOUTUBE_API_KEY` for live status.
4. Add a volume mounted at `/data` and set `DATA_DIR=/data`, so the live
   progress tracker's data survives redeploys. Also set `ADMIN_PASSCODE`
   (or leave it at the default).
5. Generate a domain from the service's Settings → Networking tab.

No database is needed for anything except the live progress tracker, which
just needs that one small volume — everything else is fetched live from
public APIs and cached in memory (demonlist: 30 min, feed: 15 min, live
status: 3h, daily/weekly: 15 min).
