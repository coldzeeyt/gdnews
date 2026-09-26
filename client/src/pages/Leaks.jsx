import FeedPage from "./FeedPage.jsx";

export default function Leaks() {
  return (
    <FeedPage
      eyebrow="Rumor mill"
      title="Leaks"
      description="Unreleased or datamined content the community has spotted. Curated by hand, since there's no clean public API for this."
      url="/api/leaks"
      dataKey="leaks"
    />
  );
}
