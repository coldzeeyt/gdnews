const RANK_ACCENT = {
  1: "border-l-signal-amber",
  2: "border-l-slate-400",
  3: "border-l-signal-red",
};

export default function DemonRow({ demon }) {
  return (
    <a
      href={demon.videoUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`card flex items-center gap-4 p-3 border-l-4 hover:border-white/25 transition-colors ${
        RANK_ACCENT[demon.position] || "border-l-ink-700"
      }`}
    >
      <div className="w-9 shrink-0 text-center font-display font-semibold text-2xl text-slate-500">
        {demon.position}
      </div>

      {demon.thumbnail ? (
        <img
          src={demon.thumbnail}
          alt=""
          loading="lazy"
          className="w-24 h-16 object-cover shrink-0 bg-ink-800"
        />
      ) : (
        <div className="w-24 h-16 bg-ink-800 shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-100 truncate">{demon.name}</h3>
        <p className="text-xs text-slate-500 truncate">
          by {demon.publisher} · verified by {demon.verifier}
        </p>
      </div>
    </a>
  );
}
