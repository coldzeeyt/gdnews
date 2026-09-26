export function CardSkeleton({ count = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 flex gap-4 items-center">
          <div className="skeleton h-16 w-24 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 3, className = "" }) {
  return (
    <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="skeleton h-11 w-11 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-2/3" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
