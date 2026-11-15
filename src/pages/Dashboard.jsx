import Icon from "../components/Icon";
import CameraStage from "../components/CameraStage";
import StartStopButton from "../components/StartStopButton";
import { formatTime } from "../lib/utils";

const PIPELINE = [
  { title: "Webcam laptop", text: "Kamera depan menangkap video langsung, tanpa sensor tambahan." },
  { title: "Titik tubuh", text: "MediaPipe membaca telinga, bahu, dan titik virtual tengah dada." },
  { title: "Hitung sudut", text: "Sudut kepala dan punggung dibandingkan dengan ambang postur." },
  { title: "Tunggu 5-10 detik", text: "Peringatan hanya muncul jika postur buruk bertahan terus-menerus." },
  { title: "Bunyi peringatan", text: "Alarm suara mengingatkan kamu untuk menegakkan badan." },
];

export default function Dashboard({ camera, onStart, onSettings }) {
  return (
    <section className="page-content">
      <div className="hero">
        <div className="hero-text">
          <h1>
            Duduk tegak,
            <br />
            kerja lebih nyaman.
          </h1>
          <p>Webcam laptop memantau posisi telinga, bahu, dan dada kamu. Kalau kamu membungkuk atau kepala terlalu maju, kamu langsung diingatkan lewat suara.</p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onStart}>
              Mulai pemantauan
              <Icon name="arrow" size={16} />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={onSettings}>
              Atur peringatan
            </button>
          </div>
        </div>

        <div className="hero-figure" aria-hidden="true">
          <svg viewBox="0 0 220 260" className="posture-figure">
            <line x1="110" y1="52" x2="110" y2="190" className="spine good" />
            <line x1="110" y1="52" x2="168" y2="62" className="spine bad" />
            <circle cx="110" cy="40" r="22" className="head" />
            <circle cx="166" cy="66" r="22" className="head head-bad" />
            <circle cx="110" cy="40" r="5" className="dot" />
            <circle cx="110" cy="100" r="5" className="dot" />
            <circle cx="110" cy="150" r="5" className="dot" />
            <path d="M60 110 L110 100 L160 110" className="shoulder" />
          </svg>
          <span className="tag tag-good">Tegak</span>
          <span className="tag tag-bad">Kepala maju</span>
        </div>
      </div>

      <div className="section-title">
        <h2>Ringkasan sesi</h2>
        <p>Kondisi pemantauan kamu saat ini</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>Status kamera</span>
            <span className="stat-symbol">
              <Icon name="camera" size={18} />
            </span>
          </div>
          <h3>{camera.on ? "Aktif" : "Mati"}</h3>
          <p>{camera.on ? "Kamera sedang berjalan" : "Belum ada kamera aktif"}</p>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span>Postur baik</span>
            <span className="stat-symbol good">
              <Icon name="check" size={18} />
            </span>
          </div>
          <h3>--</h3>
          <p>Menunggu model ML</p>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span>Postur buruk</span>
            <span className="stat-symbol bad">
              <Icon name="alert" size={18} />
            </span>
          </div>
          <h3>--</h3>
          <p>Menunggu model ML</p>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span>Durasi sesi</span>
            <span className="stat-symbol">
              <Icon name="clock" size={18} />
            </span>
          </div>
          <h3 className="time-value">{formatTime(camera.elapsed)}</h3>
          <p>Sesi berjalan</p>
        </div>
      </div>

      <div className="section-title">
        <h2>Pratinjau kamera</h2>
        <p>Tampilan langsung dari webcam</p>
      </div>

      <div className="card">
        <CameraStage camera={camera} title="Pratinjau kamera" hint="Tekan Mulai kamera untuk melihat dirimu di sini." />
        <div className="card-footer">
          <div>
            <h3>{camera.on ? "Menunggu deteksi" : "Belum dimulai"}</h3>
            <p>{camera.on ? "Kamera berjalan. Model ML belum terhubung." : "Mulai sesi untuk mengaktifkan kamera."}</p>
          </div>
          <StartStopButton camera={camera} startLabel="Mulai kamera" stopLabel="Hentikan sesi" />
        </div>
        {camera.error && <div className="error-message">{camera.error}</div>}
      </div>

      <div className="section-title">
        <h2>Cara kerja</h2>
        <p>Dari kamera sampai peringatan suara, semuanya berjalan di CPU laptop</p>
      </div>

      <ol className="pipeline">
        {PIPELINE.map((step, i) => (
          <li key={step.title} className="pipeline-step">
            <span className="pipeline-num">{i + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
