import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import LiveCard from "../components/LiveCard.jsx";
import { LoadingBanner, ErrorBanner } from "../components/StateBanner.jsx";

export default function Live() {
  const live = useApi("/api/live", { pollMs: 120000 });
  const configured = live.data?.configured;
  const noPlatformsConfigured = configured && !configured.twitch && !configured.youtube;

  return (
    <div>
      <SectionHeader
        eyebrow="Right now"
        title="Live creators"
        description="Twitch and YouTube status for the GD creators you follow, refreshed every couple of minutes."
      />

      {live.loading && !live.data && <LoadingBanner label="Checking who's live…" />}
      {live.error && !live.data && <ErrorBanner />}

      {noPlatformsConfigured && (
        <div className="card p-4 mb-6 text-sm text-accent-orange border-accent-orange/20">
          Live status isn't configured yet. Set <code className="text-xs">TWITCH_CLIENT_ID</code> /{" "}
          <code className="text-xs">TWITCH_CLIENT_SECRET</code> and/or{" "}
          <code className="text-xs">YOUTUBE_API_KEY</code> on the server to enable this.
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
