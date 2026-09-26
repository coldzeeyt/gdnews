export default function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4 flex-wrap border-b border-white/10 pb-3">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-white uppercase tracking-wide">
          {title}
        </h2>
        {description && <p className="text-slate-500 text-sm mt-1 max-w-xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}
