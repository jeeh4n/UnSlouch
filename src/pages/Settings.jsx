import Icon from "../components/Icon";
import { playBeep } from "../lib/utils";

export default function Settings({ settings, update }) {
  return (
    <section className="page-content">
      <div className="page-head">
        <div>
          <h1>Pengaturan peringatan</h1>
          <p>Atur kapan dan bagaimana kamu diingatkan saat postur buruk.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="card setting-card">
          <div className="setting-row">
            <div>
              <h3>Peringatan suara</h3>
              <p>Bunyikan alarm saat postur buruk terdeteksi.</p>
            </div>
            <button role="switch" aria-checked={settings.audio} className={`switch ${settings.audio ? "on" : ""}`} onClick={() => update("audio", !settings.audio)}>
              <span />
            </button>
          </div>
          <button className="btn btn-ghost" onClick={playBeep}>
            <Icon name="bell" size={16} />
            Coba bunyi alarm
          </button>
        </div>

        <div className="card setting-card">
          <div className="setting-row">
            <div>
              <h3>Jeda sebelum alarm</h3>
              <p>Alarm baru berbunyi jika postur buruk bertahan selama ini. Gerakan sesaat tidak dihitung.</p>
            </div>
            <strong className="setting-value">{settings.dwell} detik</strong>
          </div>
          <input type="range" min="5" max="10" step="1" value={settings.dwell} onChange={(e) => update("dwell", Number(e.target.value))} aria-label="Jeda sebelum alarm" />
          <div className="range-scale">
            <span>5 detik</span>
            <span>10 detik</span>
          </div>
        </div>

        <div className="card setting-card">
          <div className="setting-row">
            <div>
              <h3>Ambang sudut</h3>
              <p>Batas sudut postur. Nilai ini dipakai saat model ML sudah terhubung.</p>
            </div>
            <strong className="setting-value">{settings.threshold}&deg;</strong>
          </div>
          <input type="range" min="30" max="70" step="1" value={settings.threshold} onChange={(e) => update("threshold", Number(e.target.value))} aria-label="Ambang sudut" />
          <div className="range-scale">
            <span>30&deg;</span>
            <span>70&deg;</span>
          </div>
        </div>
      </div>
    </section>
  );
}
