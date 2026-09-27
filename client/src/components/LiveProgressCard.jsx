import { Link } from "react-router-dom";
import { useApi } from "../lib/api.js";
import SectionHeader from "./SectionHeader.jsx";
import { LoadingBanner, ErrorBanner } from "./StateBanner.jsx";

export default function LiveProgressCard() {
  const progress = useApi("/api/live-progress", { pollMs: 15000 });

  if (progress.loading && !progress.data) return <LoadingBanner />;
  if (progress.error && !progress.data) return <ErrorBanner />;
  if (!progress.data?.streamer) return null;

  const { streamer, level, best, attempts } = progress.data;

  return (
    <section>
      <SectionHeader
        eyebrow="Live tracking"
        title={`${streamer} × ${level}`}
        description="Logged live from stream as attempts happen."
        action={
          <Link
            to="/live-stats"
            className="text-xs font-semibold uppercase tracking-wide text-signal-amber hover:text-white"
          >
            Full history
          </Link>
        }
      />
      <div className="card p-5">
        {best && (
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-display font-bold text-4xl text-signal-amber">
              {best.percent}%
            </span>
            <span className="text-sm text-slate-400">
              best attempt{best.note ? ` · ${best.note}` : ""}
            </span>
          </div>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Recent attempts
        </p>
        <div className="flex flex-wrap gap-2 font-mono text-sm">
          {attempts.slice(0, 8).map((a) => (
            <span key={a.id} className="px-2.5 py-1 border border-white/10 bg-ink-800 text-slate-200">
              {a.percent}%{a.note ? ` - ${a.note}` : ""}
            </span>
          ))}
          {attempts.length === 0 && <span className="text-slate-500">No attempts logged yet.</span>}
        </div>
      </div>
    </section>
  );
}
