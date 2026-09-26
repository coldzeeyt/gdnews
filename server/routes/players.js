import { Router } from "express";
import { cached } from "../lib/cache.js";
import { fetchCurrentPlayers } from "../lib/steamPlayers.js";

const router = Router();
const CACHE_KEY = "steam:players";
const TTL_MS = 5 * 60 * 1000;

router.get("/", async (_req, res) => {
  try {
    const data = await cached(CACHE_KEY, TTL_MS, fetchCurrentPlayers);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Failed to load player count", detail: err.message });
  }
});

export default router;
