const STATUS_STYLE = {
  released: "text-signal-green border-signal-green/40",
  upcoming: "text-signal-amber border-signal-amber/40",
};

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PatchNoteRow({ entry }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="font-display font-semibold text-xl text-white">
          {entry.version}
        </span>
        <span className="text-slate-400 text-sm">— {entry.title}</span>
        <span
          className={`ml-auto text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 border ${
            STATUS_STYLE[entry.status] || STATUS_STYLE.released
          }`}
        >
          {entry.status === "upcoming" ? "Upcoming" : formatDate(entry.date) || "Released"}
        </span>
      </div>
      <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
        {entry.highlights.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
    </div>
  );
}
