export default function LevelSearchRow({ level }) {
  return (
    <a
      href={`https://gdbrowser.com/${level.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="card flex items-center gap-3 p-3 hover:border-white/25 transition-colors"
    >
      {level.difficultyFace && (
        <img
          src={`https://gdbrowser.com/assets/difficulties/${level.difficultyFace}.png`}
          alt={level.difficulty}
          className="h-8 w-8 shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-slate-100 truncate">{level.name}</h3>
        <p className="text-xs text-slate-500 truncate">
          by {level.author} · {level.difficulty} · {level.stars}★
        </p>
      </div>
      <div className="hidden sm:flex flex-col items-end text-xs text-slate-500 font-mono shrink-0">
        <span>{level.likes?.toLocaleString()} likes</span>
        <span>{level.downloads?.toLocaleString()} downloads</span>
      </div>
    </a>
  );
}
