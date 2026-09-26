export default function LiveCard({ creator }) {
  const yt = creator.youtube;
  const avatar = yt?.avatarUrl || null;
  const url = yt?.live ? yt.watchUrl || yt.channelUrl : yt?.channelUrl;

  return (
    <a
      href={url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`card p-4 flex flex-col gap-3 hover:border-white/20 transition-colors ${
        creator.live ? "border-signal-green/50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          {avatar ? (
            <img src={avatar} alt="" className="w-11 h-11 object-cover bg-ink-800" />
          ) : (
            <div className="w-11 h-11 bg-ink-800 flex items-center justify-center text-slate-500 font-display font-semibold">
              {creator.displayName[0]}
            </div>
          )}
          {creator.live && (
            <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-signal-green ring-2 ring-ink-900" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{creator.displayName}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            {creator.live ? "Live now" : "Offline"}
          </p>
        </div>
      </div>

      {yt?.live && yt.thumbnailUrl && (
        <img
          src={yt.thumbnailUrl}
          alt=""
          loading="lazy"
          className="w-full aspect-video object-cover bg-ink-800"
        />
      )}

      {yt?.live && yt.title && (
        <p className="text-sm text-slate-300 line-clamp-2">{yt.title}</p>
      )}
    </a>
  );
}
