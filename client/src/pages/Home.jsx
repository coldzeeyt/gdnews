import { Link } from "react-router-dom";
import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import LiveCard from "../components/LiveCard.jsx";
import DemonRow from "../components/DemonRow.jsx";
import PatchNoteRow from "../components/PatchNoteRow.jsx";
import LevelCard from "../components/LevelCard.jsx";
import GriefProgressCard from "../components/GriefProgressCard.jsx";
import { LoadingBanner, ErrorBanner, EmptyState } from "../components/StateBanner.jsx";

function SeeAll({ to }) {
  return (
    <Link to={to} className="text-xs font-semibold uppercase tracking-wide text-signal-amber hover:text-white">
      See all
    </Link>
  );
}

export default function Home() {
  const live = useApi("/api/live", { pollMs: 120000 });
  const demonlist = useApi("/api/demonlist/top10", { pollMs: 30 * 60000 });
  const feed = useApi("/api/feed", { pollMs: 10 * 60000 });
  const patchNotes = useApi("/api/patch-notes");
  const daily = useApi("/api/daily", { pollMs: 15 * 60000 });

  return (
    <div className="space-y-10">
      <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
        <h1 className="font-display text-2xl font-semibold text-white uppercase tracking-wide">
          Overview
        </h1>
        <p className="text-xs text-slate-500">Live creators, demonlist, updates & leaks</p>
      </div>

      <GriefProgressCard />

      <section>
        <SectionHeader eyebrow="Right now" title="Live creators" action={<SeeAll to="/live" />} />
        {live.loading && !live.data && <LoadingBanner label="Checking who's live…" />}
        {live.error && !live.data && <ErrorBanner />}
        {live.data && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.data.creators.slice(0, 3).map((c) => (
              <LiveCard key={c.displayName} creator={c} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader eyebrow="Pointercrate" title="Top 10 demonlist" action={<SeeAll to="/demonlist" />} />
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

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <SectionHeader eyebrow="Rate-a-day" title="Daily & weekly" action={<SeeAll to="/daily" />} />
          {daily.loading && !daily.data && <LoadingBanner />}
          {daily.error && !daily.data && <ErrorBanner />}
          {daily.data && (
            <div className="grid sm:grid-cols-2 gap-3">
              <LevelCard label="Daily" level={daily.data.daily} />
              <LevelCard label="Weekly" level={daily.data.weekly} />
            </div>
          )}
        </section>

        <section>
          <SectionHeader eyebrow="Version history" title="Latest patch" action={<SeeAll to="/patch-notes" />} />
          {patchNotes.loading && !patchNotes.data && <LoadingBanner />}
          {patchNotes.error && !patchNotes.data && <ErrorBanner />}
          {patchNotes.data && <PatchNoteRow entry={patchNotes.data.entries[0]} />}
        </section>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <FeedPreview eyebrow="Patch notes" title="Updates" to="/updates" posts={feed.data?.news} loading={feed.loading} error={feed.error} />
        <FeedPreview eyebrow="Rumor mill" title="Leaks" to="/leaks" posts={feed.data?.leaks} loading={feed.loading} error={feed.error} />
        <FeedPreview eyebrow="Coming soon" title="Upcoming" to="/upcoming" posts={feed.data?.upcoming} loading={feed.loading} error={feed.error} />
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
