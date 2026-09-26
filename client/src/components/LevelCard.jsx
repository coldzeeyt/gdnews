export default function LevelCard({ label, level }) {
  if (!level) {
    return (
      <div className="card p-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
          {label}
        </p>
        <p className="text-sm text-slate-500">Not available right now.</p>
      </div>
    );
  }

  return (
    <a
      href={`https://gdbrowser.com/${level.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="card p-5 block hover:border-white/25 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </p>
        {level.difficultyFace && (
          <img
            src={`https://gdbrowser.com/assets/difficulties/${level.difficultyFace}.png`}
            alt={level.difficulty}
            className="h-7 w-7"
          />
        )}
      </div>
      <h3 className="font-display text-2xl font-semibold text-white uppercase tracking-wide truncate">
        {level.name}
      </h3>
      <p className="text-sm text-slate-400 mt-1">by {level.author}</p>
      <div className="grid grid-cols-3 gap-3 mt-4 font-mono text-sm">
        <div>
          <p className="text-slate-500 text-xs uppercase">Stars</p>
          <p className="text-slate-200">{level.stars}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase">Likes</p>
          <p className="text-slate-200">{level.likes?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase">Downloads</p>
          <p className="text-slate-200">{level.downloads?.toLocaleString()}</p>
        </div>
      </div>
      {level.songName && (
        <p className="text-xs text-slate-500 mt-3 truncate">
          Song: {level.songName} — {level.songAuthor}
        </p>
      )}
    </a>
  );
}
