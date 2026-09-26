import { Router } from "express";
import { cached } from "../lib/cache.js";
import { searchLevels } from "../lib/gdbrowser.js";

const router = Router();
const TTL_MS = 5 * 60 * 1000;

router.get("/", async (req, res) => {
  const q = (req.query.q ?? "").toString().trim().slice(0, 60);
  if (!q) return res.json({ levels: [] });

  try {
    const levels = await cached(`search:${q.toLowerCase()}`, TTL_MS, () => searchLevels(q));
    res.json({ levels });
  } catch (err) {
    res.status(502).json({ error: "Search failed", detail: err.message });
  }
});

export default router;
