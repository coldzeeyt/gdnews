import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import DemonRow from "../components/DemonRow.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";
import { ErrorBanner } from "../components/StateBanner.jsx";

export default function Demonlist() {
  const demonlist = useApi("/api/demonlist/top10", { pollMs: 30 * 60000 });

  return (
    <div>
      <SectionHeader
        eyebrow="Pointercrate"
        title="Top 10 demonlist"
        description="The current hardest rated demons in Geometry Dash, ranked by difficulty."
      />

      {demonlist.loading && !demonlist.data && <CardSkeleton count={10} />}
      {demonlist.error && !demonlist.data && <ErrorBanner />}

      {demonlist.data && (
        <div className="space-y-3">
          {demonlist.data.demons.map((d) => (
            <DemonRow key={d.position} demon={d} />
          ))}
        </div>
      )}
    </div>
  );
}
