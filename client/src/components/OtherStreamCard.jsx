export default function OtherStreamCard({ stream }) {
  return (
    <a
      href={stream.watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="card flex gap-3 p-3 hover:border-white/25 transition-colors"
    >
      {stream.thumbnailUrl && (
        <img
          src={stream.thumbnailUrl}
          alt=""
          loading="lazy"
          className="w-28 h-16 object-cover shrink-0 bg-ink-800"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white truncate">{stream.channelTitle}</p>
        <p className="text-xs text-slate-400 truncate">{stream.title}</p>
        <p className="text-xs text-signal-green font-mono mt-1">
          {stream.viewerCount.toLocaleString()} watching
        </p>
      </div>
    </a>
  );
}
