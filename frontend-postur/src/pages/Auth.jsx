import { useState } from "react";
import Logo from "../components/Logo"; 

const POINTS = [
  "Cukup webcam laptop, tanpa sensor tambahan",
  "Berjalan di CPU, tidak perlu GPU",
  "Alarm hanya bunyi kalau postur buruk bertahan lama"
];

export default function Auth({ auth, initialMode = "login", onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // State baru untuk notifikasi sukses
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  
  // Tambahkan parameter opsional untuk pesan sukses saat pindah tab
  const switchMode = (next, successMsg = "") => {
    setMode(next);
    setError("");
    setSuccess(successMsg); 
    setForm({ name: "", email: "", password: "", confirm: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(""); // Reset sukses tiap kali submit

    if (form.email.trim().length < 5 || !form.email.includes("@")) return setError("Masukkan email yang valid.");
    if (form.password.length < 6) return setError("Kata sandi minimal 6 karakter.");
    
    if (isRegister) {
      if (form.name.trim().length < 2) return setError("Nama minimal 2 karakter.");
      if (form.password !== form.confirm) return setError("Konfirmasi kata sandi tidak sama.");
    }
    
    setBusy(true);
    try {
      const message = isRegister ? await auth.register(form) : await auth.login(form);
      
      if (message) {
        setError(message);
      } else {
        setError("");
        if (isRegister) {
          // Hanya tampilkan pesan sukses saat REGISTER
          switchMode("login", "Akun berhasil dibuat! Silakan masuk dengan email Anda."); 
        } 
        // Jika LOGIN berhasil, biarkan saja. Sistem akan otomatis memindahkan 
        // pengguna ke Dashboard secara instan.
      }
    } catch {
      setError("Terjadi masalah jaringan. Pastikan backend berjalan.");
    } finally {
      setBusy(false);
    }
  };

  // Gaya umum untuk label dan input form
  const labelStyle = { display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.2rem", textAlign: "left" };
  const spanStyle = { fontSize: "0.9rem", color: "var(--ink)", fontWeight: "600" };
  const inputStyle = { padding: "0.8rem 1rem", borderRadius: "var(--r-sm, 8px)", border: "1px solid var(--line)", backgroundColor: "var(--bg)", color: "var(--ink)", outline: "none", fontSize: "1rem" };

  return (
    <div className="auth-page" style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      
      {/* BAGIAN SAMPING */}
      <section className="auth-side" style={{
        flex: 1,
        backgroundImage: "linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)",
        color: "white",
        padding: "3rem 5rem", 
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Dekorasi lingkaran */}
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "400px", height: "400px", borderRadius: "50%", border: "40px solid var(--accent)", opacity: 0.1, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "250px", height: "250px", borderRadius: "50%", backgroundColor: "var(--brand-tint)", opacity: 0.1, pointerEvents: "none" }} />

        {/* Logo */}
        <div className="brand" style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative", zIndex: 1 }}>
          <div className="brand-mark" style={{ backgroundColor: "white", borderRadius: "8px", padding: "6px" }}>
            <Logo />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.5rem", color: "white" }}>UnSlouch</h2>
          </div>
        </div>

        {/* Konten Utama */}
        <div style={{ position: "relative", zIndex: 1, margin: "auto 0" }}>
          <h1 style={{ fontSize: "2.8rem", lineHeight: 1.2, marginBottom: "1.5rem", color: "white" }}>Duduk tegak, kerja lebih nyaman.</h1>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {POINTS.map((p) => (
              <li key={p} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "1.05rem", color: "rgba(255,255,255,0.9)" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", backgroundColor: "var(--accent)", borderRadius: "50%" }}></span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Teks Kelompok */}
        <span style={{ position: "relative", zIndex: 1, color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>Kelompok 11</span>
      </section>

      {/* BAGIAN UTAMA FORM */}
      <main className="auth-main" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div className="auth-card" style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--shadow-sm)",
          padding: "2.5rem 3rem",
          width: "100%",
          maxWidth: "460px",
          textAlign: "center"
        }}>
          
          {onBack && (
            <button type="button" className="auth-back" onClick={onBack}>
              ← Kembali ke beranda
            </button>
          )}

          {/* TAB LOGIN / REGISTER */}
          <div className="auth-tabs" role="tablist" style={{ 
            display: "flex", 
            marginBottom: "2rem", 
            backgroundColor: "#f1f5f9", 
            borderRadius: "999px", 
            padding: "6px", 
            border: "0.5px solid #d3dde1"
          }}>
            <button 
              role="tab" aria-selected={!isRegister} 
              onClick={() => switchMode("login")}
              style={{ 
                flex: 1, 
                padding: "0.75rem 1rem", 
                backgroundColor: !isRegister ? "white" : "transparent", 
                border: "none", 
                borderRadius: "999px", 
                color: !isRegister ? "var(--brand)" : "#64748b", 
                fontWeight: "600", 
                cursor: "pointer", 
                fontSize: "0.95rem", 
                transition: "all 0.3s ease",
                boxShadow: !isRegister ? "0 2px 5px rgba(0,0,0,0.05)" : "none"
              }}
            >
              Masuk
            </button>
            <button 
              role="tab" aria-selected={isRegister} 
              onClick={() => switchMode("register")}
              style={{ 
                flex: 1, 
                padding: "0.75rem 1rem", 
                backgroundColor: isRegister ? "white" : "transparent", 
                border: "none", 
                borderRadius: "999px", 
                color: isRegister ? "var(--brand)" : "#64748b", 
                fontWeight: "600", 
                cursor: "pointer", 
                fontSize: "0.95rem", 
                transition: "all 0.3s ease",
                boxShadow: isRegister ? "0 2px 5px rgba(0,0,0,0.05)" : "none"
              }}
            >
              Daftar
            </button>
          </div>

          <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.8rem", color: "var(--brand)", margin: "0 0 0.4rem 0" }}>{isRegister ? "Buat akun baru" : "Selamat datang kembali"}</h2>
            <p style={{ color: "var(--ink-soft)", margin: 0, fontSize: "0.95rem" }}>{isRegister ? "Isi data di bawah untuk mulai memantau postur." : "Masuk untuk melihat riwayat dan pengaturanmu."}</p>
          </div>

          <form onSubmit={submit} noValidate>
            
            {/* NOTIFIKASI ERROR (MERAH) */}
            {error && (
              <div role="alert" style={{ backgroundColor: "var(--bad)", color: "var(--bad-ink)", padding: "12px", borderRadius: "8px", marginBottom: "1.5rem", textAlign: "left", fontSize: "0.9rem", fontWeight: "600", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                {error}
              </div>
            )}

            {/* NOTIFIKASI SUKSES (HIJAU) */}
            {success && (
              <div role="alert" style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "1.5rem", textAlign: "left", fontSize: "0.9rem", fontWeight: "600", border: "1px solid #bbf7d0" }}>
                {success}
              </div>
            )}
            
            {isRegister && (
              <label style={labelStyle}>
                <span style={spanStyle}>Nama</span>
                <input type="text" style={inputStyle} value={form.name} onChange={set("name")} autoComplete="name" required />
              </label>
            )}
            
            <label style={labelStyle}>
              <span style={spanStyle}>Email</span>
              <input type="email" style={inputStyle} value={form.email} onChange={set("email")} autoComplete="email" required />
            </label>
            
            <label style={labelStyle}>
              <span style={spanStyle}>Kata sandi</span>
              <input type="password" style={inputStyle} value={form.password} onChange={set("password")} autoComplete={isRegister ? "new-password" : "current-password"} required />
            </label>
            
            {isRegister && (
              <label style={labelStyle}>
                <span style={spanStyle}>Ulangi kata sandi</span>
                <input type="password" style={inputStyle} value={form.confirm} onChange={set("confirm")} autoComplete="new-password" required />
              </label>
            )}
            
            <button type="submit" disabled={busy} style={{ 
              width: "100%", padding: "1rem", backgroundColor: "var(--brand)", color: "white", 
              borderRadius: "var(--r-sm, 8px)", border: "none", fontWeight: "bold", fontSize: "1rem", 
              marginTop: "1rem", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1, transition: "background 0.2s" 
            }}>
              {busy ? "Memproses..." : isRegister ? "Daftar Akun" : "Masuk"}
            </button>
          </form>
          <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--ink-soft)" }}>Data akun disimpan secara aman di browser ini.</p>
        </div>
      </main>
    </div>
  );
}