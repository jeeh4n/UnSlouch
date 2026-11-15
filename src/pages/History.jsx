import Icon from "../components/Icon";
import { formatTime } from "../lib/utils";

const dateFmt = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
const timeFmt = { hour: "2-digit", minute: "2-digit" };

export default function History({ sessions, onDelete, onClear, onStart }) {
  const total = sessions.reduce((sum, s) => sum + s.duration, 0);
  const average = sessions.length ? Math.round(total / sessions.length) : 0;

  const clearAll = () => {
    if (window.confirm("Hapus semua riwayat sesi?")) onClear();
  };

  return (
    <section className="page-content">
      <div className="page-head">
        <div>
          <h1>Riwayat sesi</h1>
          <p>Daftar sesi pemantauan yang sudah kamu selesaikan.</p>
        </div>
        {sessions.length > 0 && (
          <button className="btn btn-ghost" onClick={clearAll}>
            Hapus semua
          </button>
        )}
      </div>

      {sessions.length > 0 && (
        <div className="stats-grid three">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total sesi</span>
            </div>
            <h3>{sessions.length}</h3>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <span>Total waktu</span>
            </div>
            <h3 className="time-value">{formatTime(total)}</h3>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <span>Rata-rata per sesi</span>
            </div>
            <h3 className="time-value">{formatTime(average)}</h3>
          </div>
        </div>
      )}

      <div className="card">
        {sessions.length === 0 ? (
          <div className="history-empty">
            <div className="history-icon">
              <Icon name="history" size={28} />
            </div>
            <h3>Belum ada sesi tersimpan</h3>
            <p>Selesaikan satu sesi pemantauan dan riwayatnya akan muncul di sini.</p>
            <button className="btn btn-primary" onClick={onStart}>
              Mulai pemantauan
              <Icon name="arrow" size={15} />
            </button>
          </div>
        ) : (
          <ul className="session-list">
            {sessions.map((s, i) => {
              const start = new Date(s.startedAt);
              const end = new Date(start.getTime() + s.duration * 1000);
              return (
                <li key={s.id}>
                  <span className="session-index">#{sessions.length - i}</span>
                  <div>
                    <strong>{start.toLocaleDateString("id-ID", dateFmt)}</strong>
                    <span>
                      {start.toLocaleTimeString("id-ID", timeFmt)} - {end.toLocaleTimeString("id-ID", timeFmt)}
                    </span>
                  </div>
                  <span className="session-duration">{formatTime(s.duration)}</span>
                  <button className="icon-btn" onClick={() => onDelete(s.id)} title="Hapus sesi" aria-label="Hapus sesi">
                    <Icon name="trash" size={17} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
