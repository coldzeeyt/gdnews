const API_BASE = "https://gdbrowser.com/api";

function normalize(level) {
  if (!level || level === -1) return null;
  return {
    id: level.id,
    name: level.name,
    author: level.author,
    description: level.description,
    difficulty: level.difficulty,
    difficultyFace: level.difficultyFace,
    stars: level.stars,
    downloads: level.downloads,
    likes: level.likes,
    songName: level.songName,
    songAuthor: level.songAuthor,
    dailyNumber: level.dailyNumber,
    nextTimestamp: level.nextDailyTimestamp ?? null,
  };
}

async function fetchLevel(kind) {
  const res = await fetch(`${API_BASE}/level/${kind}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`gdbrowser ${kind} responded ${res.status}`);
  const json = await res.json();
  return normalize(json);
}

export async function fetchDailyAndWeekly() {
  const [daily, weekly] = await Promise.all([
    fetchLevel("daily"),
    fetchLevel("weekly"),
  ]);
  return { daily, weekly };
}
