import { useState } from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import LevelSearchRow from "../components/LevelSearchRow.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";
import { ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

export default function Search() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState({ levels: null, loading: false, error: null });

  async function runSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setState({ levels: null, loading: true, error: null });
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`responded ${res.status}`);
      const data = await res.json();
      setState({ levels: data.levels, loading: false, error: null });
    } catch (error) {
      setState({ levels: null, loading: false, error });
    }
  }

  return (
    <div>
      <SectionHeader
        eyebrow="GDBrowser"
        title="Level search"
        description="Look up any published level by name."
      />

      <form onSubmit={runSearch} className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Level name…"
          className="flex-1 bg-ink-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-signal-amber/60"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-semibold uppercase tracking-wide bg-signal-amber text-ink-950 hover:bg-signal-amber/90 transition-colors"
        >
          Search
        </button>
      </form>

      {state.loading && <CardSkeleton count={5} />}
      {state.error && <ErrorBanner />}
      {state.levels?.length === 0 && <EmptyState message="No levels found." />}

      {state.levels && (
        <div className="space-y-2">
          {state.levels.map((level) => (
            <LevelSearchRow key={level.id} level={level} />
          ))}
        </div>
      )}
    </div>
  );
}
