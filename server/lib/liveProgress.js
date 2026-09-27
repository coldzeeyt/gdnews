import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { readStore, writeStore } from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_NAME = "live-progress";

function seedFromLegacyData() {
  try {
    const legacy = JSON.parse(
      readFileSync(path.join(__dirname, "../data/progress.json"), "utf-8")
    );
    return {
      tracks: [
        {
          id: randomUUID(),
          streamer: legacy.creator,
          level: legacy.level,
          createdAt: legacy.updatedAt || new Date().toISOString(),
          attempts: legacy.attempts.map((a) => ({
            id: randomUUID(),
            percent: a.percent,
            note: a.note,
            createdAt: null,
          })),
        },
      ],
    };
  } catch {
    return { tracks: [] };
  }
}

// Migrates the old single-session shape ({streamer, level, attempts}) that
// earlier deployments may already have on disk into the multi-track shape.
function migrate(data) {
  if (data && Array.isArray(data.tracks)) return data;
  if (data && data.streamer) {
    return {
      tracks: [
        {
          id: randomUUID(),
          streamer: data.streamer,
          level: data.level,
          createdAt: data.startedAt || new Date().toISOString(),
          attempts: data.attempts || [],
        },
      ],
    };
  }
  return { tracks: [] };
}

function load() {
  const raw = readStore(STORE_NAME, null);
  return migrate(raw ?? seedFromLegacyData());
}

function save(data) {
  writeStore(STORE_NAME, data);
  return data;
}

function withBest(track) {
  const best = track.attempts.reduce(
    (max, a) => (max === null || a.percent > max.percent ? a : max),
    null
  );
  return { ...track, best };
}

function lastActivity(track) {
  const latest = track.attempts[0]?.createdAt;
  return latest || track.createdAt;
}

export function getAllTracks() {
  const data = load();
  return data.tracks
    .map(withBest)
    .sort((a, b) => new Date(lastActivity(b)) - new Date(lastActivity(a)));
}

export function getTrack(trackId) {
  const data = load();
  const track = data.tracks.find((t) => t.id === trackId);
  return track ? withBest(track) : null;
}

export function createTrack(streamer, level, streamNumber) {
  const data = load();
  const track = {
    id: randomUUID(),
    streamer,
    level,
    streamNumber: streamNumber || null,
    createdAt: new Date().toISOString(),
    attempts: [],
  };
  data.tracks.unshift(track);
  save(data);
  return track;
}

export function updateTrack(trackId, { streamNumber }) {
  const data = load();
  const track = data.tracks.find((t) => t.id === trackId);
  if (!track) return null;
  track.streamNumber = streamNumber || null;
  save(data);
  return withBest(track);
}

export function addAttempt(trackId, percent, note) {
  const data = load();
  const track = data.tracks.find((t) => t.id === trackId);
  if (!track) return null;
  track.attempts.unshift({
    id: randomUUID(),
    percent,
    note: note || null,
    createdAt: new Date().toISOString(),
  });
  save(data);
  return withBest(track);
}

export function deleteAttempt(trackId, attemptId) {
  const data = load();
  const track = data.tracks.find((t) => t.id === trackId);
  if (!track) return null;
  track.attempts = track.attempts.filter((a) => a.id !== attemptId);
  save(data);
  return withBest(track);
}

export function deleteTrack(trackId) {
  const data = load();
  data.tracks = data.tracks.filter((t) => t.id !== trackId);
  save(data);
}
