import { useEffect, useRef, useState } from "react";
import CameraStage from "../components/CameraStage";
import StartStopButton from "../components/StartStopButton";
import Icon from "../components/Icon";
import RecapDialog from "../components/RecapDialog";
import { formatTime } from "../lib/utils";

const LOCAL_ICONS = {
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  settings: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="9" cy="6" r="2" fill="var(--card, #fff)" />
      <circle cx="15" cy="12" r="2" fill="var(--card, #fff)" />
      <circle cx="8" cy="18" r="2" fill="var(--card, #fff)" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
};

const IconBox = ({ name, size = 16 }) => (
  <span
    style={{
      width: size,
      height: size,
      flexShrink: 0,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      lineHeight: 0,
    }}
  >
    {LOCAL_ICONS[name] ? (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {LOCAL_ICONS[name]}
      </svg>
    ) : (
      <Icon name={name} size={size} />
    )}
  </span>
);

// Style label kartu sidebar (dipakai 3x)
const sideLabelStyle = {
  color: "var(--brand)",
  fontSize: "0.9rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "8px",
  marginBottom: "1rem",
  textAlign: "left",
};

export default function Monitoring({ camera, settings, posture, landmarks = null, stretchAlert = false }) {
  const [sessionWarnings, setSessionWarnings] = useState(0);

  // --- Rekap sesi: muncul sebagai pop-up saat kamera dimatikan; angka di halaman dibekukan sampai pop-up ditutup ---
  const [recap, setRecap] = useState(null);
  const wasOn = useRef(false);
  const lastElapsed = useRef(0);
  const warningsRef = useRef(0);
  const postureRef = useRef(posture);
  const stats = useRef({ good: 0, bad: 0 });

  warningsRef.current = sessionWarnings;
  postureRef.current = posture;

  useEffect(() => {
    if (camera.on) lastElapsed.current = camera.elapsed;
  }, [camera.on, camera.elapsed]);

  // hitung detik postur baik / buruk selama sesi berjalan
  useEffect(() => {
    if (!camera.on) return;
    stats.current = { good: 0, bad: 0 };
    const t = setInterval(() => {
      if (postureRef.current === "good") stats.current.good++;
      else if (postureRef.current === "bad") stats.current.bad++;
    }, 1000);
    return () => clearInterval(t);
  }, [camera.on]);

  useEffect(() => {
    if (camera.on) {
      wasOn.current = true;
      setRecap(null);
      setSessionWarnings(0);
    } else if (wasOn.current) {
      wasOn.current = false;
      const elapsed = camera.elapsed || lastElapsed.current;
      if (elapsed >= 1) setRecap({ elapsed, warnings: warningsRef.current, ...stats.current });
    }
  }, [camera.on]);

  useEffect(() => {
    let timeout;
    if (camera.on && posture === "bad") {
      timeout = setTimeout(() => {
        setSessionWarnings((prev) => prev + 1);
      }, settings.dwell * 1000);
    }
    return () => clearTimeout(timeout);
  }, [camera.on, posture, settings.dwell]);

  const status = !camera.on
    ? "Belum ada deteksi"
    : posture === "good"
    ? "Postur Baik"
    : posture === "bad"
    ? "Postur Buruk!"
    : "Menganalisis...";

  let statusColor = "var(--ink)";
  let statusBg = "var(--brand-tint)";
  let statusIcon = "activity";

  if (camera.on) {
    if (posture === "good") {
      statusColor = "var(--good-ink)";
      statusBg = "var(--good)";
      statusIcon = "check";
    } else if (posture === "bad") {
      statusColor = "var(--bad-ink)";
      statusBg = "var(--bad)";
      statusIcon = "alert";
    }
  }

  const shownWarnings = camera.on ? sessionWarnings : recap?.warnings ?? 0;

  return (
    <section className="page-content">
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "1.25rem",
          padding: "1.5rem 2rem",
          backgroundColor: "var(--card)",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--line)",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "0.4rem",
            }}
          >
            <h1 style={{ color: "var(--brand)", margin: 0, fontSize: "2rem" }}>
              Live Monitoring
            </h1>

          </div>
          <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "1.05rem" }}>
            Pantau posisi dudukmu secara aktual selama di depan layar.
          </p>
        </div>
        <StartStopButton
          camera={camera}
          startLabel="Mulai pemantauan"
          stopLabel="Hentikan"
        />
      </div>

      <div className="live-grid">
        {/* AREA KAMERA UTAMA */}
        <div
          className="card"
          style={{
            border: "1px solid var(--line)",
            backgroundColor: "var(--card)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            className="card-head"
            style={{
              borderBottom: "1px solid var(--line)",
              paddingBottom: "1rem",
              textAlign: "left",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.2rem", color: "var(--brand)" }}>Kamera</h2>
              <p style={{ color: "var(--ink-soft)" }}>Webcam depan laptop</p>
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                backgroundColor: camera.on ? "#fee2e2" : "var(--brand-tint)",
                color: camera.on ? "#ef4444" : "var(--ink-soft)",
                border: `1px solid ${
                  camera.on ? "rgba(239, 68, 68, 0.18)" : "var(--line)"
                }`,
              }}
            >
              {camera.on && (
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#ef4444",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              )}
              {camera.on ? "Sedang Live" : "Offline"}
            </span>
          </div>

          {/* Conditional Rendering untuk Error Kamera */}
          {camera.error ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem",
                backgroundColor: "var(--card)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🚫</div>
              <h2 style={{ color: "var(--bad-ink)", marginBottom: "0.5rem", fontSize: "1.5rem", paddingBottom: "0.5rem"}}>
                Akses Kamera Ditolak
              </h2>
              <p style={{ color: "var(--ink-soft)", maxWidth: "450px", lineHeight: "1.5" }}>
                Kami tidak dapat mengakses kamera Anda. Fitur pemantauan postur membutuhkan akses webcam agar bisa berjalan. Silakan izinkan akses kamera pada pengaturan browser Anda dan coba lagi.
              </p>
            </div>
          ) : (
            <CameraStage
              camera={camera}
              posture={posture}
              landmarks={landmarks}
              dwell={settings.dwell}
              stretchAlert={stretchAlert}
              title="Kamera belum aktif"
              hint="Tekan tombol di atas untuk memulai."
            />
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="live-side">
          {/* Kartu Durasi */}
          <div
            className="side-card"
            style={{
              border: "1px solid var(--line)",
              backgroundColor: "var(--card)",
              boxShadow: "var(--shadow-sm)",
              position: "relative",
              overflow: "hidden",
              textAlign: "left",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-15px",
                right: "-15px",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "var(--brand-tint)",
                opacity: 0.3,
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1, textAlign: "left" }}>
              <span className="side-label" style={sideLabelStyle}>
                <IconBox name="clock" size={16} /> Durasi Sesi Aktif
              </span>
              <h3
                className="big-time"
                style={{ color: "var(--ink)", fontSize: "2.5rem", margin: 0, textAlign: "left" }}
              >
                {formatTime(camera.on ? camera.elapsed : recap?.elapsed ?? 0)}
              </h3>
            </div>
          </div>

          {/* Kartu Status Postur */}
          <div
            className="side-card"
            style={{
              border: "1px solid var(--line)",
              backgroundColor: "var(--card)",
              boxShadow: "var(--shadow-sm)",
              position: "relative",
              overflow: "hidden",
              textAlign: "left",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "-20px",
                right: "-20px",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                backgroundColor: statusBg,
                opacity: 0.5,
                pointerEvents: "none",
                transition: "background 0.3s",
              }}
            />

            <div style={{ position: "relative", zIndex: 1, textAlign: "left" }}>
              <span className="side-label" style={sideLabelStyle}>
                <IconBox name="activity" size={16} /> Klasifikasi Postur
              </span>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: statusBg,
                    color: statusColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s",
                    flexShrink: 0,
                  }}
                >
                  <IconBox name={statusIcon} size={20} />
                </div>
                <h3
                  style={{
                    margin: 0,
                    color: statusColor,
                    fontSize: "1.4rem",
                    textAlign: "left",
                    transition: "color 0.3s",
                  }}
                >
                  {status}
                </h3>
              </div>

              <p
                style={{
                  margin: 0,
                  color: "var(--ink-soft)",
                  fontSize: "0.9rem",
                  textAlign: "left",
                }}
              >
                Hasil deteksi otomatis oleh model AI.
              </p>
            </div>
          </div>

          {/* Kartu Detail Pemantauan */}
          <div
            className="side-card"
            style={{
              border: "1px solid var(--line)",
              backgroundColor: "var(--card)",
              boxShadow: "var(--shadow-sm)",
              textAlign: "left",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <span className="side-label" style={sideLabelStyle}>
                <IconBox name="settings" size={16} /> Detail Pemantauan
              </span>
              <ul className="mini-list" style={{ color: "var(--ink)", textAlign: "left" }}>
                <li style={{ borderTopColor: "var(--line)" }}>
                  <span style={{ color: "var(--ink-soft)" }}>Peringatan Suara</span>
                  <strong
                    style={{
                      color: settings.audio ? "var(--good-ink)" : "var(--bad-ink)",
                    }}
                  >
                    {settings.audio ? "Aktif" : "Mati"}
                  </strong>
                </li>
                <li style={{ borderTopColor: "var(--line)" }}>
                  <span style={{ color: "var(--ink-soft)" }}>Jeda Bungkuk</span>
                  <strong>{settings.dwell} detik</strong>
                </li>
                <li style={{ borderTopColor: "var(--line)" }}>
                  <span style={{ color: "var(--ink-soft)" }}>Pengingat Peregangan</span>
                  <strong style={{ color: settings.stretch ? "var(--good-ink)" : "var(--bad-ink)" }}>
                    {settings.stretch ? `Tiap ${settings.stretchEvery || 30} menit` : "Mati"}
                  </strong>
                </li>
                <li style={{ borderTopColor: "var(--line)", alignItems: "center" }}>
                  <span style={{ color: "var(--ink-soft)" }}>Peringatan Sesi Ini</span>
                  <strong
                    style={{
                      color: shownWarnings > 0 ? "var(--bad-ink)" : "var(--ink)",
                      backgroundColor:
                        shownWarnings > 0 ? "#fee2e2" : "var(--brand-tint)",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "0.85rem",
                      transition: "all 0.3s",
                    }}
                  >
                    {shownWarnings} kali
                  </strong>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <RecapDialog recap={recap} onClose={() => setRecap(null)} />
    </section>
  );
}