import { randomBytes } from "node:crypto";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const sessions = new Map(); // token -> expiresAt

function getPasscode() {
  return process.env.ADMIN_PASSCODE || "08092013";
}

export function verifyPasscode(code) {
  return typeof code === "string" && code === getPasscode();
}

export function issueToken() {
  const token = randomBytes(24).toString("hex");
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

function isValid(token) {
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || !isValid(token)) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}
