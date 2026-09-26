import { Link } from "react-router-dom";
import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import LiveCard from "../components/LiveCard.jsx";
import DemonRow from "../components/DemonRow.jsx";
import { LoadingBanner, ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

function SeeAll({ to }) {
  return (
    <Link to={to} className="text-sm font-medium text-accent-cyan hover:text-accent-purple transition-colors">
      See all →
    </Link>
  );
}

export default function Home() {
  const live = useApi("/api/live", { pollMs: 120000 });
  const demonlist = useApi("/api/demonlist/top10", { pollMs: 30 * 60000 });
  const feed = useApi("/api/feed", { pollMs: 10 * 60000 });

  const liveNow = live.data?.creators.filter((c) => c.live) ?? [];

  return (
    <div className="space-y-14">
      <section className="text-center py-10 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-purple mb-3">
          Your Geometry Dash pulse
        </p>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Everything <span className="gradient-text">GD</span>, in one feed
        </h1>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto">
          Live creators, the top 10 demonlist, fresh updates, leaks and hype — updated
          around the clock.
        </p>
      </section>

      <section>
        <SectionHeader
          eyebrow="Right now"
          title="Live creators"
          description="Doggie, Zoink, Conix and friends — see who's streaming."
          action={<SeeAll to="/live" />}
        />
        {live.loading && !live.data && <LoadingBanner label="Checking who's live…" />}
        {live.error && !live.data && <ErrorBanner />}
        {live.data && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.data.creators.slice(0, 3).map((c) => (
              <LiveCard key={c.displayName} creator={c} />
            ))}
          </div>
        )}
        {liveNow.length === 0 && live.data && (
          <p className="text-xs text-slate-500 mt-3">No one's live right now — check back soon.</p>
        )}
      </section>

      <section>
        <SectionHeader
          eyebrow="Pointercrate"
          title="Top 10 demonlist"
          description="The current hardest rated levels in the game."
          action={<SeeAll to="/demonlist" />}
        />
        {demonlist.loading && !demonlist.data && <LoadingBanner label="Loading demonlist…" />}
        {demonlist.error && !demonlist.data && <ErrorBanner />}
        {demonlist.data && (
          <div className="grid sm:grid-cols-2 gap-3">
            {demonlist.data.demons.slice(0, 4).map((d) => (
              <DemonRow key={d.position} demon={d} />
            ))}
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-3 gap-10">
        <FeedPreview
          eyebrow="Patch notes"
          title="Latest updates"
          to="/updates"
          posts={feed.data?.news}
          loading={feed.loading}
          error={feed.error}
        />
        <FeedPreview
          eyebrow="Rumor mill"
          title="Fresh leaks"
          to="/leaks"
          posts={feed.data?.leaks}
          loading={feed.loading}
          error={feed.error}
        />
        <FeedPreview
          eyebrow="Coming soon"
          title="Upcoming & hype"
          to="/upcoming"
          posts={feed.data?.upcoming}
          loading={feed.loading}
          error={feed.error}
        />
      </div>
    </div>
  );
}

function FeedPreview({ eyebrow, title, to, posts, loading, error }) {
  return (
    <section>
      <SectionHeader eyebrow={eyebrow} title={title} action={<SeeAll to={to} />} />
      <div className="space-y-3">
        {loading && !posts && <LoadingBanner />}
        {error && !posts && <ErrorBanner />}
        {posts?.length === 0 && <EmptyState />}
        {posts?.slice(0, 3).map((post) => (
          <ArticleCard key={post.id} post={post} compact />
        ))}
      </div>
    </section>
  );
}
