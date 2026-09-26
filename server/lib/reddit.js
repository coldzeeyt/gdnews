import { cached } from "./cache.js";

// Reddit's anonymous `.json` endpoints reject most datacenter/cloud IPs with
// a 403 bot-check page. The officially supported way around that is
// "application only" OAuth: a free script app (reddit.com/prefs/apps) trades
// its client id/secret for a token via the standard client_credentials
// grant, no user login required, and reads public listings through
// oauth.reddit.com like a normal API client instead of scraping HTML.
const USER_AGENT = "web:gdnews:1.0 (by /u/gdnews_app)";
const SUBREDDIT = "geometrydash";
const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const API_BASE = "https://oauth.reddit.com";

export function isRedditConfigured() {
  return Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
}

async function getAppToken() {
  return cached("reddit:token", 50 * 60 * 1000, async () => {
    const basic = Buffer.from(
      `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString("base64");

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) throw new Error(`reddit token responded ${res.status}`);
    const json = await res.json();
    return json.access_token;
  });
}

const CATEGORY_RULES = [
  {
    category: "leak",
    flair: ["leak", "leaks"],
    keywords: [/\bleak(ed|s)?\b/i, /\bunreleased\b/i, /\bdatamine[d]?\b/i],
  },
  {
    category: "update",
    flair: ["news", "official", "update"],
    keywords: [
      /\bupdate\b/i,
      /\bpatch\s?notes?\b/i,
      /\bchangelog\b/i,
      /\b2\.3\b/,
      /\b2\.2\b/,
      /\brobtop\b.*\b(announc|releas|post)/i,
    ],
  },
  {
    category: "upcoming",
    flair: ["showcase", "video"],
    keywords: [
      /\bupcoming\b/i,
      /\bpreview\b/i,
      /\bteaser\b/i,
      /\bshowcase\b/i,
      /\bverification (incoming|soon)\b/i,
      /\bcoming soon\b/i,
      /\bsneak peek\b/i,
    ],
  },
];

function categorize(post) {
  const flair = (post.link_flair_text || "").toLowerCase();
  const title = post.title || "";

  for (const rule of CATEGORY_RULES) {
    if (rule.flair.some((f) => flair.includes(f))) return rule.category;
  }
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((re) => re.test(title))) return rule.category;
  }
  return "community";
}

function normalize(child) {
  const p = child.data;
  return {
    id: p.id,
    title: p.title,
    url: p.url_overridden_by_dest || `https://reddit.com${p.permalink}`,
    permalink: `https://reddit.com${p.permalink}`,
    author: p.author,
    score: p.score,
    numComments: p.num_comments,
    createdUtc: p.created_utc,
    flair: p.link_flair_text || null,
    thumbnail:
      p.thumbnail && p.thumbnail.startsWith("http") ? p.thumbnail : null,
    isVideo: Boolean(p.is_video),
    category: categorize(p),
  };
}

async function fetchListing(sort, limit) {
  const token = await getAppToken();
  const res = await fetch(`${API_BASE}/r/${SUBREDDIT}/${sort}?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`reddit ${sort} responded ${res.status}`);
  }

  const json = await res.json();
  return json.data.children
    .filter((c) => c.kind === "t3" && !c.data.stickied)
    .map(normalize);
}

const EMPTY_FEED = { all: [], news: [], leaks: [], upcoming: [] };

export async function fetchGdFeed() {
  if (!isRedditConfigured()) return EMPTY_FEED;

  const [hot, latest] = await Promise.all([
    fetchListing("hot", 40),
    fetchListing("new", 40),
  ]);

  const byId = new Map();
  for (const post of [...latest, ...hot]) {
    if (!byId.has(post.id)) byId.set(post.id, post);
  }

  const posts = [...byId.values()].sort((a, b) => b.createdUtc - a.createdUtc);

  return {
    all: posts.slice(0, 60),
    news: posts.filter((p) => p.category === "update").slice(0, 15),
    leaks: posts.filter((p) => p.category === "leak").slice(0, 15),
    upcoming: posts.filter((p) => p.category === "upcoming").slice(0, 15),
  };
}
