import { Router } from "express";
import { cached, cacheMeta } from "../lib/cache.js";
import { fetchDemonList, fetchVictors } from "../lib/pointercrate.js";

const router = Router();
const DEMON_LIST_CACHE_KEY = "victors:demonlist";
const DEMON_LIST_TTL_MS = 30 * 60 * 1000;

router.get("/demons", async (_req, res) => {
  try {
    const demons = await cached(DEMON_LIST_CACHE_KEY, DEMON_LIST_TTL_MS, fetchDemonList);
    res.json({ demons, fetchedAt: cacheMeta(DEMON_LIST_CACHE_KEY)?.fetchedAt ?? null });
  } catch (err) {
    res.status(502).json({ error: "Failed to load demon list", detail: err.message });
  }
});

router.get("/:demonId", async (req, res) => {
  const demonId = Number(req.params.demonId);
  if (!Number.isInteger(demonId) || demonId < 1) {
    return res.status(400).json({ error: "Invalid demon id" });
  }
  try {
    const victors = await fetchVictors(demonId);
    res.json({ victors });
  } catch (err) {
    res.status(502).json({ error: "Failed to load victors", detail: err.message });
  }
});

export default router;
