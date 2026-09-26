import { timeAgo } from "../lib/api.js";

const ACCENTS = {
  update: "text-signal-blue border-signal-blue/40",
  leak: "text-signal-red border-signal-red/40",
  hype: "text-signal-amber border-signal-amber/40",
};

const LABELS = {
  update: "Update",
  leak: "Leak",
  hype: "Hype",
};

export default function ArticleCard({ post, compact = false }) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card flex flex-col gap-1.5 p-4 hover:border-white/25 transition-colors group"
    >
      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 border ${
            ACCENTS[post.category] || ACCENTS.update
          }`}
        >
          {LABELS[post.category] || "News"}
        </span>
        {post.date && <span className="text-xs text-slate-500">{timeAgo(post.date)}</span>}
        {post.author && <span className="ml-auto text-xs text-slate-500">{post.author}</span>}
      </div>
      <h3 className="font-medium text-slate-100 group-hover:text-white leading-snug line-clamp-2">
        {post.title}
      </h3>
      {post.summary && !compact && (
        <p className="text-sm text-slate-500 line-clamp-2">{post.summary}</p>
      )}
    </a>
  );
}
