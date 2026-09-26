const API_BASE = "https://pointercrate.com/api/v2";
const PAGE_SIZE = 100;

/**
 * Pointercrate's demon list is paginated by internal `id`, not by list
 * `position` - there's no server-side filter/sort for position, so the
 * only way to find the current top 10 is to page through every demon and
 * sort by position ourselves. ~700 demons / 100 per page is ~8 requests,
 * fine for a job that's cached for 30 minutes.
 */
async function fetchAllDemons() {
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

export async function fetchTop10Demons() {
  const demons = await fetchAllDemons();

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

function youtubeThumbFromUrl(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
  );
  return match ? `https://i.ytimg.com/vi/${match[1]}/mqdefault.jpg` : null;
}
