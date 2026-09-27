import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import TrackCard from "../components/TrackCard.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";
import { ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

export default function LiveStats() {
  const live = useApi("/api/live-progress", { pollMs: 5000 });
  const tracks = live.data?.tracks;

  return (
    <div>
      <SectionHeader
        eyebrow="Live tracking"
        title="Live stats"
        description="Every streamer/level being tracked, updated the moment an attempt is logged."
      />

      {live.loading && !tracks && <CardSkeleton count={2} />}
      {live.error && !tracks && <ErrorBanner />}
      {tracks?.length === 0 && (
        <EmptyState message="Nothing being tracked right now - check back during a stream." />
      )}

      {tracks && tracks.length > 0 && (
        <div className="space-y-6">
          {tracks.map((t) => (
            <TrackCard key={t.id} track={t} full />
          ))}
        </div>
      )}
    </div>
  );
}
