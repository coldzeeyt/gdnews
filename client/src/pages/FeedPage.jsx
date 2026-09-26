import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";
import { ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

export default function FeedPage({ eyebrow, title, description, url, dataKey }) {
  const feed = useApi(url, { pollMs: 15 * 60000 });
  const posts = feed.data?.[dataKey];

  return (
    <div>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />

      {feed.loading && !posts && <CardSkeleton count={5} />}
      {feed.error && !posts && <ErrorBanner />}
      {posts?.length === 0 && <EmptyState />}

      {posts && (
        <div className="space-y-3">
          {posts.map((post) => (
            <ArticleCard key={post.id ?? post.url} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
