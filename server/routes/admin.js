import { Router } from "express";
import rateLimit from "express-rate-limit";
import { verifyPasscode, issueToken, requireAdmin } from "../lib/adminAuth.js";
import { createTrack, updateTrack, addAttempt, deleteAttempt, deleteTrack } from "../lib/liveProgress.js";

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

router.post("/tracks", requireAdmin, (req, res) => {
  const { streamer, level, streamNumber } = req.body || {};
  if (!streamer || !level) {
    return res.status(400).json({ error: "streamer and level are required" });
  }
  const track = createTrack(
    String(streamer).slice(0, 60),
    String(level).slice(0, 80),
    streamNumber ? String(streamNumber).slice(0, 20) : null
  );
  res.json(track);
});

router.patch("/tracks/:trackId", requireAdmin, (req, res) => {
  const { streamer, level, streamNumber } = req.body || {};
  const track = updateTrack(req.params.trackId, {
    streamer: streamer !== undefined ? String(streamer).slice(0, 60) : undefined,
    level: level !== undefined ? String(level).slice(0, 80) : undefined,
    streamNumber: streamNumber !== undefined ? (streamNumber ? String(streamNumber).slice(0, 20) : null) : undefined,
  });
  if (!track) return res.status(404).json({ error: "Track not found" });
  res.json(track);
});

router.delete("/tracks/:trackId", requireAdmin, (req, res) => {
  deleteTrack(req.params.trackId);
  res.json({ ok: true });
});

router.post("/tracks/:trackId/attempt", requireAdmin, (req, res) => {
  const { percent, note } = req.body || {};
  // "50-92" shorthand: started practicing from a 50% checkpoint, died at
  // 92%. The percent used for sorting/best-attempt is the last number;
  // the full "50-92" text is kept as `display` so it still reads that way.
  const raw = String(percent ?? "").trim();
  const parts = raw.split("-").map((p) => p.trim()).filter(Boolean);
  const value = Number(parts[parts.length - 1]);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return res.status(400).json({ error: "percent must be a number between 0 and 100" });
  }
  const display = parts.length > 1 ? raw : null;
  const track = addAttempt(
    req.params.trackId,
    value,
    note ? String(note).slice(0, 280) : null,
    display
  );
  if (!track) return res.status(404).json({ error: "Track not found" });
  res.json(track);
});

router.delete("/tracks/:trackId/attempt/:attemptId", requireAdmin, (req, res) => {
  const track = deleteAttempt(req.params.trackId, req.params.attemptId);
  if (!track) return res.status(404).json({ error: "Track not found" });
  res.json(track);
});

export default router;
