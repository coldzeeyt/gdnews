import { useState } from "react";
import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";
import { ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard API unavailable - button still gives visual feedback below
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      onClick={copy}
      className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide border transition-colors shrink-0 ${
        copied
          ? "border-signal-green text-signal-green"
          : "border-white/10 text-slate-300 hover:border-signal-amber/60 hover:text-signal-amber"
      }`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const DEFAULT_SHOWN = 60;

export default function Passwords() {
  const { data, loading, error } = useApi("/api/passwords");
  const [query, setQuery] = useState("");

  const all = data?.passwords ?? [];
  const q = query.trim().toLowerCase();
  const matches = q
    ? all.filter((p) => p.name.toLowerCase().includes(q) || p.creator.toLowerCase().includes(q))
    : all;
  const filtered = q ? matches : matches.slice(0, DEFAULT_SHOWN);

  return (
    <div>
      <SectionHeader
        eyebrow="Community-sourced"
        title="Level passwords"
        description="Copy passwords for well-known levels. Find the level in-game by name first, then use the password to copy it."
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by level or creator…"
        className="w-full bg-ink-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-signal-amber/60 mb-6"
      />

      {loading && !data && <CardSkeleton count={6} />}
      {error && !data && <ErrorBanner />}
      {data && matches.length === 0 && <EmptyState message="No levels match that search." />}

      {!q && all.length > 0 && (
        <p className="text-xs text-slate-600 mb-2">
          Showing {filtered.length} of {all.length} - search by level or creator for the rest.
        </p>
      )}

      {filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={`${p.name}-${p.creator}`} className="card flex items-center gap-3 p-3">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 shrink-0 ${
                  p.category === "Demon"
                    ? "text-signal-red border border-signal-red/40"
                    : "text-signal-blue border border-signal-blue/40"
                }`}
              >
                {p.category}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{p.name}</p>
                <p className="text-xs text-slate-500 truncate">by {p.creator}</p>
              </div>
              <span className="font-mono text-sm text-slate-300 shrink-0">{p.password}</span>
              <CopyButton text={p.password} />
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-600 mt-6">
        Sourced from the community-maintained list on the{" "}
        <a
          href="https://gdforum.freeforums.net/thread/51345/list-level-passwords"
          target="_blank"
          rel="noopener noreferrer"
          className="text-signal-amber hover:text-white"
        >
          GD Forum
        </a>
        .
      </p>
    </div>
  );
}
