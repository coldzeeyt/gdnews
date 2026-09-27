import { useEffect, useState } from "react";
import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";
import { ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

const DEFAULT_SHOWN = 40;

export default function Victors() {
  const demonsApi = useApi("/api/victors/demons");
  const [mode, setMode] = useState("victors");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [victorsState, setVictorsState] = useState({ data: null, loading: false, error: null });

  const demons = demonsApi.data?.demons ?? [];
  const q = query.trim().toLowerCase();
  const filtered = q ? demons.filter((d) => d.name.toLowerCase().includes(q)) : demons;
  const shown = q
    ? filtered.slice(0, mode === "verifiers" ? 150 : 80)
    : filtered.slice(0, mode === "verifiers" ? 60 : DEFAULT_SHOWN);

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
        description={
          mode === "victors"
            ? "Pick an extreme demon to see everyone with an approved 100% completion."
            : "Every extreme demon and who first verified it."
        }
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("victors")}
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide border transition-colors ${
            mode === "victors"
              ? "border-signal-amber text-white bg-signal-amber/10"
              : "border-white/10 text-slate-400 hover:border-white/25"
          }`}
        >
          Victors
        </button>
        <button
          onClick={() => setMode("verifiers")}
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide border transition-colors ${
            mode === "verifiers"
              ? "border-signal-amber text-white bg-signal-amber/10"
              : "border-white/10 text-slate-400 hover:border-white/25"
          }`}
        >
          Verifiers
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a demon…"
        className="w-full bg-ink-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-signal-amber/60 mb-4"
      />

      {demonsApi.loading && !demonsApi.data && <CardSkeleton count={6} />}
      {demonsApi.error && !demonsApi.data && <ErrorBanner />}

      {mode === "victors" && demons.length > 0 && (
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

      {mode === "victors" && selected && (
        <div>
          <SectionHeader
            title={`${selected.name} · #${selected.position}`}
            description={`Verified by ${selected.verifier}`}
          />
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

      {mode === "verifiers" && demons.length > 0 && (
        <>
          {!q && (
            <p className="text-xs text-slate-600 mb-2">
              Showing {shown.length} of {demons.length} - search by name for any other demon.
            </p>
          )}
          {q && (
            <p className="text-xs text-slate-600 mb-2">
              {filtered.length} match{filtered.length === 1 ? "" : "es"}
            </p>
          )}
          {q && filtered.length === 0 && <EmptyState message="No demons match that search." />}
          <div className="space-y-2">
            {shown.map((d) => (
              <div key={d.id} className="card flex items-center gap-3 p-3">
                <span className="font-mono text-xs text-slate-500 w-10 shrink-0">#{d.position}</span>
                <span className="text-white font-medium flex-1 truncate">{d.name}</span>
                <span className="text-sm text-slate-400 shrink-0">Verified by {d.verifier}</span>
                {d.videoUrl && (
                  <a
                    href={d.videoUrl}
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
  );
}
