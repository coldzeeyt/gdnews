import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fetchTwitchStatuses, isTwitchConfigured } from "./twitch.js";
import { fetchYoutubeStatuses, isYoutubeConfigured } from "./youtube.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREATORS = JSON.parse(
  readFileSync(path.join(__dirname, "../config/creators.json"), "utf-8")
);

export function liveConfigStatus() {
  return { twitch: isTwitchConfigured(), youtube: isYoutubeConfigured() };
}

export async function fetchLiveCreators() {
  const [twitchStatuses, youtubeStatuses] = await Promise.all([
    fetchTwitchStatuses(CREATORS),
    fetchYoutubeStatuses(CREATORS),
  ]);

  return CREATORS.map((c) => {
    const twitch = c.twitch ? twitchStatuses.get(c.twitch.toLowerCase()) ?? null : null;
    const youtube = c.youtube ? youtubeStatuses.get(c.youtube) ?? null : null;

    return {
      displayName: c.displayName,
      live: Boolean(twitch?.live || youtube?.live),
      twitch: c.twitch ? { handle: c.twitch, ...twitch } : null,
      youtube: c.youtube ? { handle: c.youtube, ...youtube } : null,
    };
  }).sort((a, b) => Number(b.live) - Number(a.live));
}
