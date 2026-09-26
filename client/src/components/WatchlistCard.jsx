export default function WatchlistCard({ demon }) {
  const content = (
    <>
      <h3 className="font-display text-lg font-semibold text-white uppercase tracking-wide">
        {demon.name}
      </h3>
      <p className="text-sm text-slate-400 mt-1">{demon.note}</p>
    </>
  );

  if (!demon.link) {
    return <div className="card p-4 border-l-4 border-l-signal-amber">{content}</div>;
  }

  return (
    <a
      href={demon.link}
      target="_blank"
      rel="noopener noreferrer"
      className="card p-4 border-l-4 border-l-signal-amber block hover:border-white/25 transition-colors"
    >
      {content}
    </a>
  );
}
