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

async function pingWebhook(percent, previousBest) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const roleId = process.env.DISCORD_PING_ROLE_ID;
  const mention = roleId ? `<@&${roleId}>` : "@here";
  const content =
    previousBest > 0
      ? `${mention} New best: **${percent}%** (was ${previousBest}%)`
      : `${mention} New best: **${percent}%**`;
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

async function notifyGuilds(track, latest, isNewBest, previousBest) {
  const configs = loadGuildConfigs();
  const entries = Object.entries(configs);
  if (entries.length === 0) return;

  const label = `${track.streamer} × ${track.level}`;
  const percentText = latest.display || `${latest.percent}`;
  const everyMessage = `${label} - **${percentText}%**${latest.note ? ` - ${latest.note}` : ""}`;
  const bestMessage = isNewBest
    ? `${label} - New best: **${percentText}%**${previousBest > 0 ? ` (was ${previousBest}%)` : ""}`
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

// Call this with a track right after a new attempt has been unshifted onto
// track.attempts (so attempts[0] is the new one). Checks whether it's a new
// best run from 0, pings the configured webhook for it, and fans the run out
// to every guild that's opted into notifications. Never throws - a
// notification problem must never break attempt logging.
export async function checkNewBest(track) {
  try {
    const latest = track.attempts[0];
    if (!latest) return;

    const bests = loadBests();
    const hasSavedBest = Object.prototype.hasOwnProperty.call(bests, track.id);
    let isNewBest = false;
    let previousBest = null;

    if (!hasSavedBest) {
      // First time we've seen this track since this feature shipped -
      // baseline from all current attempts (including this one) without
      // pinging, so existing history doesn't trigger a spam ping.
      const baseline = track.attempts
        .filter(isFromZero)
        .reduce((max, a) => Math.max(max, a.percent), 0);
      bests[track.id] = baseline;
      saveBests(bests);
    } else if (isFromZero(latest)) {
      previousBest = bests[track.id];
      if (latest.percent > previousBest) {
        isNewBest = true;
        bests[track.id] = latest.percent;
        saveBests(bests);
        await pingWebhook(latest.percent, previousBest);
      }
    }

    await notifyGuilds(track, latest, isNewBest, previousBest);
  } catch (err) {
    console.error("Discord notification failed:", err.message);
  }
}

// Called when a track's stream number changes - a new stream starts fresh,
// so the next 0%-start run should ping as a new best even if it's lower
// than an earlier stream's best.
export function resetBestForNewStream(trackId) {
  const bests = loadBests();
  bests[trackId] = 0;
  saveBests(bests);
}
