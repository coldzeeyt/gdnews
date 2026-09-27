import { useState } from "react";
import { timeAgo } from "../lib/api.js";

export default function TrackCard({ track }) {
  const [showHistory, setShowHistory] = useState(false);
  const latest = track.attempts[0];
  const past = track.attempts.slice(1);

  return (
    <div className="card p-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1">
        {track.streamer} × {track.level}
        {track.streamNumber && ` · Stream #${track.streamNumber}`}
      </p>

      <div className="my-3">
        <span className="font-display text-6xl sm:text-7xl font-bold text-signal-amber">
          {latest ? latest.percent : 0}
        </span>
        <span className="font-display text-3xl sm:text-4xl font-bold text-signal-amber">%</span>
      </div>

      {latest?.note && <p className="text-sm text-slate-400 mb-1">{latest.note}</p>}
      {latest?.createdAt && (
        <p className="text-xs text-slate-600">
          {timeAgo(Math.floor(new Date(latest.createdAt).getTime() / 1000))}
        </p>
      )}

      {!latest && <p className="text-sm text-slate-500 mt-2">No attempts logged yet.</p>}

      {past.length > 0 && (
        <button
          onClick={() => setShowHistory((s) => !s)}
          className="text-xs font-semibold uppercase tracking-wide text-signal-amber hover:text-white mt-4"
        >
          {showHistory ? "Hide past attempts" : `Past attempts (${past.length})`}
        </button>
      )}

      {showHistory && (
        <div className="mt-4 space-y-2 text-left border-t border-white/5 pt-4">
          {past.map((a) => (
            <div key={a.id} className="flex items-center gap-4">
              <span className="font-mono font-bold text-white text-base w-16 shrink-0">{a.percent}%</span>
              <span className="text-sm text-slate-400 flex-1 truncate">{a.note || "—"}</span>
              {a.createdAt && (
                <span className="text-xs text-slate-600 shrink-0">
                  {timeAgo(Math.floor(new Date(a.createdAt).getTime() / 1000))}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
