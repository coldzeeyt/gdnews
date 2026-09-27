import { useRef, useState } from "react";
import { timeAgo } from "../lib/api.js";
import { useIsMobile } from "../lib/useIsMobile.js";

function groupByStream(attempts) {
  const map = new Map();
  for (const a of attempts) {
    const key = a.streamNumber || "unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(a);
  }
  return [...map.entries()].sort((a, b) => {
    if (a[0] === "unknown") return 1;
    if (b[0] === "unknown") return -1;
    return Number(b[0]) - Number(a[0]);
  });
}

function AttemptRow({ a }) {
  return (
    <div className="card flex items-center gap-4 p-3">
      <span className="font-mono font-bold text-white text-base w-16 shrink-0">{a.percent}%</span>
      <span className="text-sm text-slate-400 flex-1 truncate">{a.note || "—"}</span>
      {a.createdAt && (
        <span className="text-xs text-slate-600 shrink-0">
          {timeAgo(Math.floor(new Date(a.createdAt).getTime() / 1000))}
        </span>
      )}
    </div>
  );
}

function requestFullscreenCompat(el) {
  const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitEnterFullscreen;
  return fn ? fn.call(el) : Promise.reject(new Error("unsupported"));
}

export default function LiveFullscreen({ track }) {
  const rootRef = useRef(null);
  const isMobile = useIsMobile();
  const [showPastStreams, setShowPastStreams] = useState(false);
  const [fsHint, setFsHint] = useState(false);

  const latest = track.attempts[0];
  const currentStreamNumber = track.streamNumber || null;
  const currentStreamAttempts = track.attempts.filter(
    (a) => (a.streamNumber || null) === currentStreamNumber
  );
  const pastThisStream = currentStreamAttempts.slice(1);
  const otherStreams = groupByStream(
    track.attempts.filter((a) => (a.streamNumber || null) !== currentStreamNumber)
  );

  async function goFullscreen() {
    if (!rootRef.current) return;
    try {
      await requestFullscreenCompat(rootRef.current);
    } catch {
      // No Fullscreen API here - notably iOS Safari, which has none for
      // regular elements. Say so instead of leaving the button looking dead.
      setFsHint(true);
      setTimeout(() => setFsHint(false), 6000);
      return;
    }
    try {
      await screen.orientation?.lock?.("landscape");
    } catch {
      // best-effort only - many browsers restrict this even in fullscreen
    }
  }

  return (
    <div ref={rootRef} className="bg-ink-950">
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative">
        <div className="absolute top-4 right-4 text-right">
          <button
            onClick={goFullscreen}
            className="text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-signal-amber"
          >
            Full screen ⤢
          </button>
          {fsHint && (
            <p className="text-xs text-slate-500 normal-case mt-2 max-w-[220px]">
              Safari on iPhone/iPad can't fullscreen a page - tap Share → Add to Home Screen
              and open it from there for a full-screen, app-like view.
            </p>
          )}
        </div>

        <p className="text-sm sm:text-base font-semibold uppercase tracking-widest text-slate-500 mb-3">
          {track.streamer} × {track.level}
          {currentStreamNumber && ` · Stream #${currentStreamNumber}`}
        </p>

        <div className="leading-none">
          <span
            className="font-display font-bold text-signal-amber"
            style={{ fontSize: "clamp(4.5rem, 24vw, 16rem)" }}
          >
            {latest ? latest.percent : 0}
          </span>
          <span
            className="font-display font-bold text-signal-amber"
            style={{ fontSize: "clamp(2.2rem, 11vw, 7rem)" }}
          >
            %
          </span>
        </div>

        {latest?.note && <p className="text-slate-400 mt-4">{latest.note}</p>}
        {latest?.createdAt && (
          <p className="text-xs text-slate-600 mt-1">
            {timeAgo(Math.floor(new Date(latest.createdAt).getTime() / 1000))}
          </p>
        )}
        {!latest && <p className="text-sm text-slate-500 mt-4">No attempts logged yet.</p>}

        {isMobile && (
          <p className="portrait:block landscape:hidden text-xs text-slate-600 mt-10 uppercase tracking-widest">
            Rotate your device for full screen
          </p>
        )}

        {pastThisStream.length > 0 && (
          <p className="text-xs text-slate-600 mt-10 animate-bounce">Scroll down for this stream's attempts ↓</p>
        )}
      </div>

      {pastThisStream.length > 0 && (
        <div className="max-w-xl mx-auto px-4 py-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-3">
            This stream's attempts
          </p>
          <div className="space-y-2">
            {pastThisStream.map((a) => (
              <AttemptRow key={a.id} a={a} />
            ))}
          </div>
        </div>
      )}

      {otherStreams.length > 0 && (
        <div className="max-w-xl mx-auto px-4 pb-16">
          <button
            onClick={() => setShowPastStreams((s) => !s)}
            className="w-full px-4 py-3 text-sm font-semibold uppercase tracking-wide bg-ink-800 border border-white/10 text-slate-200 hover:border-signal-amber/60 transition-colors"
          >
            {showPastStreams ? "Hide" : "Past streams"} on {track.level} ({otherStreams.length})
          </button>

          {showPastStreams && (
            <div className="mt-6 space-y-8">
              {otherStreams.map(([streamNumber, attempts]) => (
                <div key={streamNumber}>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                    {streamNumber === "unknown" ? "Earlier attempts" : `Stream #${streamNumber}`}
                  </p>
                  <div className="space-y-2">
                    {attempts.map((a) => (
                      <AttemptRow key={a.id} a={a} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
