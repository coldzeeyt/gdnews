import { Router } from "express";
import { cached, cacheMeta } from "../lib/cache.js";
import { fetchGdFeed, isRedditConfigured } from "../lib/reddit.js";

const router = Router();
const CACHE_KEY = "feed:reddit";
const TTL_MS = 10 * 60 * 1000;

router.get("/", async (_req, res) => {
  try {
    const feed = await cached(CACHE_KEY, TTL_MS, fetchGdFeed);
    res.json({
      ...feed,
      configured: isRedditConfigured(),
      fetchedAt: cacheMeta(CACHE_KEY)?.fetchedAt ?? null,
    });
  } catch (err) {
    res.status(502).json({ error: "Failed to load feed", detail: err.message });
  }
});

export default router;
