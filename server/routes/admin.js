import { Router } from "express";
import rateLimit from "express-rate-limit";
import { verifyPasscode, issueToken, requireAdmin } from "../lib/adminAuth.js";
import { startSession, addAttempt, deleteAttempt } from "../lib/liveProgress.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, (req, res) => {
  const { code } = req.body || {};
  if (!verifyPasscode(code)) {
    return res.status(401).json({ error: "Incorrect passcode" });
  }
  res.json({ token: issueToken() });
});

router.get("/me", requireAdmin, (_req, res) => res.json({ ok: true }));

router.post("/session", requireAdmin, (req, res) => {
  const { streamer, level, keepAttempts } = req.body || {};
  if (!streamer || !level) {
    return res.status(400).json({ error: "streamer and level are required" });
  }
  const data = startSession(String(streamer).slice(0, 60), String(level).slice(0, 80), {
    keepAttempts: Boolean(keepAttempts),
  });
  res.json(data);
});

router.post("/attempt", requireAdmin, (req, res) => {
  const { percent, note } = req.body || {};
  const value = Number(percent);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return res.status(400).json({ error: "percent must be a number between 0 and 100" });
  }
  const data = addAttempt(value, note ? String(note).slice(0, 280) : null);
  res.json(data);
});

router.delete("/attempt/:id", requireAdmin, (req, res) => {
  const data = deleteAttempt(req.params.id);
  res.json(data);
});

export default router;
