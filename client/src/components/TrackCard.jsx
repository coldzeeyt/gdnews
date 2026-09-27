import { timeAgo } from "../lib/api.js";

export default function TrackCard({ track, full = false }) {
  const attempts = full ? track.attempts : track.attempts.slice(0, 8);

  return (
    <div className="card p-5">
      <p className="font-display text-xl font-semibold text-white uppercase tracking-wide mb-3">
        {track.streamer} × {track.level}
        {track.streamNumber && (
          <span className="ml-2 align-middle text-xs font-mono font-normal normal-case tracking-normal text-slate-500">
            Stream #{track.streamNumber}
          </span>
        )}
      </p>

      {track.best && (
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-display font-bold text-4xl text-signal-amber">
            {track.best.percent}%
          </span>
          <span className="text-sm text-slate-400">
            best attempt{track.best.note ? ` · ${track.best.note}` : ""}
          </span>
        </div>
      )}

      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
        {full ? `All attempts (${track.attempts.length})` : "Recent attempts"}
      </p>

      {track.attempts.length === 0 && (
        <p className="text-sm text-slate-500">No attempts logged yet.</p>
      )}

      {full ? (
        <div className="space-y-2">
          {attempts.map((a) => (
            <div key={a.id} className="flex items-center gap-4 border-t border-white/5 pt-2 first:border-0 first:pt-0">
              <span className="font-mono font-bold text-white text-lg w-16 shrink-0">
                {a.percent}%
              </span>
              <span className="text-sm text-slate-400 flex-1 truncate">{a.note || "—"}</span>
              {a.createdAt && (
                <span className="text-xs text-slate-600 shrink-0">
                  {timeAgo(Math.floor(new Date(a.createdAt).getTime() / 1000))}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 font-mono text-sm">
          {attempts.map((a) => (
            <span key={a.id} className="px-2.5 py-1 border border-white/10 bg-ink-800 text-slate-200">
              {a.percent}%{a.note ? ` - ${a.note}` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
