import { Router } from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROGRESS = JSON.parse(
  readFileSync(path.join(__dirname, "../data/progress.json"), "utf-8")
);

const router = Router();

router.get("/", (_req, res) => {
  res.json(PROGRESS);
});

export default router;
