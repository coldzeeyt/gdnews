import { useEffect, useState } from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import Numpad from "../components/Numpad.jsx";
import { useApi, timeAgo } from "../lib/api.js";
import { getToken, setToken, clearToken, adminFetch } from "../lib/adminAuth.js";

function PasscodeGate({ onUnlocked }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        setError("Wrong passcode.");
        setCode("");
        return;
      }
      const { token } = await res.json();
      setToken(token);
      onUnlocked();
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xs mx-auto py-16 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">
        Enter passcode
      </p>
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ length: Math.max(code.length, 1) }).map((_, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-full ${i < code.length ? "bg-signal-amber" : "bg-ink-700"}`}
          />
        ))}
      </div>
      <Numpad value={code} onChange={setCode} mode="pin" maxLength={12} />
      {error && <p className="text-signal-red text-sm mt-4">{error}</p>}
      <button
        onClick={submit}
        disabled={!code || loading}
        className="mt-6 w-full max-w-xs px-4 py-2.5 text-sm font-semibold uppercase tracking-wide bg-signal-amber text-ink-950 hover:bg-signal-amber/90 disabled:opacity-40 transition-colors"
      >
        {loading ? "Checking…" : "Unlock"}
      </button>
    </div>
  );
}

function Dashboard() {
  const live = useApi("/api/live-progress", { pollMs: 5000 });
  const creators = useApi("/api/live");
  const watchlist = useApi("/api/watchlist");

  const [streamer, setStreamer] = useState("");
  const [level, setLevel] = useState("");
  const [keepAttempts, setKeepAttempts] = useState(true);
  const [percent, setPercent] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (live.data?.streamer) setStreamer(live.data.streamer);
    if (live.data?.level) setLevel(live.data.level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.data === null]);

  async function saveSession(e) {
    e.preventDefault();
    setStatus(null);
    const res = await adminFetch("/api/admin/session", {
      method: "POST",
      body: JSON.stringify({ streamer, level, keepAttempts }),
    });
    setStatus(res.ok ? "Session updated." : "Failed to update session.");
    live.refetch();
  }

  async function logAttempt(e) {
    e.preventDefault();
    setStatus(null);
    const res = await adminFetch("/api/admin/attempt", {
      method: "POST",
      body: JSON.stringify({ percent, note }),
    });
    if (res.ok) {
      setPercent("");
      setNote("");
      setStatus("Attempt logged.");
      live.refetch();
    } else {
      const body = await res.json().catch(() => ({}));
      setStatus(body.error || "Failed to log attempt.");
    }
  }

  async function removeAttempt(id) {
    await adminFetch(`/api/admin/attempt/${id}`, { method: "DELETE" });
    live.refetch();
  }

  function logout() {
    clearToken();
    window.location.reload();
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h1 className="font-display text-2xl font-semibold text-white uppercase tracking-wide">
          Admin
        </h1>
        <button onClick={logout} className="text-xs text-slate-500 hover:text-signal-red">
          Log out
        </button>
      </div>

      <section>
        <SectionHeader eyebrow="Currently tracking" title="Session" />
        <form onSubmit={saveSession} className="card p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Streamer</label>
              <input
                list="streamer-options"
                value={streamer}
                onChange={(e) => setStreamer(e.target.value)}
                className="w-full bg-ink-900 border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-signal-amber/60"
                placeholder="Doggie"
              />
              <datalist id="streamer-options">
                {creators.data?.creators.map((c) => (
                  <option key={c.displayName} value={c.displayName} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Level</label>
              <input
                list="level-options"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-ink-900 border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-signal-amber/60"
                placeholder="Grief"
              />
              <datalist id="level-options">
                {watchlist.data?.demons.map((d) => (
                  <option key={d.name} value={d.name} />
                ))}
              </datalist>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={keepAttempts}
              onChange={(e) => setKeepAttempts(e.target.checked)}
            />
            Keep existing attempts (uncheck to start a fresh session)
          </label>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold uppercase tracking-wide bg-ink-800 border border-white/10 text-slate-100 hover:border-signal-amber/60 transition-colors"
          >
            Save session
          </button>
        </form>
      </section>

      <section>
        <SectionHeader eyebrow="Log a death" title="New attempt" />
        <form onSubmit={logAttempt} className="card p-5 space-y-4">
          <div className="text-center">
            <span className="font-display text-5xl font-bold text-signal-amber">
              {percent || "0"}
            </span>
            <span className="font-display text-3xl font-bold text-signal-amber">%</span>
          </div>
          <Numpad value={percent} onChange={setPercent} mode="decimal" maxLength={6} />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notes (optional) - e.g. died on final jump, chat went wild…"
            rows={2}
            className="w-full bg-ink-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-signal-amber/60 resize-none"
          />
          <button
            type="submit"
            disabled={!percent}
            className="w-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide bg-signal-amber text-ink-950 hover:bg-signal-amber/90 disabled:opacity-40 transition-colors"
          >
            Log attempt
          </button>
        </form>
        {status && <p className="text-xs text-slate-500 mt-2">{status}</p>}
      </section>

      <section>
        <SectionHeader eyebrow={`${live.data?.streamer ?? ""} × ${live.data?.level ?? ""}`} title="Logged attempts" />
        <div className="space-y-2">
          {live.data?.attempts?.length === 0 && (
            <p className="text-sm text-slate-500">No attempts logged yet.</p>
          )}
          {live.data?.attempts?.map((a) => (
            <div key={a.id} className="card flex items-center gap-3 p-3">
              <span className="font-mono font-semibold text-white w-16 shrink-0">{a.percent}%</span>
              <span className="text-sm text-slate-400 flex-1 truncate">{a.note || "—"}</span>
              <span className="text-xs text-slate-600 shrink-0">
                {a.createdAt ? timeAgo(Math.floor(new Date(a.createdAt).getTime() / 1000)) : ""}
              </span>
              <button
                onClick={() => removeAttempt(a.id)}
                className="text-xs text-slate-600 hover:text-signal-red shrink-0"
              >
                delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(Boolean(getToken()));

  return unlocked ? <Dashboard /> : <PasscodeGate onUnlocked={() => setUnlocked(true)} />;
}
