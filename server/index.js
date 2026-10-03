import express from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

import demonlistRouter from "./routes/demonlist.js";
import feedRouter from "./routes/feed.js";
import liveRouter from "./routes/live.js";
import patchNotesRouter from "./routes/patchNotes.js";
import watchlistRouter from "./routes/watchlist.js";
import dailyRouter from "./routes/daily.js";
import leaksRouter from "./routes/leaks.js";
import passwordsRouter from "./routes/passwords.js";
import victorsRouter from "./routes/victors.js";
import searchRouter from "./routes/search.js";
import playersRouter from "./routes/players.js";
import adminRouter from "./routes/admin.js";
import liveProgressRouter from "./routes/liveProgress.js";
import { startDiscordBot } from "./lib/discordBot.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(__dirname, "../client/dist");

const app = express();
app.set("trust proxy", 1);
app.use(compression());
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/demonlist", demonlistRouter);
app.use("/api/feed", feedRouter);
app.use("/api/live", liveRouter);
app.use("/api/patch-notes", patchNotesRouter);
app.use("/api/watchlist", watchlistRouter);
app.use("/api/daily", dailyRouter);
app.use("/api/leaks", leaksRouter);
app.use("/api/passwords", passwordsRouter);
app.use("/api/victors", victorsRouter);
app.use("/api/search", searchRouter);
app.use("/api/players", playersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/live-progress", liveProgressRouter);

app.use(express.static(CLIENT_DIST, { maxAge: "1h", index: false }));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  const indexHtml = path.join(CLIENT_DIST, "index.html");
  if (!existsSync(indexHtml)) {
    return res
      .status(503)
      .send("Client build not found. Run `npm run build` before starting the server.");
  }
  res.sendFile(indexHtml);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`gdnews server listening on :${PORT}`);
});

// Optional - no-ops entirely if DISCORD_BOT_TOKEN isn't set. Runs alongside
// the HTTP server in this same process; failures here are logged, never
// fatal to the web server.
startDiscordBot().catch((err) => {
  console.error("Discord bot failed to start:", err.message);
});
