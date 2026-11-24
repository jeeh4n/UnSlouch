import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatTime } from "../lib/utils";

const PER_PAGE = 5;
const dateFmt = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
const timeFmt = { hour: "2-digit", minute: "2-digit" };
const GRACE = 5000; // toleransi (ms) setelah sesi berakhir untuk mencocokkan peringatan

// Ikon SVG lokal, tidak bergantung pada Icon.jsx
const ICONS = {
  clock: "M12 7v5l3 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0",
  history: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2",
  alert: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
  check: "M20 6 9 17l-5-5",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  layers: "m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5",
  trash: "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  left: "m15 18-6-6 6-6",
  right: "m9 18 6-6-6-6",
  arrow: "M5 12h14M12 5l7 7-7 7",
};

const Ico = ({ n, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <path d={ICONS[n]} />
  </svg>
);

// "2026-11-17 14:39:40" -> "Sel, 17 Nov 2026 – 14.39.40"
const fmtAlert = (waktu) => {
  const d = new Date(String(waktu).replace(" ", "T"));
  if (isNaN(d)) return waktu;
  const t = d.toLocaleTimeString("id-ID", { ...timeFmt, second: "2-digit" });
  return `${d.toLocaleDateString("id-ID", dateFmt)} – ${t}`;
};

/* Dekorasi kartu statistik */
const Bars = ({ data }) => {
  const max = Math.max(...data, 1);
  return (
    <svg width={data.length * 14} height="60" aria-hidden="true" fill="var(--brand)">
      {data.map((d, i) => {
        const h = Math.max(8, (d / max) * 56);
        return <rect key={i} x={i * 14} y={60 - h} width="9" height={h} rx="4.5" opacity={i === data.length - 1 ? 0.9 : 0.25} />;
      })}
    </svg>
  );
};

const Rings = () => (
  <svg width="90" height="90" viewBox="0 0 96 96" fill="none" stroke="var(--brand)" strokeWidth="6" strokeLinecap="round" aria-hidden="true">
    <circle cx="48" cy="48" r="42" strokeOpacity=".12" />
    <circle cx="48" cy="48" r="42" strokeOpacity=".5" strokeDasharray="150 264" transform="rotate(-90 48 48)" />
    <circle cx="48" cy="48" r="28" strokeOpacity=".12" />
    <circle cx="48" cy="48" r="28" strokeOpacity=".35" strokeDasharray="95 176" transform="rotate(-90 48 48)" />
    <path d="M48 40v8l6 4" strokeWidth="2.5" />
  </svg>
);

const Spark = ({ data }) => {
  const [W, H, P] = [130, 60, 6];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const r = max - min || 1;
  const y = (d) => H - P - ((d - min) / r) * (H - 2 * P);
  const x = (i) => P + (i / Math.max(data.length - 1, 1)) * (W - 2 * P);
  const pts = data.map((d, i) => `${x(i)},${y(d)}`).join(" ");
  const avg = y(data.reduce((a, b) => a + b, 0) / data.length);
  const last = data.length - 1;
  return (
    <svg width={W} height={H} fill="none" stroke="var(--brand)" strokeWidth="2.5" aria-hidden="true">
      <polygon points={`${P},${H} ${pts} ${W - P},${H}`} fill="var(--brand)" opacity=".1" stroke="none" />
      <line x1="0" x2={W} y1={avg} y2={avg} strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="4 4" />
      <polyline points={pts} />
      <circle cx={x(last)} cy={y(data[last])} r="4" fill="var(--card)" />
    </svg>
  );
};

const Stat = ({ icon, label, value, note, children }) => (
  <div className="hx-card hx-stat">
    <div>
      <span className="hx-stat-label"><Ico n={icon} /> {label}</span>
      <h3>{value}</h3>
      <p>{note}</p>
    </div>
    {children}
  </div>
);

export default function History({ sessions, alertHistory = [], onDelete, onDeleteAlerts, onClear, onStart }) {
  const [tab, setTab] = useState("alert");
  const [ask, setAsk] = useState(null); // data pop-up konfirmasi
  const [page, setPage] = useState(0);

  const total = sessions.reduce((sum, s) => sum + s.duration, 0);
  const average = sessions.length ? Math.round(total / sessions.length) : 0;
  const recent = sessions.slice(0, 10).map((s) => s.duration).reverse();

  const isAlert = tab === "alert";
  const items = isAlert ? alertHistory : sessions;
  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const cur = Math.min(page, pages - 1); // otomatis mundur kalau data dihapus
  const from = cur * PER_PAGE;

  const switchTab = (t) => { setTab(t); setPage(0); };

  // peringatan yang terjadi selama sebuah sesi berjalan
  const alertsOf = (s) => {
    const from = new Date(s.startedAt).getTime();
    const to = from + s.duration * 1000 + GRACE;
    return alertHistory.filter((a) => {
      const t = new Date(String(a.waktu).replace(" ", "T")).getTime();
      return t >= from && t <= to;
    });
  };

  const askDeleteSession = (s) => {
    const related = alertsOf(s);
    setAsk({
      title: "Hapus sesi ini?",
      text: related.length
        ? `Sesi ini beserta ${related.length} peringatan di dalamnya akan dihapus permanen.`
        : "Sesi ini akan dihapus permanen.",
      run: () => {
        onDelete(s.id);
        if (related.length) onDeleteAlerts?.(related.map((a) => a.id));
      },
    });
  };

  const askClearAll = () =>
    setAsk({
      title: "Hapus semua riwayat?",
      text: "Semua sesi dan peringatan akan dihapus permanen dan tidak bisa dikembalikan.",
      label: "Hapus semua",
      run: onClear,
    });

  const renderAlert = (a, i) => (
    <li key={a.id}>
      <span className="session-index">#{alertHistory.length - i}</span>
      <div>
        <strong>{fmtAlert(a.waktu)}</strong>
        <span>{a.pesan}</span>
      </div>
      <span className="session-duration bad">{(a.probabilitas * 100).toFixed(1)}% Bungkuk</span>
    </li>
  );

  const renderSession = (s, i) => {
    const start = new Date(s.startedAt);
    const end = new Date(start.getTime() + s.duration * 1000);
    return (
      <li key={s.id}>
        <span className="session-index">#{sessions.length - i}</span>
        <div>
          <strong>{start.toLocaleDateString("id-ID", dateFmt)}</strong>
          <span>{start.toLocaleTimeString("id-ID", timeFmt)} – {end.toLocaleTimeString("id-ID", timeFmt)}</span>
        </div>
        <span className="session-duration">{formatTime(s.duration)}</span>
        <button className="icon-btn" onClick={() => askDeleteSession(s)} title="Hapus sesi" aria-label="Hapus sesi">
          <Ico n="trash" s={17} />
        </button>
      </li>
    );
  };

  const empty = isAlert
    ? { icon: "check", title: "Belum ada pelanggaran postur", text: "Bagus! Pertahankan postur tegakmu saat bekerja." }
    : { icon: "history", title: "Belum ada sesi tersimpan", text: "Selesaikan satu sesi pemantauan dan riwayatnya akan muncul di sini." };

  const head = isAlert
    ? { title: "Riwayat Peringatan Postur", text: "Saat model AI mendeteksi postur buruk" }
    : { title: "Log Sesi Kamera", text: "Sesi pemantauan yang sudah selesai" };

  return (
    <section className="page-content">
      <div className="hx-card hx-head">
        <div>
          <h1>Riwayat Sesi</h1>
          <p>Lihat kembali sesi pemantauan dan peringatan postur burukmu.</p>
        </div>
        {(sessions.length > 0 || alertHistory.length > 0) && (
          <button className="btn btn-delete" onClick={askClearAll}>
            <Ico n="trash" /> Hapus semua
          </button>
        )}
      </div>

      {sessions.length > 0 && (
        <div className="hx-stats">
          <Stat icon="layers" label="Total sesi" value={sessions.length} note="sesi tersimpan">
            <Bars data={recent} />
          </Stat>
          <Stat icon="clock" label="Total waktu" value={formatTime(total)} note="seluruh pemantauan">
            <Rings />
          </Stat>
          <Stat icon="activity" label="Rata-rata" value={formatTime(average)} note="waktu rata-rata per sesi">
            <Spark data={recent} />
          </Stat>
        </div>
      )}

      <div className="hx-tabs">
        {[["alert", "Peringatan Postur", alertHistory.length], ["session", "Log Sesi Kamera", sessions.length]].map(([k, label, n]) => (
          <button key={k} className={`hx-tab ${tab === k ? "active" : ""}`} onClick={() => switchTab(k)}>
            {label} <b>{n}</b>
          </button>
        ))}
      </div>

      <div className="card hx-card">
        <div className="card-head">
          <div>
            <h2>{head.title}</h2>
            <p>{head.text}</p>
          </div>
        </div>
        <div className="hx-list">
          {items.length === 0 ? (
            <div className="history-empty">
              <div className="history-icon"><Ico n={empty.icon} s={28} /></div>
              <h3>{empty.title}</h3>
              <p>{empty.text}</p>
              {!isAlert && (
                <button className="btn btn-primary" onClick={onStart}>
                  Mulai pemantauan <Ico n="arrow" s={15} />
                </button>
              )}
            </div>
          ) : (
            <ul className="session-list">
              {items.slice(from, from + PER_PAGE).map((it, i) => (isAlert ? renderAlert(it, from + i) : renderSession(it, from + i)))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="hx-pager">
            <span>{from + 1}–{Math.min(from + PER_PAGE, items.length)} dari {items.length}</span>
            <div>
              <button onClick={() => setPage(cur - 1)} disabled={cur === 0} aria-label="Halaman sebelumnya">
                <Ico n="left" />
              </button>
              <strong>{cur + 1} / {pages}</strong>
              <button onClick={() => setPage(cur + 1)} disabled={cur >= pages - 1} aria-label="Halaman berikutnya">
                <Ico n="right" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!ask}
        title={ask?.title}
        text={ask?.text}
        confirmLabel={ask?.label}
        onCancel={() => setAsk(null)}
        onConfirm={() => {
          ask.run();
          setAsk(null);
        }}
      />
    </section>
  );
}