import { useApi } from "../lib/api.js";
import SectionHeader from "./SectionHeader.jsx";
import { LoadingBanner, ErrorBanner } from "./StateBanner.jsx";

export default function GriefProgressCard() {
  const progress = useApi("/api/progress");

  if (progress.loading && !progress.data) return <LoadingBanner />;
  if (progress.error && !progress.data) return <ErrorBanner />;
  if (!progress.data) return null;

  const { creator, level, best, attempts } = progress.data;

  return (
    <section>
      <SectionHeader
        eyebrow="Progress watch"
        title={`${creator} x ${level}`}
        description="Manually tracked from stream - best and most recent attempts."
      />
      <div className="card p-5">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-display font-bold text-4xl text-signal-amber">
            {best.percent}%
          </span>
          <span className="text-sm text-slate-400">best attempt · {best.note}</span>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Recent attempts
        </p>
        <div className="flex flex-wrap gap-2 font-mono text-sm">
          {attempts.map((a, i) => (
            <span
              key={i}
              className="px-2.5 py-1 border border-white/10 bg-ink-800 text-slate-200"
            >
              {a.note}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
