function PlatformBadge({ label, color }) {
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${color}`}>
      {label}
    </span>
  );
}

function StreamLink({ platform, data, name }) {
  if (!data) return null;
  const isTwitch = platform === "twitch";
  const url = isTwitch ? data.channelUrl : data.watchUrl || data.channelUrl;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 border transition-colors ${
        data.live
          ? "border-accent-cyan/40 text-accent-cyan bg-accent-cyan/5 hover:bg-accent-cyan/10"
          : "border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10"
      }`}
    >
      <PlatformBadge
        label={isTwitch ? "Twitch" : "YouTube"}
        color={isTwitch ? "bg-purple-500/20 text-purple-300" : "bg-red-500/20 text-red-300"}
      />
      {data.live ? (
        <span className="truncate max-w-[10rem]">{data.title || "Live now"}</span>
      ) : (
        <span>Offline</span>
      )}
    </a>
  );
}

export default function LiveCard({ creator }) {
  const liveOn = creator.twitch?.live ? "twitch" : creator.youtube?.live ? "youtube" : null;
  const liveData = liveOn === "twitch" ? creator.twitch : liveOn === "youtube" ? creator.youtube : null;
  const avatar = creator.twitch?.avatarUrl || null;

  return (
    <div
      className={`card p-4 flex flex-col gap-3 ${
        creator.live ? "border-accent-cyan/30 shadow-glow" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          {avatar ? (
            <img src={avatar} alt="" className="w-12 h-12 rounded-full object-cover bg-base-800" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-base-800 flex items-center justify-center text-slate-500 font-bold">
              {creator.displayName[0]}
            </div>
          )}
          {creator.live && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-accent-cyan ring-2 ring-base-900 animate-pulse" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{creator.displayName}</p>
          <p className="text-xs text-slate-500">
            {creator.live ? "Live now" : "Not streaming"}
          </p>
        </div>
      </div>

      {liveData?.thumbnailUrl && (
        <img
          src={liveData.thumbnailUrl}
          alt=""
          loading="lazy"
          className="rounded-xl w-full aspect-video object-cover bg-base-800"
        />
      )}

      <div className="flex flex-wrap gap-2">
        <StreamLink platform="twitch" data={creator.twitch} />
        <StreamLink platform="youtube" data={creator.youtube} />
      </div>
    </div>
  );
}
