import { useApi } from "../lib/api.js";
import LiveFullscreen from "../components/LiveFullscreen.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";
import { ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

export default function LiveStats() {
  const live = useApi("/api/live-progress", { pollMs: 5000 });
  const tracks = live.data?.tracks;
  const track = tracks?.[0];

  return (
    <div>
      {live.loading && !tracks && <CardSkeleton count={1} />}
      {live.error && !tracks && <ErrorBanner />}
      {tracks?.length === 0 && (
        <EmptyState message="Nothing being tracked right now - check back during a stream." />
      )}

      {track && <LiveFullscreen track={track} />}
    </div>
  );
}
