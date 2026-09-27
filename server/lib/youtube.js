import { cached } from "./cache.js";

const API_BASE = "https://www.googleapis.com/youtube/v3";

// search.list costs 100 quota units per call (a channels.list lookup is only
// 1 unit but can't tell live status). Default project quota is 10,000/day.
// With 8 pinned creators (800 units) plus one discovery search (100 units +
// 1 unit for viewer-count enrichment) that's 901 units per refresh, so the
// default 180min TTL keeps daily usage around 7,200 - override with
// YOUTUBE_LIVE_TTL_MINUTES (lower it if you have extra quota, raise it if
// you add more creators).
const LIVE_TTL_MS = (Number(process.env.YOUTUBE_LIVE_TTL_MINUTES) || 180) * 60 * 1000;
const CHANNEL_TTL_MS = 48 * 60 * 60 * 1000;

export function isYoutubeConfigured() {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

async function resolveChannel(handle) {
  return cached(`youtube:channel:${handle}`, CHANNEL_TTL_MS, async () => {
    const qs = new URLSearchParams({
      part: "snippet",
      forHandle: handle.replace(/^@/, ""),
      key: process.env.YOUTUBE_API_KEY,
    });
    const res = await fetch(`${API_BASE}/channels?${qs}`);
    if (!res.ok) throw new Error(`youtube channels.list responded ${res.status}`);
    const json = await res.json();
    const item = json.items?.[0];
    if (!item) return null;

    return {
      channelId: item.id,
      title: item.snippet.title,
      avatarUrl: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? null,
    };
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
      const channelUrl = `https://youtube.com/${handle}`;
      try {
        const channel = await resolveChannel(handle);
        if (!channel) {
          result.set(handle, { live: false, channelUrl });
          return;
        }
        const status = await checkChannelLive(channel.channelId);
        result.set(handle, {
          ...status,
          channelId: channel.channelId,
          avatarUrl: channel.avatarUrl,
          channelUrl,
          watchUrl: status.videoId ? `https://youtube.com/watch?v=${status.videoId}` : null,
        });
      } catch {
        result.set(handle, { live: false, channelUrl });
      }
    })
  );
  return result;
}

/**
 * Any live YouTube broadcast that turns up for a "geometry dash" search -
 * not just the pinned roster. This is inherently a live snapshot: a
 * streamer who has ended their broadcast simply won't be in the next
 * search.list result, no cleanup needed.
 */
export async function fetchDiscoveredLiveStreams() {
  if (!isYoutubeConfigured()) return [];
  return cached("youtube:discovered-live", LIVE_TTL_MS, fetchDiscoveredLiveStreamsUncached);
}

// Covers scripts common on non-English GD streams (Cyrillic, CJK, Thai,
// Arabic, Hebrew) - used as a fallback when YouTube gives no language
// metadata for the stream, which is the common case for live broadcasts.
const NON_LATIN_SCRIPT = /[Ѐ-ӿ一-鿿぀-ヿ가-힣฀-๿؀-ۿ֐-׿]/;

function isEnglish(video, snippetTitle) {
  const lang = video.snippet.defaultAudioLanguage || video.snippet.defaultLanguage;
  if (lang) return lang.toLowerCase().startsWith("en");
  return !NON_LATIN_SCRIPT.test(snippetTitle) && !NON_LATIN_SCRIPT.test(video.snippet.channelTitle);
}

async function fetchDiscoveredLiveStreamsUncached() {
  const searchQs = new URLSearchParams({
    part: "snippet",
    eventType: "live",
    type: "video",
    q: "geometry dash",
    order: "viewCount",
    relevanceLanguage: "en",
    maxResults: "25",
    key: process.env.YOUTUBE_API_KEY,
  });
  const searchRes = await fetch(`${API_BASE}/search?${searchQs}`);
  if (!searchRes.ok) throw new Error(`youtube search.list responded ${searchRes.status}`);
  const searchJson = await searchRes.json();
  const items = searchJson.items ?? [];
  if (items.length === 0) return [];

  const videoIds = items.map((i) => i.id.videoId).join(",");
  const videosQs = new URLSearchParams({
    part: "snippet,liveStreamingDetails",
    id: videoIds,
    key: process.env.YOUTUBE_API_KEY,
  });
  const videosRes = await fetch(`${API_BASE}/videos?${videosQs}`);
  if (!videosRes.ok) throw new Error(`youtube videos.list responded ${videosRes.status}`);
  const videosJson = await videosRes.json();

  return (videosJson.items ?? [])
    .filter((v) => v.liveStreamingDetails?.concurrentViewers != null)
    .filter((v) => isEnglish(v, v.snippet.title))
    .map((v) => ({
      channelTitle: v.snippet.channelTitle,
      channelId: v.snippet.channelId,
      title: v.snippet.title,
      videoId: v.id,
      watchUrl: `https://youtube.com/watch?v=${v.id}`,
      thumbnailUrl: v.snippet.thumbnails?.medium?.url ?? null,
      viewerCount: Number(v.liveStreamingDetails.concurrentViewers),
      startedAt: v.liveStreamingDetails.actualStartTime ?? null,
    }))
    .sort((a, b) => b.viewerCount - a.viewerCount);
}
