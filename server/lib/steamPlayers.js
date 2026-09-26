const APP_ID = 322170;
const API_URL = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${APP_ID}&format=json`;

export async function fetchCurrentPlayers() {
  const res = await fetch(API_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Steam player count responded ${res.status}`);
  const json = await res.json();
  return { count: json.response?.player_count ?? null };
}
