import { Router } from "express";
import { cached, cacheMeta } from "../lib/cache.js";
import { fetchLiveCreators, liveConfigStatus } from "../lib/liveCreators.js";

const router = Router();
const CACHE_KEY = "live:creators";
const TTL_MS = 2 * 60 * 1000;

router.get("/", async (_req, res) => {
  try {
    const { creators, otherStreams } = await cached(CACHE_KEY, TTL_MS, fetchLiveCreators);
    res.json({
      creators,
      otherStreams,
      configured: liveConfigStatus(),
      fetchedAt: cacheMeta(CACHE_KEY)?.fetchedAt ?? null,
    });
  } catch (err) {
    res.status(502).json({ error: "Failed to load live status", detail: err.message });
  }
});

export default router;
