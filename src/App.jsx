import { useEffect, useRef, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Monitoring from "./pages/Monitoring";
import History from "./pages/History";
import Settings from "./pages/Settings";
import { useAuth } from "./hooks/useAuth";
import { useCamera } from "./hooks/useCamera";
import { useFrameLoop } from "./hooks/useFrameLoop";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { createDwell, detectPose } from "./lib/pose";
import { playBeep } from "./lib/utils";

function Shell({ user, onLogout }) {
  const [page, setPage] = useState("Dashboard");
  const [posture, setPosture] = useState(null);
  const [sessions, setSessions] = useLocalStorage(`pg_sessions_${user.email}`, []);
  const [settings, setSettings] = useLocalStorage(`pg_settings_${user.email}`, { audio: true, dwell: 7, threshold: 50 });

  const camera = useCamera((duration) => setSessions((prev) => [{ id: Date.now(), startedAt: new Date(Date.now() - duration * 1000).toISOString(), duration }, ...prev]));

  const dwell = useRef(null);
  useEffect(() => {
    dwell.current = createDwell(settings.dwell, () => settings.audio && playBeep());
  }, [settings.dwell, settings.audio]);

  useFrameLoop(camera, (video, time, canvas) => {
    const result = detectPose(video, time, canvas);
    if (!result) return;
    setPosture(result.bad ? "bad" : "good");
    dwell.current?.update(result.bad);
  });

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));
  const openMonitoring = () => setPage("Live Monitoring");
  const shownPosture = camera.on ? posture : null;

  return (
    <div className="app-container">
      <Sidebar page={page} setPage={setPage} />
      <main className="main-content">
        <Topbar page={page} cameraOn={camera.on} user={user} onLogout={onLogout} />
        {page === "Dashboard" && <Dashboard camera={camera} onStart={openMonitoring} onSettings={() => setPage("Settings")} />}
        {page === "Live Monitoring" && <Monitoring camera={camera} settings={settings} posture={shownPosture} />}
        {page === "History" && <History sessions={sessions} onStart={openMonitoring} onClear={() => setSessions([])} onDelete={(id) => setSessions((prev) => prev.filter((s) => s.id !== id))} />}
        {page === "Settings" && <Settings settings={settings} update={update} />}
      </main>
    </div>
  );
}

export default function App() {
  const auth = useAuth();
  return auth.user ? <Shell key={auth.user.email} user={auth.user} onLogout={auth.logout} /> : <Auth auth={auth} />;
}
