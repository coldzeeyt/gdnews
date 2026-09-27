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
      streamer: legacy.creator,
      level: legacy.level,
      startedAt: legacy.updatedAt || new Date().toISOString(),
      attempts: legacy.attempts.map((a) => ({
        id: randomUUID(),
        percent: a.percent,
        note: a.note,
        createdAt: null,
      })),
    };
  } catch {
    return { streamer: null, level: null, startedAt: null, attempts: [] };
  }
}

function load() {
  return readStore(STORE_NAME, null) ?? seedFromLegacyData();
}

function save(data) {
  writeStore(STORE_NAME, data);
  return data;
}

export function getLiveProgress() {
  const data = load();
  const best = data.attempts.reduce(
    (max, a) => (max === null || a.percent > max.percent ? a : max),
    null
  );
  return { ...data, best };
}

export function startSession(streamer, level, { keepAttempts = false } = {}) {
  const data = load();
  return save({
    streamer,
    level,
    startedAt: new Date().toISOString(),
    attempts: keepAttempts ? data.attempts : [],
  });
}

export function addAttempt(percent, note) {
  const data = load();
  data.attempts.unshift({
    id: randomUUID(),
    percent,
    note: note || null,
    createdAt: new Date().toISOString(),
  });
  return save(data);
}

export function deleteAttempt(id) {
  const data = load();
  data.attempts = data.attempts.filter((a) => a.id !== id);
  return save(data);
}
