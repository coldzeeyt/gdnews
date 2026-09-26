export function LoadingBanner({ label = "Loading…" }) {
  return (
    <div className="card p-6 text-center text-slate-400 text-sm animate-pulse">
      {label}
    </div>
  );
}

export function ErrorBanner({ message = "Couldn't load this right now." }) {
  return (
    <div className="card p-6 text-center text-sm text-accent-pink/90 border-accent-pink/20">
      {message}
    </div>
  );
}

export function EmptyState({ message = "Nothing here yet — check back soon." }) {
  return (
    <div className="card p-8 text-center text-sm text-slate-500">{message}</div>
  );
}
