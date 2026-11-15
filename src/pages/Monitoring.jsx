import CameraStage from "../components/CameraStage";
import StartStopButton from "../components/StartStopButton";
import { formatTime } from "../lib/utils";

export default function Monitoring({ camera, settings, posture }) {
  const status = !camera.on ? "Belum ada deteksi" : posture === "good" ? "Postur baik" : posture === "bad" ? "Postur buruk" : "Menunggu model ML";

  return (
    <section className="page-content">
      <div className="page-head">
        <div>
          <h1>Live monitoring</h1>
          <p>Pantau posisi dudukmu selama bekerja. Biarkan tab ini tetap terbuka.</p>
        </div>
        <StartStopButton camera={camera} startLabel="Mulai pemantauan" stopLabel="Hentikan" />
      </div>

      <div className="live-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Kamera</h2>
              <p>Webcam depan laptop</p>
            </div>
            <span className={`pill ${camera.on ? "pill-on" : ""}`}><i />{camera.on ? "Live" : "Offline"}</span>
          </div>
          <CameraStage camera={camera} title="Kamera belum aktif" hint="Mulai pemantauan untuk membuka kamera." />
          {camera.error && <div className="error-message">{camera.error}</div>}
        </div>

        <aside className="live-side">
          <div className="side-card">
            <span className="side-label">Durasi sesi</span>
            <h3 className="big-time">{formatTime(camera.elapsed)}</h3>
          </div>
          <div className="side-card">
            <span className="side-label">Klasifikasi postur</span>
            <h3>{status}</h3>
            <p>Hasil postur baik atau buruk akan tampil di sini.</p>
          </div>
          <div className="side-card">
            <span className="side-label">Peringatan</span>
            <ul className="mini-list">
              <li><span>Suara</span><strong>{settings.audio ? "Aktif" : "Mati"}</strong></li>
              <li><span>Jeda sebelum alarm</span><strong>{settings.dwell} detik</strong></li>
              <li><span>Ambang sudut</span><strong>{settings.threshold}&deg;</strong></li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
