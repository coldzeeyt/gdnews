const MEDALS = ["🥇", "🥈", "🥉"];

export default function DemonRow({ demon }) {
  const medal = MEDALS[demon.position - 1];

  return (
    <a
      href={demon.videoUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="card flex items-center gap-4 p-3 sm:p-4 hover:border-white/15 hover:bg-base-800/80 transition-colors group"
    >
      <div className="w-10 shrink-0 text-center">
        {medal ? (
          <span className="text-2xl">{medal}</span>
        ) : (
          <span className="font-display font-bold text-xl text-slate-500">
            #{demon.position}
          </span>
        )}
      </div>

      {demon.thumbnail ? (
        <img
          src={demon.thumbnail}
          alt=""
          loading="lazy"
          className="w-24 h-16 rounded-lg object-cover shrink-0 bg-base-800"
        />
      ) : (
        <div className="w-24 h-16 rounded-lg bg-base-800 shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-100 group-hover:text-white truncate">
          {demon.name}
        </h3>
        <p className="text-xs text-slate-500 truncate">
          by {demon.publisher} · verified by {demon.verifier}
        </p>
      </div>
    </a>
  );
}
