import { useEffect, useState } from "react";
import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";
import { ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

const DEFAULT_SHOWN = 40;

export default function Victors() {
  const demonsApi = useApi("/api/victors/demons");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [victorsState, setVictorsState] = useState({ data: null, loading: false, error: null });

  const demons = demonsApi.data?.demons ?? [];
  const q = query.trim().toLowerCase();
  const filtered = q ? demons.filter((d) => d.name.toLowerCase().includes(q)) : demons;
  const shown = q ? filtered.slice(0, 80) : filtered.slice(0, DEFAULT_SHOWN);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setVictorsState({ data: null, loading: true, error: null });
    fetch(`/api/victors/${selected.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setVictorsState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setVictorsState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  return (
    <div>
      <SectionHeader
        eyebrow="Pointercrate"
        title="Victors"
        description="Pick an extreme demon to see everyone with an approved 100% completion."
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a demon…"
        className="w-full bg-ink-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-signal-amber/60 mb-4"
      />

      {demonsApi.loading && !demonsApi.data && <CardSkeleton count={6} />}
      {demonsApi.error && !demonsApi.data && <ErrorBanner />}

      {demons.length > 0 && (
        <>
          {!q && (
            <p className="text-xs text-slate-600 mb-2">
              Showing the top {shown.length} by position - search by name for any other demon.
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-8">
            {shown.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelected(d)}
                className={`px-3 py-1.5 text-sm border transition-colors ${
                  selected?.id === d.id
                    ? "border-signal-amber text-white bg-signal-amber/10"
                    : "border-white/10 text-slate-400 hover:border-white/25"
                }`}
              >
                <span className="font-mono text-xs text-slate-500 mr-1.5">#{d.position}</span>
                {d.name}
              </button>
            ))}
          </div>
        </>
      )}

      {selected && (
        <div>
          <SectionHeader title={`${selected.name} · #${selected.position}`} />
          {victorsState.loading && <CardSkeleton count={4} />}
          {victorsState.error && <ErrorBanner />}
          {victorsState.data?.victors?.length === 0 && (
            <EmptyState message="No approved 100% completions yet." />
          )}
          {victorsState.data?.victors && victorsState.data.victors.length > 0 && (
            <>
              <p className="text-xs text-slate-600 mb-3">
                {victorsState.data.victors.length} victor{victorsState.data.victors.length === 1 ? "" : "s"}
              </p>
              <div className="space-y-2">
                {victorsState.data.victors.map((v) => (
                  <div key={v.id} className="card flex items-center gap-3 p-3">
                    <span className="text-white font-medium flex-1 truncate">{v.player}</span>
                    {v.video && (
                      <a
                        href={v.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold uppercase tracking-wide text-signal-amber hover:text-white shrink-0"
                      >
                        Watch
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
