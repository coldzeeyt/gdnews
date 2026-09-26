const store = new Map();

/**
 * Get a cached value, or compute + cache it if missing/expired.
 * Serves stale data (past its TTL) if the refresh throws, so a flaky
 * upstream (Reddit/Twitch/Pointercrate) never takes a section down.
 */
export async function cached(key, ttlMs, fn) {
  const now = Date.now();
  const entry = store.get(key);

  if (entry && now - entry.fetchedAt < ttlMs) {
    return entry.value;
  }

  try {
    const value = await fn();
    store.set(key, { value, fetchedAt: now });
    return value;
  } catch (err) {
    if (entry) return entry.value;
    throw err;
  }
}

export function cacheMeta(key) {
  const entry = store.get(key);
  return entry ? { fetchedAt: entry.fetchedAt } : null;
}
