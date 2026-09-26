import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import LiveCard from "../components/LiveCard.jsx";
import { GridSkeleton } from "../components/Skeleton.jsx";
import { ErrorBanner } from "../components/StateBanner.jsx";

export default function Live() {
  const live = useApi("/api/live", { pollMs: 120000 });
  const notConfigured = live.data?.configured && !live.data.configured.youtube;

  return (
    <div>
      <SectionHeader
        eyebrow="Right now"
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
  );
}
