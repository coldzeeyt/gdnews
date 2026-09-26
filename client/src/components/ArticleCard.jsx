import { timeAgo } from "../lib/api.js";

const ACCENTS = {
  update: "text-signal-blue border-signal-blue/40",
  leak: "text-signal-red border-signal-red/40",
  upcoming: "text-signal-amber border-signal-amber/40",
  community: "text-slate-400 border-white/15",
};

const LABELS = {
  update: "Update",
  leak: "Leak",
  upcoming: "Upcoming",
  community: "Community",
};

export default function ArticleCard({ post, compact = false }) {
  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="card flex gap-4 p-4 hover:border-white/25 transition-colors group"
    >
      {post.thumbnail && !compact && (
        <img
          src={post.thumbnail}
          alt=""
          loading="lazy"
          className="hidden sm:block w-28 h-20 object-cover shrink-0 bg-ink-800"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 border ${
              ACCENTS[post.category] || ACCENTS.community
            }`}
          >
            {LABELS[post.category] || "News"}
          </span>
          <span className="text-xs text-slate-500">{timeAgo(post.createdUtc)}</span>
        </div>
        <h3 className="font-medium text-slate-100 group-hover:text-white leading-snug line-clamp-2">
          {post.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-mono">
          <span>+{post.score}</span>
          <span>{post.numComments} comments</span>
          <span className="ml-auto opacity-60 font-sans">{post.author}</span>
        </div>
      </div>
    </a>
  );
}
