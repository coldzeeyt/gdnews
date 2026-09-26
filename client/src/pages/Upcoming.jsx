import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import WatchlistCard from "../components/WatchlistCard.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";
import { ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

export default function Upcoming() {
  const watchlist = useApi("/api/watchlist", { pollMs: 30 * 60000 });
  const feed = useApi("/api/feed", { pollMs: 15 * 60000 });
  const posts = feed.data?.hype;

  return (
    <div className="space-y-10">
      <div>
        <SectionHeader
          eyebrow="Watchlist"
          title="Upcoming top demons"
          description="Hyped extreme demons not yet on the list. Entries drop off automatically once they're verified and placed."
        />
        {watchlist.loading && !watchlist.data && <CardSkeleton count={3} />}
        {watchlist.error && !watchlist.data && <ErrorBanner />}
        {watchlist.data?.demons.length === 0 && <EmptyState message="Nothing on the watchlist right now." />}
        {watchlist.data && (
          <div className="grid sm:grid-cols-2 gap-3">
            {watchlist.data.demons.map((d) => (
              <WatchlistCard key={d.name} demon={d} />
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHeader
          eyebrow="Community events"
          title="Hype & previews"
          description="Contests, awards and event previews from Geometry Dash's official Steam news."
        />
        {feed.loading && !posts && <CardSkeleton count={4} />}
        {feed.error && !posts && <ErrorBanner />}
        {posts?.length === 0 && <EmptyState />}
        {posts && (
          <div className="space-y-3">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
