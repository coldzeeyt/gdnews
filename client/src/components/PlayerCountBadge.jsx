import { useApi } from "../lib/api.js";

export default function PlayerCountBadge() {
  const { data } = useApi("/api/players", { pollMs: 5 * 60000 });
  if (!data?.count) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-signal-green" />
      <span className="font-mono text-slate-300">{data.count.toLocaleString()}</span>
      <span>playing right now</span>
    </div>
  );
}
