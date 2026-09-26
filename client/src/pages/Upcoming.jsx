import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import WatchlistCard from "../components/WatchlistCard.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { LoadingBanner, ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

export default function Upcoming() {
  const watchlist = useApi("/api/watchlist", { pollMs: 30 * 60000 });
  const feed = useApi("/api/feed", { pollMs: 10 * 60000 });
  const posts = feed.data?.upcoming;

  return (
    <div className="space-y-10">
      <div>
        <SectionHeader
          eyebrow="Watchlist"
          title="Upcoming top demons"
          description="Hyped extreme demons not yet on the list. Entries drop off automatically once they're verified and placed."
        />
        {watchlist.loading && !watchlist.data && <LoadingBanner />}
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
          eyebrow="Coming soon"
          title="Hype & previews"
          description="Teasers, previews and showcases from the community."
        />
        {feed.loading && !posts && <LoadingBanner />}
        {feed.error && !posts && <ErrorBanner />}
        {feed.data && feed.data.configured === false && (
          <div className="card p-4 mb-6 text-sm text-signal-amber border-signal-amber/30">
            This feed isn't configured yet. Set <code className="text-xs">REDDIT_CLIENT_ID</code> and{" "}
            <code className="text-xs">REDDIT_CLIENT_SECRET</code> on the server to enable it.
          </div>
        )}
        {posts?.length === 0 && feed.data?.configured !== false && <EmptyState />}
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
