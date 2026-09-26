import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Live from "./pages/Live.jsx";
import Demonlist from "./pages/Demonlist.jsx";
import Updates from "./pages/Updates.jsx";
import Leaks from "./pages/Leaks.jsx";
import Upcoming from "./pages/Upcoming.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="live" element={<Live />} />
        <Route path="demonlist" element={<Demonlist />} />
        <Route path="updates" element={<Updates />} />
        <Route path="leaks" element={<Leaks />} />
        <Route path="upcoming" element={<Upcoming />} />
      </Route>
    </Routes>
  );
}
