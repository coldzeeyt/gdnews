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
      <Numpad value={code} onChange={setCode} mode="pin" maxLength={12} onSubmit={submit} autoFocus />
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

function TrackSwitcher({ tracks, selectedId, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tracks.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`px-3 py-1.5 text-sm border transition-colors ${
            t.id === selectedId
              ? "border-signal-amber text-white bg-signal-amber/10"
              : "border-white/10 text-slate-400 hover:border-white/25"
          }`}
        >
          {t.streamer} × {t.level}
          {t.streamNumber && <span className="opacity-60"> #{t.streamNumber}</span>}{" "}
          <span className="text-xs opacity-60">({t.attempts.length})</span>
        </button>
      ))}
    </div>
  );
}

function Dashboard() {
  const live = useApi("/api/live-progress", { pollMs: 5000 });
  const tracks = live.data?.tracks ?? [];

  const [selectedId, setSelectedId] = useState(null);
  const [newStreamer, setNewStreamer] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const [newStreamNumber, setNewStreamNumber] = useState("");
  const [editStreamer, setEditStreamer] = useState("");
  const [editLevel, setEditLevel] = useState("");
  const [streamNumberEdit, setStreamNumberEdit] = useState("");
  const [percent, setPercent] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!selectedId && tracks.length > 0) setSelectedId(tracks[0].id);
  }, [tracks, selectedId]);

  const selectedTrack = tracks.find((t) => t.id === selectedId) || null;

  useEffect(() => {
    setStreamNumberEdit(selectedTrack?.streamNumber || "");
    setEditStreamer(selectedTrack?.streamer || "");
    setEditLevel(selectedTrack?.level || "");
  }, [selectedTrack?.id, selectedTrack?.streamNumber, selectedTrack?.streamer, selectedTrack?.level]);

  async function createTrack(e) {
    e.preventDefault();
    if (!newStreamer || !newLevel) return;
    setStatus(null);
    const res = await adminFetch("/api/admin/tracks", {
      method: "POST",
      body: JSON.stringify({ streamer: newStreamer, level: newLevel, streamNumber: newStreamNumber }),
    });
    if (res.ok) {
      const track = await res.json();
      setSelectedId(track.id);
      setNewStreamer("");
      setNewLevel("");
      setNewStreamNumber("");
      setStatus(`Started tracking ${track.streamer} × ${track.level}.`);
      live.refetch();
    } else {
      setStatus("Failed to create track.");
    }
  }

  async function saveTrackDetails(e) {
    e.preventDefault();
    if (!selectedTrack) return;
    const res = await adminFetch(`/api/admin/tracks/${selectedTrack.id}`, {
      method: "PATCH",
      body: JSON.stringify({ streamer: editStreamer, level: editLevel, streamNumber: streamNumberEdit }),
    });
    if (res.ok) {
      setStatus("Track details updated.");
      live.refetch();
    }
  }

  async function logAttempt(e) {
    e.preventDefault();
    if (!selectedTrack) return;
    setStatus(null);
    const res = await adminFetch(`/api/admin/tracks/${selectedTrack.id}/attempt`, {
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

  async function removeAttempt(attemptId) {
    if (!selectedTrack) return;
    await adminFetch(`/api/admin/tracks/${selectedTrack.id}/attempt/${attemptId}`, {
      method: "DELETE",
    });
    live.refetch();
  }

  async function removeTrack() {
    if (!selectedTrack) return;
    if (!window.confirm(`Delete ${selectedTrack.streamer} × ${selectedTrack.level} entirely?`)) return;
    await adminFetch(`/api/admin/tracks/${selectedTrack.id}`, { method: "DELETE" });
    setSelectedId(null);
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
        <SectionHeader eyebrow="Being tracked" title="Tracks" />
        {tracks.length > 0 && (
          <div className="mb-4">
            <TrackSwitcher tracks={tracks} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        )}
        <form onSubmit={createTrack} className="card p-4 space-y-3">
          <p className="text-xs text-slate-500">Track a new streamer/level (doesn't replace existing tracks)</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              value={newStreamer}
              onChange={(e) => setNewStreamer(e.target.value)}
              placeholder="Streamer (e.g. Zoink)"
              className="w-full bg-ink-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-signal-amber/60"
            />
            <input
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
              placeholder="Level (e.g. Heliopolis)"
              className="w-full bg-ink-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-signal-amber/60"
            />
            <input
              value={newStreamNumber}
              onChange={(e) => setNewStreamNumber(e.target.value)}
              placeholder="Stream # (optional)"
              inputMode="numeric"
              className="w-full bg-ink-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-signal-amber/60"
            />
          </div>
          <button
            type="submit"
            disabled={!newStreamer || !newLevel}
            className="px-4 py-2 text-sm font-semibold uppercase tracking-wide bg-ink-800 border border-white/10 text-slate-100 hover:border-signal-amber/60 disabled:opacity-40 transition-colors"
          >
            + New track
          </button>
        </form>
      </section>

      {selectedTrack && (
        <>
          <section>
            <SectionHeader
              eyebrow="Log a death"
              title={`${selectedTrack.streamer} × ${selectedTrack.level}`}
              action={
                <button onClick={removeTrack} className="text-xs text-slate-600 hover:text-signal-red">
                  delete track
                </button>
              }
            />
            <form onSubmit={saveTrackDetails} className="flex flex-wrap items-center gap-2 mb-4">
              <input
                value={editStreamer}
                onChange={(e) => setEditStreamer(e.target.value)}
                placeholder="Streamer"
                className="w-32 bg-ink-900 border border-white/10 px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-signal-amber/60"
              />
              <input
                value={editLevel}
                onChange={(e) => setEditLevel(e.target.value)}
                placeholder="Level"
                className="w-32 bg-ink-900 border border-white/10 px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-signal-amber/60"
              />
              <label className="text-xs text-slate-500 shrink-0">Stream #</label>
              <input
                value={streamNumberEdit}
                onChange={(e) => setStreamNumberEdit(e.target.value)}
                placeholder="e.g. 47"
                inputMode="numeric"
                className="w-20 bg-ink-900 border border-white/10 px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-signal-amber/60"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide bg-ink-800 border border-white/10 text-slate-300 hover:border-signal-amber/60 transition-colors"
              >
                Save
              </button>
            </form>
            <form onSubmit={logAttempt} className="card p-5 space-y-4">
              <Numpad value={percent} onChange={setPercent} mode="decimal" maxLength={10} />
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
            <SectionHeader title="Logged attempts" />
            <div className="space-y-2">
              {selectedTrack.attempts.length === 0 && (
                <p className="text-sm text-slate-500">No attempts logged yet.</p>
              )}
              {selectedTrack.attempts.map((a) => (
                <div key={a.id} className="card flex items-center gap-3 p-3">
                  <span className="font-mono font-semibold text-white w-16 shrink-0">{a.display || a.percent}%</span>
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
        </>
      )}
    </div>
  );
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(Boolean(getToken()));

  return unlocked ? <Dashboard /> : <PasscodeGate onUnlocked={() => setUnlocked(true)} />;
}
