import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fetchYoutubeStatuses, fetchDiscoveredLiveStreams, isYoutubeConfigured } from "./youtube.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREATORS = JSON.parse(
  readFileSync(path.join(__dirname, "../config/creators.json"), "utf-8")
);

export function liveConfigStatus() {
  return { youtube: isYoutubeConfigured() };
}

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function fetchLiveCreators() {
  const [youtubeStatuses, discovered] = await Promise.all([
    fetchYoutubeStatuses(CREATORS),
    fetchDiscoveredLiveStreams().catch(() => []),
  ]);

  const creators = CREATORS.map((c) => {
    const youtube = c.youtube ? youtubeStatuses.get(c.youtube) ?? null : null;

    return {
      displayName: c.displayName,
      live: Boolean(youtube?.live),
      youtube: c.youtube ? { handle: c.youtube, ...youtube } : null,
    };
  }).sort((a, b) => Number(b.live) - Number(a.live));

  const pinnedNames = new Set(creators.map((c) => normalizeName(c.displayName)));
  const pinnedChannelIds = new Set(
    creators.map((c) => c.youtube?.channelId).filter(Boolean)
  );

  // Anyone already pinned above shouldn't also show up in "everyone else" -
  // whether they end up live via their own channel check or turn up in the
  // broad discovery search.
  const otherStreams = discovered.filter(
    (s) =>
      !pinnedChannelIds.has(s.channelId) && !pinnedNames.has(normalizeName(s.channelTitle))
  );

  return { creators, otherStreams };
}
