import { useEffect, useState } from "react";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.json();
}

/** Polls a JSON endpoint, keeping the last good value on screen through errors. */
export function useApi(url, { pollMs } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [refetchNonce, setRefetchNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getJson(url);
        if (!cancelled) setState({ data, error: null, loading: false });
      } catch (error) {
        if (!cancelled) setState((s) => ({ ...s, error, loading: false }));
      }
    }

    load();
    const id = pollMs ? setInterval(load, pollMs) : null;
    return () => {
      cancelled = true;
      if (id) clearInterval(id);
    };
  }, [url, pollMs, refetchNonce]);

  return { ...state, refetch: () => setRefetchNonce((n) => n + 1) };
}

export function timeAgo(unixSeconds) {
  if (!unixSeconds) return "";
  const diffMs = Date.now() - unixSeconds * 1000;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
