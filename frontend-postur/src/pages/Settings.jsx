import Icon from "../components/Icon";
import { playBeep } from "../lib/utils";

export default function Settings({ settings, update }) {
  const currentAlarm = settings.alarmType || 1;
  const currentStretch = settings.stretch || false;
  const currentStretchInterval = settings.stretchEvery || 30;

  const cardStyle = {
    border: "1px solid var(--line)",
    backgroundColor: "var(--card)",
    boxShadow: "var(--shadow-sm)",
    borderRadius: "var(--r-lg)",
    padding: "1.5rem 1.8rem",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
    alignSelf: "start" 
  };

  return (
    <section className="page-content">
      {/* HEADER KARTU */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        flexWrap: "wrap",
        gap: "20px",
        marginBottom: "1.5rem",
        padding: "1.5rem 2rem",
        backgroundColor: "var(--card)",
        borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--line)",
        width: "100%" // Pastikan membentang penuh
      }}>
        <div style={{ textAlign: "left" }}>
          <h1 style={{ fontSize: "2rem", color: "var(--brand)", margin: "0 0 0.4rem 0" }}>Pengaturan</h1>
          <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "1.05rem" }}>
            Atur kapan dan bagaimana sistem memperingatkan posturmu.
          </p>
        </div>
      </div>

      {/* GRID DENGAN LEBAR PENUH & MAKSIMAL 2 KOLOM */}
      <div style={{
        display: "grid",
        // Menggunakan minmax 45% agar dalam layar lebar dia membagi 2 kolom merata
        // dan tidak akan pernah muat 3 kolom di satu baris.
        gridTemplateColumns: "repeat(auto-fit, minmax(45%, 1fr))",
        gap: "1.5rem",
        width: "100%", // Menjamin rata ke ujung kanan layar
        alignItems: "start" 
      }}>
        
        {/* KARTU 1: Peringatan Suara */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "6px", color: "var(--brand)" }}>Peringatan Suara</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)", margin: 0, lineHeight: 1.5 }}>
                Bunyikan alarm saat kamu membungkuk melewati batas waktu.
              </p>
            </div>
            <button role="switch" aria-checked={settings.audio} className={`switch ${settings.audio ? "on" : ""}`} onClick={() => update("audio", !settings.audio)}>
              <span />
            </button>
          </div>

          <div style={{ 
            borderTop: "1px solid var(--line)", 
            paddingTop: "1.2rem", 
            opacity: settings.audio ? 1 : 0.5, 
            pointerEvents: settings.audio ? "auto" : "none",
            transition: "opacity 0.3s"
          }}>
            <h4 style={{ fontSize: "0.95rem", marginBottom: "12px", color: "var(--ink)" }}>Pilihan Nada Alarm</h4>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => update("alarmType", num)}
                  style={{
                    flex: "1 1 50px",
                    padding: "8px 0",
                    borderRadius: "8px",
                    border: `1px solid ${currentAlarm === num ? "var(--brand)" : "var(--line)"}`,
                    backgroundColor: currentAlarm === num ? "var(--brand-tint)" : "transparent",
                    color: currentAlarm === num ? "var(--brand)" : "var(--ink-soft)",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Suara {num}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => playBeep(currentAlarm)} 
              style={{ 
                marginTop: "1rem", width: "100%", padding: "10px", 
                backgroundColor: "var(--bg)", border: "1px solid var(--line)", 
                borderRadius: "8px", display: "flex", justifyContent: "center", 
                alignItems: "center", gap: "8px", color: "var(--ink)", 
                fontWeight: "600", fontSize: "0.9rem", cursor: "pointer"
              }}
            >
              <Icon name="bell" size={16} /> Coba bunyi alarm
            </button>
          </div>
        </div>

        {/* KARTU 2: Jeda Toleransi */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "6px", color: "var(--brand)" }}>Jeda Toleransi</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)", margin: 0, lineHeight: 1.5, maxWidth: "240px" }}>
                Alarm tidak akan berbunyi pada pergerakan bungkuk sesaat.
              </p>
            </div>
            <strong style={{ fontSize: "1.4rem", color: "var(--accent)" }}>{settings.dwell} dtk</strong>
          </div>
          
          <div>
            <input 
              type="range" 
              min="5" max="10" step="1" 
              value={settings.dwell} 
              onChange={(e) => update("dwell", Number(e.target.value))} 
              aria-label="Jeda sebelum alarm" 
              style={{ width: "100%" }} 
            />
            <div className="range-scale" style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "0.85rem", color: "var(--ink-soft)" }}>
              <span>Lebih sensitif (5s)</span>
              <span>Lebih santai (10s)</span>
            </div>
          </div>
        </div>

        {/* KARTU 3: Pengingat Peregangan */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "6px", color: "var(--brand)" }}>Peregangan Rutin</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)", margin: 0, lineHeight: 1.5 }}>
                Beri notifikasi berkala agar ototmu tidak kaku karena duduk diam.
              </p>
            </div>
            <button role="switch" aria-checked={currentStretch} className={`switch ${currentStretch ? "on" : ""}`} onClick={() => update("stretch", !currentStretch)}>
              <span />
            </button>
          </div>

          <div style={{ 
            borderTop: "1px solid var(--line)", 
            paddingTop: "1.2rem", 
            opacity: currentStretch ? 1 : 0.5, 
            pointerEvents: currentStretch ? "auto" : "none",
            transition: "opacity 0.3s"
          }}>
            <h4 style={{ fontSize: "0.95rem", marginBottom: "12px", color: "var(--ink)" }}>Ingatkan Saya Setiap:</h4>
            <div style={{ display: "flex", gap: "8px" }}>
              {[15, 30, 45, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => update("stretchEvery", mins)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: "8px",
                    border: `1px solid ${currentStretchInterval === mins ? "var(--good)" : "var(--line)"}`,
                    backgroundColor: currentStretchInterval === mins ? "var(--good)" : "transparent",
                    color: currentStretchInterval === mins ? "var(--good-ink)" : "var(--ink-soft)",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {mins} mnt
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}