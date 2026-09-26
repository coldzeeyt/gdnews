import FeedPage from "./FeedPage.jsx";

export default function Updates() {
  return (
    <FeedPage
      eyebrow="Steam Community Announcements"
      title="Updates"
      description="Official Geometry Dash announcements, straight from RobTop's Steam news feed."
      url="/api/feed"
      dataKey="updates"
    />
  );
}
