# GDWire — Geometry Dash news hub

A small full-stack app that pulls together:

- **Live Now** — Twitch + YouTube live status for a configurable list of GD creators
- **Demonlist** — the current Pointercrate top 10 hardest demons
- **Updates** — new Geometry Dash versions / patch notes
- **Leaks** — unreleased / datamined content
- **Upcoming** — teasers, previews, hype for levels that might top the list soon

Updates/Leaks/Upcoming are sourced from r/geometrydash and auto-categorized by
flair + keyword matching. Each section works independently — if you haven't
set up a given API key yet, that section just says so instead of breaking
the rest of the site.

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
| Live status | `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` | [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps) — register an app, "Application" type, any OAuth redirect URL works since we only use the app-only client-credentials grant |
| Live status | `YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/) — enable "YouTube Data API v3", create an API key |
| News/Leaks/Upcoming | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` | [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) — "create app", type **script** |

Copy `.env.example` to `.env` for local dev and run with:

```bash
node --env-file=.env server/index.js
```

On Railway, set these as service variables instead (see below).

### Editing the creator list

Edit `server/config/creators.json`:

```json
[
  { "displayName": "Doggie", "twitch": "doggie", "youtube": "@doggie" }
]
```

`twitch` is the channel's login name (from the URL). `youtube` is the
channel's `@handle`. Either can be omitted if a creator isn't on that
platform. The usernames shipped in this repo are best-effort guesses —
double check them against the creators' real channels and fix as needed.

YouTube live checks cost 100 quota units per creator per check (default
quota is 10,000/day). With 3 creators and the default 10 minute TTL that's
~4,300 units/day. Adjust `YOUTUBE_LIVE_TTL_MINUTES` if you add more creators
or want tighter polling.

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
status: 2 min).
