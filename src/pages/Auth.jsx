import { useState } from "react";
import Logo from "../components/Logo";

const POINTS = ["Cukup webcam laptop, tanpa sensor tambahan", "Berjalan di CPU, tidak perlu GPU", "Alarm hanya bunyi kalau postur buruk bertahan lama"];

export default function Auth({ auth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      if (form.name.trim().length < 2) return setError("Nama minimal 2 karakter.");
      if (form.password.length < 6) return setError("Kata sandi minimal 6 karakter.");
      if (form.password !== form.confirm) return setError("Konfirmasi kata sandi tidak sama.");
    }
    setBusy(true);
    try {
      const message = isRegister ? await auth.register(form) : await auth.login(form);
      if (message) setError(message);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-side">
        <div className="brand">
          <div className="brand-mark">
            <Logo />
          </div>
          <div>
            <h2>PostureGuard</h2>
          </div>
        </div>
        <div>
          <h1>Duduk tegak, kerja lebih nyaman.</h1>
          <ul className="auth-points">
            {POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <span className="auth-foot">Kelompok 11</span>
        <svg viewBox="0 0 220 260" className="posture-figure auth-art" aria-hidden="true">
          <line x1="110" y1="52" x2="110" y2="190" className="spine good" />
          <circle cx="110" cy="40" r="22" className="head" />
          <circle cx="110" cy="100" r="5" className="dot" />
          <circle cx="110" cy="150" r="5" className="dot" />
          <path d="M60 110 L110 100 L160 110" className="shoulder" />
        </svg>
      </section>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-tabs" role="tablist">
            <button role="tab" aria-selected={!isRegister} className={!isRegister ? "active" : ""} onClick={() => switchMode("login")}>
              Masuk
            </button>
            <button role="tab" aria-selected={isRegister} className={isRegister ? "active" : ""} onClick={() => switchMode("register")}>
              Daftar
            </button>
          </div>

          <h2>{isRegister ? "Buat akun baru" : "Selamat datang kembali"}</h2>
          <p className="sub">{isRegister ? "Isi data di bawah untuk mulai memantau postur." : "Masuk untuk melihat riwayat dan pengaturanmu."}</p>

          <form onSubmit={submit} noValidate>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            {isRegister && (
              <label className="field">
                <span>Nama</span>
                <input type="text" value={form.name} onChange={set("name")} autoComplete="name" required />
              </label>
            )}
            <label className="field">
              <span>Email</span>
              <input type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
            </label>
            <label className="field">
              <span>Kata sandi</span>
              <input type="password" value={form.password} onChange={set("password")} autoComplete={isRegister ? "new-password" : "current-password"} required />
            </label>
            {isRegister && (
              <label className="field">
                <span>Ulangi kata sandi</span>
                <input type="password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" required />
              </label>
            )}
            <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
              {busy ? "Memproses..." : isRegister ? "Daftar" : "Masuk"}
            </button>
          </form>
          <p className="auth-note">Data akun disimpan di browser ini saja.</p>
        </div>
      </main>
    </div>
  );
}
