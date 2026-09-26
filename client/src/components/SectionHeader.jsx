export default function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-cyan/80 mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">{title}</h2>
        {description && <p className="text-slate-400 text-sm mt-1 max-w-xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}
