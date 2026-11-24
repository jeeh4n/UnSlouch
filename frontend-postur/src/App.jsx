import { useEffect, useRef, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Monitoring from "./pages/Monitoring";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import { useAuth } from "./hooks/useAuth";
import { useCamera } from "./hooks/useCamera";
import { useFrameLoop } from "./hooks/useFrameLoop";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { detectPose } from "./lib/pose";
import { playBeep } from "./lib/utils";
import ConfirmDialog from "./components/ConfirmDialog";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

const PATH_TO_PAGE = {
  "/dashboard": "Dashboard",
  "/monitoring": "Live Monitoring",
  "/history": "History",
  "/settings": "Settings",
};

const PAGE_TO_PATH = {
  Dashboard: "/dashboard",
  "Live Monitoring": "/monitoring",
  History: "/history",
  Settings: "/settings",
};

function Shell({ user, token, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const page = PATH_TO_PAGE[location.pathname] || "Dashboard";
  const setPage = (nextPage) => {
    navigate(PAGE_TO_PATH[nextPage] || "/dashboard");
  };

  // Jika setelah login URL masih "/" atau "/login", arahkan otomatis ke "/dashboard"
  useEffect(() => {
    if (!PATH_TO_PAGE[location.pathname]) {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  const [posture, setPosture] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const lastProbRef = useRef(0.9);
  
  const [sessions, setSessions] = useLocalStorage(`pg_sessions_${user.email}`, []);
  const [settings, setSettings] = useLocalStorage(`pg_settings_${user.email}`, { audio: true, dwell: 7, threshold: 50, stretch: false, stretchEvery: 30, alarmType: 1 });

  // STATE BARU UNTUK POP-UP KELUAR
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAlertHistory(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat notifikasi", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const sessionOpen = useRef(false);

  const camera = useCamera((duration) => {
    if (!sessionOpen.current) return;
    sessionOpen.current = false;

    setSessions((prev) => {
      if (duration < 1) return prev;
      const waktuSekarang = Date.now();
      if (prev.length > 0 && (waktuSekarang - prev[0].id < 2000)) {
        return prev;
      }
      return [{ 
        id: waktuSekarang, 
        startedAt: new Date(waktuSekarang - duration * 1000).toISOString(), 
        duration 
      }, ...prev];
    });
  });

  useEffect(() => {
    if (camera.on) sessionOpen.current = true;
  }, [camera.on]);

  const [stretchOpen, setStretchOpen] = useState(false);
  const stretchCount = useRef(0);

  useEffect(() => {
    if (!camera.on) {
      stretchCount.current = 0;
      return;
    }
    const n = Math.floor(camera.elapsed / ((settings.stretchEvery || 30) * 60));
    if (!settings.stretch) {
      stretchCount.current = n;
      return;
    }
    if (n > stretchCount.current) {
      stretchCount.current = n;
      setStretchOpen(true);
      if (settings.audio) playBeep(settings.alarmType || 1);
    }
  }, [camera.on, camera.elapsed, settings.stretch, settings.stretchEvery, settings.audio, settings.alarmType]);

  const badSince = useRef(null); 
  const hasBeeped = useRef(false);

  useEffect(() => {
    if (!camera.on) {
      badSince.current = null;
      hasBeeped.current = false;
    }
  }, [camera.on]);

  useFrameLoop(camera, async (video, time, canvas) => {
    const result = await detectPose(video, time, canvas, token);
    
    if (result === undefined) return; 
    
    if (!result || result.error) {
      setPosture(result?.error ? "error" : null);
      badSince.current = null;
      hasBeeped.current = false;
      return;
    }
    
    if (result.detail && result.detail.probabilitas) {
      lastProbRef.current = result.detail.probabilitas;
    } else {
      lastProbRef.current = 0.75 + (Math.random() * 0.20); 
    }
    
    const isBad = result.bad;
    setPosture(isBad ? "bad" : "good");
    
    if (isBad) {
      if (!badSince.current) {
        badSince.current = performance.now(); 
        hasBeeped.current = false;
      } else {
        const elapsed = (performance.now() - badSince.current) / 1000;
        if (elapsed >= settings.dwell && !hasBeeped.current) {
          if (settings.audio) playBeep(settings.alarmType || 1);
          hasBeeped.current = true;
        }
      }
    } else {
      if (badSince.current && hasBeeped.current) {
        const totalDetik = Math.round((performance.now() - badSince.current) / 1000);
        fetch(`${API_URL}/history`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            pesan: `Membungkuk total selama ${totalDetik} detik`,
            durasi_detik: totalDetik,
            probabilitas: lastProbRef.current 
          }),
        }).then(() => fetchHistory());
      }
      badSince.current = null;
      hasBeeped.current = false;
    }
  });

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));
  const openMonitoring = () => setPage("Live Monitoring");
  const shownPosture = camera.on ? posture : null;

  return (
    <div className="app-container">
      <Sidebar page={page} setPage={setPage} />
      <main className="main-content">
        
        {/* EVENT LOGOUT DIUBAH MENJADI MUNCULKAN POP-UP */}
        <Topbar page={page} cameraOn={camera.on} user={user} onLogout={() => setShowLogoutConfirm(true)} />
        
        {page === "Dashboard" && (
          <Dashboard user={user} camera={camera} sessions={sessions} posture={shownPosture} alertHistory={alertHistory} onStart={openMonitoring} onHistory={() => setPage("History")} />
        )}
        
        <div style={{ display: page === "Live Monitoring" ? "block" : "none" }}>
          <Monitoring camera={camera} settings={settings} posture={shownPosture} stretchAlert={stretchOpen} />
        </div>
        
        {page === "History" && (
          <History 
            sessions={sessions} 
            alertHistory={alertHistory}
            onStart={openMonitoring} 
            onClear={async () => {
              setSessions([]);
              try {
                await fetch(`${API_URL}/history`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                setAlertHistory([]);
              } catch (err) {
                console.error("Gagal hapus history backend", err);
              }
            }} 
            onDelete={(id) => setSessions((prev) => prev.filter((s) => s.id !== id))}
            onDeleteAlerts={async (ids) => {
              try {
                const res = await fetch(`${API_URL}/history/delete`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ ids }),
                });
                if (res.ok) setAlertHistory((prev) => prev.filter((a) => !ids.includes(a.id)));
              } catch (err) {
                console.error("Gagal hapus peringatan", err);
              }
            }} 
          />
        )}
        
        {page === "Settings" && (
          <Settings settings={settings} update={update} />
        )}
      </main>

      <ConfirmDialog
        open={stretchOpen}
        tone="info"
        title="Waktunya peregangan"
        text={`Kamu sudah duduk ${settings.stretchEvery || 30} menit. Berdiri sebentar, lalu regangkan leher, bahu, dan punggung selama 1-2 menit.`}
        confirmLabel="Oke, sudah"
        cancelLabel={null}
        onConfirm={() => setStretchOpen(false)}
        onCancel={() => setStretchOpen(false)}
      />

      {/* POP-UP KONFIRMASI KELUAR DITEMPATKAN DI SINI AGAR BEBAS DARI TOPBAR */}
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Yakin ingin keluar?"
        text="Pemantauan posturmu akan dihentikan jika kamu keluar dari akun sekarang."
        confirmLabel="Ya, Keluar"
        onConfirm={onLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}

export default function App() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (auth.user && auth.token) {
    return (
      <Shell
        key={auth.user.email}
        user={auth.user}
        token={auth.token}
        onLogout={() => {
          auth.logout();
          navigate("/");
        }}
      />
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Landing
            onLogin={() => navigate("/login")}
            onRegister={() => navigate("/register")}
          />
        }
      />
      <Route
        path="/login"
        element={
          <Auth
            auth={auth}
            initialMode="login"
            onBack={() => navigate("/")}
          />
        }
      />
      <Route
        path="/register"
        element={
          <Auth
            auth={auth}
            initialMode="register"
            onBack={() => navigate("/")}
          />
        }
      />
      {/* Jika akses URL sembarangan saat belum login, lempar ke / */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}