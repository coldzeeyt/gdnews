import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import LevelCard from "../components/LevelCard.jsx";
import { LoadingBanner, ErrorBanner } from "../components/StateBanner.jsx";

export default function DailyWeekly() {
  const data = useApi("/api/daily", { pollMs: 15 * 60000 });

  return (
    <div>
      <SectionHeader
        eyebrow="Rate-a-day"
        title="Daily & weekly levels"
        description="The current daily level and weekly demon, straight from the game's servers."
      />

      {data.loading && !data.data && <LoadingBanner />}
      {data.error && !data.data && <ErrorBanner />}

      {data.data && (
        <div className="grid sm:grid-cols-2 gap-4">
          <LevelCard label="Daily level" level={data.data.daily} />
          <LevelCard label="Weekly demon" level={data.data.weekly} />
        </div>
      )}
    </div>
  );
}
