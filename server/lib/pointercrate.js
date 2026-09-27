import { cached } from "./cache.js";

const API_BASE = "https://pointercrate.com/api/v2";
// Record listing only exists on the older v1 API - v2 dropped it.
const API_BASE_V1 = "https://pointercrate.com/api/v1";
const PAGE_SIZE = 100;
const ALL_DEMONS_TTL_MS = 30 * 60 * 1000;
const VICTORS_TTL_MS = 15 * 60 * 1000;

/**
 * Pointercrate's demon list is paginated by internal `id`, not by list
 * `position` - there's no server-side filter/sort for position, so the
 * only way to find the current top 10 (or check whether a given level has
 * been placed at all) is to page through every demon ourselves. ~700
 * demons / 100 per page is ~8 requests; cached so both the demonlist and
 * the upcoming-demons watchlist can share one fetch.
 */
async function fetchAllDemonsUncached() {
  const all = [];
  let after = 0;

  for (;;) {
    const res = await fetch(
      `${API_BASE}/demons/?limit=${PAGE_SIZE}&after=${after}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "gdnews/1.0 (+https://github.com/coldzeeyt/gdnews)",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`pointercrate responded ${res.status}`);
    }

    const page = await res.json();
    if (page.length === 0) break;

    all.push(...page);
    after = page[page.length - 1].id;
    if (page.length < PAGE_SIZE) break;
  }

  return all;
}

export function fetchAllDemonsCached() {
  return cached("pointercrate:all", ALL_DEMONS_TTL_MS, fetchAllDemonsUncached);
}

export async function fetchTop10Demons() {
  const demons = await fetchAllDemonsCached();

  return demons
    .sort((a, b) => a.position - b.position)
    .slice(0, 10)
    .map((d) => ({
      position: d.position,
      name: d.name,
      publisher: d.publisher?.name ?? "Unknown",
      verifier: d.verifier?.name ?? "Unknown",
      videoUrl: d.video ?? null,
      levelId: d.level_id ?? null,
      thumbnail: d.thumbnail ?? (d.video ? youtubeThumbFromUrl(d.video) : null),
    }));
}

export async function fetchDemonList() {
  const demons = await fetchAllDemonsCached();
  return demons
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((d) => ({
      id: d.id,
      position: d.position,
      name: d.name,
      verifier: d.verifier?.name ?? "Unknown",
      videoUrl: d.video ?? null,
    }));
}

export function fetchVictors(demonId) {
  return cached(`pointercrate:victors:${demonId}`, VICTORS_TTL_MS, async () => {
    const res = await fetch(
      `${API_BASE_V1}/records/?demon_id=${demonId}&status=APPROVED&progress=100&limit=100`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "gdnews/1.0 (+https://github.com/coldzeeyt/gdnews)",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`pointercrate responded ${res.status}`);
    }

    const records = await res.json();
    return records.map((r) => ({
      id: r.id,
      player: r.player?.name ?? "Unknown",
      video: r.video ?? null,
    }));
  });
}

export async function isDemonPlaced(name) {
  const demons = await fetchAllDemonsCached();
  const target = name.trim().toLowerCase();
  return demons.some((d) => d.name.trim().toLowerCase() === target);
}

function youtubeThumbFromUrl(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
  );
  return match ? `https://i.ytimg.com/vi/${match[1]}/mqdefault.jpg` : null;
}
