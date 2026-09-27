import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

// In production this points at a Railway volume (DATA_DIR=/data) so writes
// survive redeploys. Locally it just falls back to a folder in the repo.
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

export function readStore(name, fallback) {
  const file = filePath(name);
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
}

export function writeStore(name, value) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(filePath(name), JSON.stringify(value, null, 2));
}
