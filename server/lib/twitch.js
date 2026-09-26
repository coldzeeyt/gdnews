import { cached } from "./cache.js";

const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const HELIX_BASE = "https://api.twitch.tv/helix";

export function isTwitchConfigured() {
  return Boolean(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);
}

async function getAppToken() {
  return cached("twitch:token", 55 * 60 * 1000, async () => {
    const params = new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    });

    const res = await fetch(`${TOKEN_URL}?${params}`, { method: "POST" });
    if (!res.ok) throw new Error(`twitch token responded ${res.status}`);
    const json = await res.json();
    return json.access_token;
  });
}

async function helixGet(pathname, logins) {
  const token = await getAppToken();
  // /streams keys on `user_login`, /users keys on `login`
  const key = pathname === "/streams" ? "user_login" : "login";
  const qs = new URLSearchParams();
  for (const login of logins) qs.append(key, login);

  const res = await fetch(`${HELIX_BASE}${pathname}?${qs}`, {
    headers: {
      "Client-Id": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`twitch ${pathname} responded ${res.status}`);
  const json = await res.json();
  return json.data;
}

/**
 * Returns a Map keyed by lowercased twitch login -> status object.
 * Creators without a `twitch` login, or when app credentials are missing,
 * are simply absent from the map so callers can fall back gracefully.
 */
export async function fetchTwitchStatuses(creators) {
  const logins = creators.map((c) => c.twitch).filter(Boolean);
  if (!isTwitchConfigured() || logins.length === 0) return new Map();

  const [streams, users] = await Promise.all([
    helixGet("/streams", logins),
    cached("twitch:users", 24 * 60 * 60 * 1000, () => helixGet("/users", logins)),
  ]);

  const streamByLogin = new Map(streams.map((s) => [s.user_login.toLowerCase(), s]));
  const userByLogin = new Map(users.map((u) => [u.login.toLowerCase(), u]));

  const result = new Map();
  for (const login of logins) {
    const key = login.toLowerCase();
    const stream = streamByLogin.get(key);
    const user = userByLogin.get(key);

    result.set(key, {
      live: Boolean(stream),
      title: stream?.title ?? null,
      game: stream?.game_name ?? null,
      viewerCount: stream?.viewer_count ?? null,
      startedAt: stream?.started_at ?? null,
      thumbnailUrl: stream
        ? stream.thumbnail_url.replace("{width}", "440").replace("{height}", "248")
        : null,
      avatarUrl: user?.profile_image_url ?? null,
      channelUrl: `https://twitch.tv/${login}`,
    });
  }
  return result;
}
