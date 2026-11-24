import Icon from "../components/Icon";
import { formatTime } from "../lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Dashboard({ user, sessions = [], alertHistory = [], onStart, onHistory }) {
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const averageDuration = sessions.length ? Math.round(totalDuration / sessions.length) : 0;
  
  const recentAlerts = [...alertHistory].slice(0, 5);

  const trendData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateLabel = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    
    const count = alertHistory.filter(a => {
      const alertDate = new Date(a.waktu.replace(" ", "T"));
      return alertDate.getDate() === d.getDate() && alertDate.getMonth() === d.getMonth();
    }).length;
    
    return { tanggal: dateLabel, "Jumlah Postur Buruk": count };
  });

  const namaPanggilan = user?.email ? user.email.split("@")[0] : "Pengguna";

  return (
    <section className="page-content">
      {/* BANNER HERO */}
      <div style={{ 
        backgroundColor: "var(--brand)", color: "white", borderRadius: "var(--r-lg)", padding: "2rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", boxShadow: "var(--shadow)", backgroundImage: "linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-50%", right: "-5%", width: "300px", height: "300px", borderRadius: "50%", border: "40px solid var(--accent)", opacity: 0.1, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ textTransform: "capitalize", fontSize: "2rem", marginBottom: "0.5rem", color: "white" }}>Halo, {namaPanggilan}!</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.05rem", margin: 0 }}>Mari jaga kesehatan punggung dan postur tubuhmu hari ini.</p>
        </div>
        <button className="btn" onClick={onStart} style={{ backgroundColor: "var(--accent)", color: "var(--brand-dark)", padding: "0.8rem 1.5rem", fontSize: "1rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem", position: "relative", zIndex: 1, boxShadow: "0 4px 14px rgba(184, 147, 78, 0.4)", border: "none", cursor: "pointer" }}>
          <Icon name="camera" size={18} /> Mulai Pemantauan
        </button>
      </div>

      {/* STATISTIK UTAMA */}
      <div className="stats-grid three" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card" style={{ backgroundColor: "var(--card)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--line)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: "-30px", right: "-20px", width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "var(--bad)", opacity: 0.4, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "30px", right: "50px", width: "60px", height: "60px", borderRadius: "50%", border: "4px solid var(--bad)", opacity: 0.3, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="stat-top">
              <span style={{ color: "var(--ink-soft)" }}>Total Pelanggaran</span>
              <span className="stat-symbol" style={{ backgroundColor: "var(--bad)", color: "var(--bad-ink)" }}><Icon name="alert" size={18} /></span>
            </div>
            <h3 style={{ color: "var(--ink)" }}>{alertHistory.length} <span style={{ fontSize: "20px", fontWeight: "revert", color: "var(--ink-soft)" }}>kali postur buruk</span></h3>
            <p style={{ color: "var(--ink-soft)", margin: 0 }}>Tercatat dari sesi-sesi sebelumnya</p>
          </div>
        </div>

        <div className="stat-card" style={{ backgroundColor: "var(--card)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--line)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-20px", right: "-30px", width: "140px", height: "140px", borderRadius: "50%", backgroundColor: "var(--brand-tint)", opacity: 0.5, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "20px", right: "70px", width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--brand-tint)", opacity: 0.4, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="stat-top">
              <span style={{ color: "var(--ink-soft)" }}>Total Waktu Pantau</span>
              <span className="stat-symbol" style={{ backgroundColor: "var(--brand)", color: "white" }}><Icon name="clock" size={18} /></span>
            </div>
            <h3 className="time-value" style={{ color: "var(--ink)" }}>{formatTime(totalDuration)}</h3>
            <p style={{ color: "var(--ink-soft)", margin: 0 }}>Berdasarkan {sessions.length} sesi</p>
          </div>
        </div>

        <div className="stat-card" style={{ backgroundColor: "var(--card)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--line)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: "-40px", right: "-10px", width: "150px", height: "150px", borderRadius: "50%", backgroundColor: "var(--good)", opacity: 0.5, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "40px", right: "80px", width: "30px", height: "30px", borderRadius: "50%", border: "3px solid var(--good)", opacity: 0.6, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="stat-top">
              <span style={{ color: "var(--ink-soft)" }}>Rata-rata per Sesi</span>
              <span className="stat-symbol" style={{ backgroundColor: "var(--good)", color: "var(--good-ink)" }}><Icon name="check" size={18} /></span>
            </div>
            <h3 className="time-value" style={{ color: "var(--ink)" }}>{formatTime(averageDuration)}</h3>
            <p style={{ color: "var(--ink-soft)", margin: 0 }}>Waktu bertahan di setiap sesi</p>
          </div>
        </div>
      </div>

      {/* AREA GRAFIK BAR */}
      <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem", border: "1px solid var(--line)" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", margin: "0 0 0.5rem 0" }}>Tren Pelanggaran (7 Hari Terakhir)</h2>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--ink-soft)" }}>Seberapa sering kamu berada dalam postur buruk seminggu terakhir</p>
        </div>
        <div style={{ width: "100%", height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--line)" />
              <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "var(--ink-soft)" }} dy={10} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: "var(--ink-soft)" }} width={40} />
              <Tooltip cursor={{ fill: "var(--brand-tint)" }} contentStyle={{ borderRadius: "var(--r-sm)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }} />
              <Bar dataKey="Jumlah Postur Buruk" fill="var(--brand)" radius={[4, 4, 0, 0]} barSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}