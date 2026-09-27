import { useApi } from "../lib/api.js";
import SectionHeader from "./SectionHeader.jsx";
import TrackCard from "./TrackCard.jsx";
import { LoadingBanner, ErrorBanner } from "./StateBanner.jsx";

export default function LiveProgressCard() {
  const progress = useApi("/api/live-progress", { pollMs: 15000 });

  if (progress.loading && !progress.data) return <LoadingBanner />;
  if (progress.error && !progress.data) return <ErrorBanner />;

  const tracks = progress.data?.tracks ?? [];
  if (tracks.length === 0) return null;

  return (
    <section>
      <SectionHeader
        eyebrow="Live tracking"
        title="Progress watch"
        description="Logged live from stream as attempts happen."
      />
      <TrackCard track={tracks[0]} />
    </section>
  );
}
