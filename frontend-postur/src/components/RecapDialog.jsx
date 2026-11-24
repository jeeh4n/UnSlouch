import { useEffect } from "react";
import { formatTime } from "../lib/utils";

export default function RecapDialog({ recap, onClose }) {
  useEffect(() => {
    if (!recap) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [recap, onClose]);

  if (!recap) return null;

  const tracked = recap.good + recap.bad;
  const pct = tracked ? Math.round((recap.good / tracked) * 100) : null;
  const note =
    pct === null
      ? "Belum ada data postur yang terdeteksi."
      : pct >= 80
      ? "Postur kamu terjaga dengan baik."
      : pct >= 50
      ? "Lumayan, masih bisa lebih tegak."
      : "Kamu cukup sering bungkuk, coba atur ulang posisi dudukmu.";

  const items = [
    ["Total durasi", formatTime(recap.elapsed), "var(--ink)"],
    ["Postur baik", pct === null ? "-" : `${pct}%`, "var(--good-ink)"],
    ["Waktu bungkuk", formatTime(recap.bad), recap.bad > 0 ? "var(--bad-ink)" : "var(--ink)"],
    ["Peringatan", `${recap.warnings} kali`, recap.warnings > 0 ? "var(--bad-ink)" : "var(--ink)"],
  ];

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recap-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="dialog-close" onClick={onClose} aria-label="Tutup">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="dialog-icon info">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 id="recap-title">Sesi selesai</h3>
        <p>{note}</p>

        <div className="recap-grid">
          {items.map(([label, value, color]) => (
            <div className="recap-item" key={label}>
              <span>{label}</span>
              <strong style={{ color }}>{value}</strong>
            </div>
          ))}
        </div>

        <div className="dialog-actions">
          <button className="btn btn-primary" onClick={onClose} autoFocus>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}