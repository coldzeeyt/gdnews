import { Router } from "express";
import { getAllTracks } from "../lib/liveProgress.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ tracks: getAllTracks() });
});

export default router;
