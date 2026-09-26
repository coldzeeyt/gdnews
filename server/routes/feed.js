import { Router } from "express";
import { cached, cacheMeta } from "../lib/cache.js";
import { fetchSteamNews } from "../lib/steamNews.js";

const router = Router();
const CACHE_KEY = "feed:steam";
const TTL_MS = 15 * 60 * 1000;

router.get("/", async (_req, res) => {
  try {
    const feed = await cached(CACHE_KEY, TTL_MS, fetchSteamNews);
    res.json({ ...feed, fetchedAt: cacheMeta(CACHE_KEY)?.fetchedAt ?? null });
  } catch (err) {
    res.status(502).json({ error: "Failed to load feed", detail: err.message });
  }
});

export default router;
