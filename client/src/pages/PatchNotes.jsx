import { useApi } from "../lib/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import PatchNoteRow from "../components/PatchNoteRow.jsx";
import { LoadingBanner, ErrorBanner } from "../components/StateBanner.jsx";

export default function PatchNotes() {
  const notes = useApi("/api/patch-notes");

  return (
    <div>
      <SectionHeader
        eyebrow="Version history"
        title="Patch notes"
        description="Major Geometry Dash updates, newest first, including what's confirmed for upcoming versions."
      />

      {notes.loading && !notes.data && <LoadingBanner />}
      {notes.error && !notes.data && <ErrorBanner />}

      {notes.data && (
        <div className="space-y-3">
          {notes.data.entries.map((entry) => (
            <PatchNoteRow key={entry.version} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
