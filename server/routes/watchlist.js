import { Router } from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fetchAllDemonsCached } from "../lib/pointercrate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WATCHLIST = JSON.parse(
  readFileSync(path.join(__dirname, "../data/upcomingDemons.json"), "utf-8")
);

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const placed = await fetchAllDemonsCached();
    const placedNames = new Set(placed.map((d) => d.name.trim().toLowerCase()));

    // Once a watchlist entry shows up on the real list, it's not "upcoming"
    // anymore - drop it automatically instead of relying on someone to edit
    // the JSON file every time a hyped demon gets verified and placed.
    const demons = WATCHLIST.filter(
      (entry) => !placedNames.has(entry.name.trim().toLowerCase())
    );

    res.json({ demons });
  } catch (err) {
    // If pointercrate is unreachable, still show the curated list rather
    // than an empty page - worst case a since-placed demon lingers a bit.
    res.json({ demons: WATCHLIST, warning: "Could not verify against the live demonlist" });
  }
});

export default router;
