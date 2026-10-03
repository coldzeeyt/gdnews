import { readStore, writeStore } from "./store.js";

const STORE_NAME = "discord-best-runs";

function loadBests() {
  return readStore(STORE_NAME, {});
}

function saveBests(bests) {
  writeStore(STORE_NAME, bests);
}

// Runs from a checkpoint are logged as "12-67%" (the `display` field holds
// that text); runs from 0 are logged as plain "67%" with no `display`.
function isFromZero(attempt) {
  return !attempt.display;
}

async function pingDiscord(percent, previousBest) {
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

// Call this with a track right after a new attempt has been unshifted onto
// track.attempts (so attempts[0] is the new one). Checks whether it's a new
// best run from 0 and, if so, persists it and pings Discord. Never throws -
// a notification problem must never break attempt logging.
export async function checkNewBest(track) {
  try {
    const latest = track.attempts[0];
    if (!latest) return;

    const bests = loadBests();
    const hasSavedBest = Object.prototype.hasOwnProperty.call(bests, track.id);

    if (!hasSavedBest) {
      // First time we've seen this track since this feature shipped -
      // baseline from all current attempts (including this one) without
      // pinging, so existing history doesn't trigger a spam ping.
      const baseline = track.attempts
        .filter(isFromZero)
        .reduce((max, a) => Math.max(max, a.percent), 0);
      bests[track.id] = baseline;
      saveBests(bests);
      return;
    }

    if (!isFromZero(latest)) return; // checkpoint run - ignored

    const previousBest = bests[track.id];
    if (latest.percent > previousBest) {
      bests[track.id] = latest.percent;
      saveBests(bests);
      await pingDiscord(latest.percent, previousBest);
    }
  } catch (err) {
    console.error("Discord best-run notification failed:", err.message);
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
