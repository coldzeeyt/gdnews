import { cached } from "./cache.js";

const API_BASE = "https://www.googleapis.com/youtube/v3";

// search.list costs 100 quota units per call (a channels.list lookup is only
// 1 unit but can't tell live status). Default project quota is 10,000/day,
// so keep this TTL generous - override with YOUTUBE_LIVE_TTL_MINUTES if you
// have extra quota to spend on tighter polling.
const LIVE_TTL_MS = (Number(process.env.YOUTUBE_LIVE_TTL_MINUTES) || 10) * 60 * 1000;
const CHANNEL_ID_TTL_MS = 48 * 60 * 60 * 1000;

export function isYoutubeConfigured() {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

async function resolveChannelId(handle) {
  return cached(`youtube:handle:${handle}`, CHANNEL_ID_TTL_MS, async () => {
    const qs = new URLSearchParams({
      part: "id",
      forHandle: handle.replace(/^@/, ""),
      key: process.env.YOUTUBE_API_KEY,
    });
    const res = await fetch(`${API_BASE}/channels?${qs}`);
    if (!res.ok) throw new Error(`youtube channels.list responded ${res.status}`);
    const json = await res.json();
    return json.items?.[0]?.id ?? null;
  });
}

async function checkChannelLive(channelId) {
  return cached(`youtube:live:${channelId}`, LIVE_TTL_MS, async () => {
    const qs = new URLSearchParams({
      part: "snippet",
      channelId,
      eventType: "live",
      type: "video",
      maxResults: "1",
      key: process.env.YOUTUBE_API_KEY,
    });
    const res = await fetch(`${API_BASE}/search?${qs}`);
    if (!res.ok) throw new Error(`youtube search.list responded ${res.status}`);
    const json = await res.json();
    const item = json.items?.[0];
    if (!item) return { live: false };

    return {
      live: true,
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnailUrl: item.snippet.thumbnails?.medium?.url ?? null,
      startedAt: item.snippet.publishTime,
    };
  });
}

/**
 * Returns a Map keyed by the creator's `youtube` handle (as configured) ->
 * status object. Creators without a `youtube` handle, or when no API key is
 * set, are absent from the map.
 */
export async function fetchYoutubeStatuses(creators) {
  const handles = creators.map((c) => c.youtube).filter(Boolean);
  if (!isYoutubeConfigured() || handles.length === 0) return new Map();

  const result = new Map();
  await Promise.all(
    handles.map(async (handle) => {
      try {
        const channelId = await resolveChannelId(handle);
        if (!channelId) {
          result.set(handle, { live: false, channelUrl: `https://youtube.com/${handle}` });
          return;
        }
        const status = await checkChannelLive(channelId);
        result.set(handle, {
          ...status,
          channelUrl: `https://youtube.com/${handle}`,
          watchUrl: status.videoId ? `https://youtube.com/watch?v=${status.videoId}` : null,
        });
      } catch {
        result.set(handle, { live: false, channelUrl: `https://youtube.com/${handle}` });
      }
    })
  );
  return result;
}
