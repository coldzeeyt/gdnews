import { Link } from "react-router-dom";
import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import LiveCard from "../components/LiveCard.jsx";
import OtherStreamCard from "../components/OtherStreamCard.jsx";
import TrackCard from "../components/TrackCard.jsx";
import { GridSkeleton, CardSkeleton } from "../components/Skeleton.jsx";
import { ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

export default function Live() {
  const live = useApi("/api/live", { pollMs: 120000 });
  const progress = useApi("/api/live-progress", { pollMs: 5000 });
  const tracks = progress.data?.tracks ?? [];
  const notConfigured = live.data?.configured && !live.data.configured.youtube;

  return (
    <div className="space-y-10">
      {tracks.length > 0 && (
        <div>
          <SectionHeader
            eyebrow="Live tracking"
            title="Progress watch"
            description="Logged live from stream as attempts happen."
            action={
              <Link
                to="/live-stats"
                className="text-xs font-semibold uppercase tracking-wide text-signal-amber hover:text-white"
              >
                Full history
              </Link>
            }
          />
          <div className="space-y-4">
            {tracks.map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionHeader
          eyebrow="Pinned"
          title="Live creators"
          description="YouTube live status for the GD creators you follow, refreshed every couple of minutes."
        />

        {live.loading && !live.data && <GridSkeleton count={3} />}
        {live.error && !live.data && <ErrorBanner />}

        {notConfigured && (
          <div className="card p-4 mb-6 text-sm text-signal-amber border-signal-amber/30">
            Live status isn't configured yet. Set <code className="text-xs">YOUTUBE_API_KEY</code> on
            the server to enable this.
          </div>
        )}

        {live.data && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.data.creators.map((c) => (
              <LiveCard key={c.displayName} creator={c} />
            ))}
          </div>
        )}
      </div>

      {!notConfigured && (
        <div>
          <SectionHeader
            eyebrow="Everyone else"
            title="Live right now"
            description="Anyone else currently streaming Geometry Dash on YouTube. Drops off the moment they end stream."
          />
          {live.loading && !live.data && <CardSkeleton count={4} />}
          {live.data?.otherStreams?.length === 0 && (
            <EmptyState message="No one else is live right now." />
          )}
          {live.data?.otherStreams && live.data.otherStreams.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {live.data.otherStreams.map((s) => (
                <OtherStreamCard key={s.videoId} stream={s} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
