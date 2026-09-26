import { Router } from "express";
import { cached, cacheMeta } from "../lib/cache.js";
import { fetchTop10Demons } from "../lib/pointercrate.js";

const router = Router();
const CACHE_KEY = "demonlist:top10";
const TTL_MS = 30 * 60 * 1000; // demonlist rarely changes; 30min is plenty

router.get("/top10", async (_req, res) => {
  try {
    const demons = await cached(CACHE_KEY, TTL_MS, fetchTop10Demons);
    res.json({ demons, fetchedAt: cacheMeta(CACHE_KEY)?.fetchedAt ?? null });
  } catch (err) {
    res.status(502).json({ error: "Failed to load demonlist", detail: err.message });
  }
});

export default router;
