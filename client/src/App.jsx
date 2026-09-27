import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Live from "./pages/Live.jsx";
import Demonlist from "./pages/Demonlist.jsx";
import PatchNotes from "./pages/PatchNotes.jsx";
import DailyWeekly from "./pages/DailyWeekly.jsx";
import Updates from "./pages/Updates.jsx";
import Leaks from "./pages/Leaks.jsx";
import Upcoming from "./pages/Upcoming.jsx";
import Furry from "./pages/Furry.jsx";
import Search from "./pages/Search.jsx";
import Passwords from "./pages/Passwords.jsx";
import LiveStats from "./pages/LiveStats.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="live" element={<Live />} />
        <Route path="demonlist" element={<Demonlist />} />
        <Route path="patch-notes" element={<PatchNotes />} />
        <Route path="daily" element={<DailyWeekly />} />
        <Route path="updates" element={<Updates />} />
        <Route path="leaks" element={<Leaks />} />
        <Route path="upcoming" element={<Upcoming />} />
        <Route path="search" element={<Search />} />
        <Route path="passwords" element={<Passwords />} />
        <Route path="live-stats" element={<LiveStats />} />
        <Route path="admin" element={<Admin />} />
        <Route path="is-colon-a-furry" element={<Furry />} />
      </Route>
    </Routes>
  );
}
