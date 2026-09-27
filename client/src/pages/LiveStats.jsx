import { useApi, timeAgo } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";
import { ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

export default function LiveStats() {
  const live = useApi("/api/live-progress", { pollMs: 5000 });
  const data = live.data;

  return (
    <div>
      <SectionHeader
        eyebrow="Live tracking"
        title={data?.streamer ? `${data.streamer} × ${data.level}` : "Live stats"}
        description="Updated the moment an attempt is logged - refreshes automatically."
      />

      {live.loading && !data && <CardSkeleton count={4} />}
      {live.error && !data && <ErrorBanner />}

      {data && !data.streamer && (
        <EmptyState message="Nothing being tracked right now - check back during a stream." />
      )}

      {data?.streamer && (
        <div className="space-y-6">
          {data.best && (
            <div className="card p-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                Best attempt
              </p>
              <span className="font-display font-bold text-6xl text-signal-amber">
                {data.best.percent}%
              </span>
              {data.best.note && <p className="text-sm text-slate-400 mt-2">{data.best.note}</p>}
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-3">
              All attempts ({data.attempts.length})
            </p>
            {data.attempts.length === 0 && <EmptyState message="No attempts logged yet." />}
            <div className="space-y-2">
              {data.attempts.map((a) => (
                <div key={a.id} className="card flex items-center gap-4 p-3">
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
          </div>
        </div>
      )}
    </div>
  );
}
