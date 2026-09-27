import { Router } from "express";
import { getLiveProgress } from "../lib/liveProgress.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(getLiveProgress());
});

export default router;
