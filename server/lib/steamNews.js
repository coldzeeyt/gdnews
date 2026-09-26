const APP_ID = 322170; // Geometry Dash on Steam
const API_URL = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${APP_ID}&count=30&maxlength=600&format=json`;

// No key needed - this is Valve's public news API, and it's RobTop's own
// posts (Steam Community Announcements), so it's a zero-config, official
// source instead of scraping/authenticating against a third party.
const HYPE_KEYWORDS = [
  /\bcontest\b/i,
  /\bawards?\b/i,
  /\bspotlight\b/i,
  /\bgauntlet\b/i,
  /\bevent\b/i,
  /\bpreview\b/i,
  /\bsuggestions?\b/i,
  /\bvote\b/i,
];

function categorize(title) {
  return HYPE_KEYWORDS.some((re) => re.test(title)) ? "hype" : "update";
}

function normalize(item) {
  return {
    id: item.gid,
    title: item.title,
    url: item.url,
    summary: item.contents?.replace(/\s+/g, " ").trim().slice(0, 280) ?? "",
    author: item.author || "RobTop Games",
    date: item.date,
    category: categorize(item.title),
  };
}

export async function fetchSteamNews() {
  const res = await fetch(API_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Steam news responded ${res.status}`);
  const json = await res.json();
  const items = (json.appnews?.newsitems ?? []).map(normalize);

  return {
    updates: items.filter((i) => i.category === "update"),
    hype: items.filter((i) => i.category === "hype"),
  };
}
