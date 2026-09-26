export function LoadingBanner({ label = "Loading…" }) {
  return (
    <div className="card p-5 text-center text-slate-500 text-sm">{label}</div>
  );
}

export function ErrorBanner({ message = "Couldn't load this right now." }) {
  return (
    <div className="card p-5 text-center text-sm text-signal-red border-signal-red/30">
      {message}
    </div>
  );
}

export function EmptyState({ message = "Nothing here yet — check back soon." }) {
  return (
    <div className="card p-6 text-center text-sm text-slate-500">{message}</div>
  );
}
