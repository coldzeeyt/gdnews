import { Router } from "express";
import { cached, cacheMeta } from "../lib/cache.js";
import { fetchDailyAndWeekly } from "../lib/gdbrowser.js";

const router = Router();
const CACHE_KEY = "gdbrowser:daily";
const TTL_MS = 15 * 60 * 1000;

router.get("/", async (_req, res) => {
  try {
    const data = await cached(CACHE_KEY, TTL_MS, fetchDailyAndWeekly);
    res.json({ ...data, fetchedAt: cacheMeta(CACHE_KEY)?.fetchedAt ?? null });
  } catch (err) {
    res.status(502).json({ error: "Failed to load daily/weekly levels", detail: err.message });
  }
});

export default router;
