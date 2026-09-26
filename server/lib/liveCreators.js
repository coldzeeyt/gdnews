import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fetchYoutubeStatuses, isYoutubeConfigured } from "./youtube.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREATORS = JSON.parse(
  readFileSync(path.join(__dirname, "../config/creators.json"), "utf-8")
);

export function liveConfigStatus() {
  return { youtube: isYoutubeConfigured() };
}

export async function fetchLiveCreators() {
  const youtubeStatuses = await fetchYoutubeStatuses(CREATORS);

  return CREATORS.map((c) => {
    const youtube = c.youtube ? youtubeStatuses.get(c.youtube) ?? null : null;

    return {
      displayName: c.displayName,
      live: Boolean(youtube?.live),
      youtube: c.youtube ? { handle: c.youtube, ...youtube } : null,
    };
  }).sort((a, b) => Number(b.live) - Number(a.live));
}
