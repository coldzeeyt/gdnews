import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { LoadingBanner, ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

export default function FeedPage({ eyebrow, title, description, dataKey }) {
  const feed = useApi("/api/feed", { pollMs: 10 * 60000 });
  const posts = feed.data?.[dataKey];

  return (
    <div>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />

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
  );
}
