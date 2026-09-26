import { timeAgo } from "../lib/api.js";

const ACCENTS = {
  update: "border-accent-cyan/30 text-accent-cyan",
  leak: "border-accent-pink/30 text-accent-pink",
  upcoming: "border-accent-orange/30 text-accent-orange",
  community: "border-white/10 text-slate-400",
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
      className="card flex gap-4 p-4 hover:border-white/15 hover:bg-base-800/80 transition-colors group"
    >
      {post.thumbnail && !compact && (
        <img
          src={post.thumbnail}
          alt=""
          loading="lazy"
          className="hidden sm:block w-28 h-20 rounded-xl object-cover shrink-0 bg-base-800"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
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
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
          <span>▲ {post.score}</span>
          <span>{post.numComments} comments</span>
          <span className="ml-auto opacity-60">{post.author}</span>
        </div>
      </div>
    </a>
  );
}
