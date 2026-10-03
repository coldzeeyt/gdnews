import { readStore, writeStore } from "./store.js";

const BESTS_STORE = "discord-best-runs";
const GUILD_CONFIG_STORE = "discord-guild-config";

function loadBests() {
  return readStore(BESTS_STORE, {});
}

function saveBests(bests) {
  writeStore(BESTS_STORE, bests);
}

// Runs from a checkpoint are logged as "12-67%" (the `display` field holds
// that text); runs from 0 are logged as plain "67%" with no `display`.
function isFromZero(attempt) {
  return !attempt.display;
}

async function pingWebhook(label, percentText, previousBest) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const roleId = process.env.DISCORD_PING_ROLE_ID;
  const mention = roleId ? `<@&${roleId}>` : "@here";
  const content =
    previousBest > 0
      ? `${mention} ${label}: **${percentText}%** (was ${previousBest}%)`
      : `${mention} ${label}: **${percentText}%**`;
  const allowed_mentions = roleId ? { parse: [], roles: [roleId] } : { parse: ["everyone"] };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, allowed_mentions }),
  });
  if (!res.ok) {
    throw new Error(`Discord webhook responded ${res.status}: ${await res.text().catch(() => "")}`);
  }
}

// --- Per-guild notification config (any server with the bot can opt in) ---

function loadGuildConfigs() {
  return readStore(GUILD_CONFIG_STORE, {});
}

function saveGuildConfigs(configs) {
  writeStore(GUILD_CONFIG_STORE, configs);
}

export function getGuildConfig(guildId) {
  return loadGuildConfigs()[guildId] || null;
}

// mode: "best" (only new-best pings) or "every" (every logged run).
export function setGuildConfig(guildId, channelId, mode) {
  const configs = loadGuildConfigs();
  configs[guildId] = { channelId, mode };
  saveGuildConfigs(configs);
}

export function clearGuildConfig(guildId) {
  const configs = loadGuildConfigs();
  delete configs[guildId];
  saveGuildConfigs(configs);
}

async function sendChannelMessage(channelId, content) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return;

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    throw new Error(`Discord channel message responded ${res.status}: ${await res.text().catch(() => "")}`);
  }
}

async function notifyGuilds(track, latest, bestHit) {
  const configs = loadGuildConfigs();
  const entries = Object.entries(configs);
  if (entries.length === 0) return;

  const label = `${track.streamer} × ${track.level}`;
  const percentText = latest.display || `${latest.percent}`;
  const everyMessage = `${label} - **${percentText}%**${latest.note ? ` - ${latest.note}` : ""}`;
  const bestMessage = bestHit
    ? `${label} - ${bestHit.label}: **${percentText}%**${bestHit.previousBest > 0 ? ` (was ${bestHit.previousBest}%)` : ""}`
    : null;

  for (const [guildId, config] of entries) {
    const message = config.mode === "every" ? everyMessage : bestMessage;
    if (!message) continue;
    try {
      await sendChannelMessage(config.channelId, message);
    } catch (err) {
      console.error(`Failed to notify guild ${guildId}:`, err.message);
    }
  }
}

function bootstrapBests(attempts) {
  const highest = (list) => list.reduce((max, a) => Math.max(max, a.percent), 0);
  return {
    nonStartpos: highest(attempts.filter(isFromZero)),
    startpos: highest(attempts.filter((a) => !isFromZero(a))),
  };
}

// Call this with a track right after a new attempt has been unshifted onto
// track.attempts (so attempts[0] is the new one). Tracks two separate bests
// - from 0 ("nonStartpos") and from a checkpoint ("startpos", e.g. "50-92")
// - since they're not comparable difficulty-wise. Pings the configured
// webhook and fans the run out to every guild that's opted into
// notifications. Never throws - a notification problem must never break
// attempt logging.
export async function checkNewBest(track) {
  try {
    const latest = track.attempts[0];
    if (!latest) return;

    const bests = loadBests();
    const existing = bests[track.id];
    // Accept both "never seen this track" and the old pre-split shape
    // (a plain number) as needing a fresh bootstrap.
    const hasSavedBest = existing && typeof existing === "object";

    let bestHit = null;

    if (!hasSavedBest) {
      // First time we've seen this track since this feature shipped -
      // baseline both categories from all current attempts (including this
      // one) without pinging, so existing history doesn't trigger a spam ping.
      bests[track.id] = bootstrapBests(track.attempts);
      saveBests(bests);
    } else {
      const category = isFromZero(latest) ? "nonStartpos" : "startpos";
      const previousBest = existing[category];
      if (latest.percent > previousBest) {
        existing[category] = latest.percent;
        saveBests(bests);
        const label = category === "nonStartpos" ? "New best" : "New checkpoint best";
        bestHit = { label, previousBest };
        await pingWebhook(label, latest.display || `${latest.percent}`, previousBest);
      }
    }

    await notifyGuilds(track, latest, bestHit);
  } catch (err) {
    console.error("Discord notification failed:", err.message);
  }
}

// Called when a track's stream number changes - a new stream starts fresh,
// so the next run in either category should ping as a new best even if it's
// lower than an earlier stream's best.
export function resetBestForNewStream(trackId) {
  const bests = loadBests();
  bests[trackId] = { nonStartpos: 0, startpos: 0 };
  saveBests(bests);
}
