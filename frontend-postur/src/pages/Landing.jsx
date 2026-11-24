import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import { formatTime } from "../lib/utils";

/* ---------- ikon kecil (SVG lokal) ---------- */
const PATH = {
  check: "M20 6 9 17l-5-5",
  clock: "M12 7v5l3 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  bang: "M12 7v6M12 17h.01",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  win: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM12 12h7v5h-7z",
  pulse: "M22 12h-4l-3 9L9 3l-3 9H2",
  chart: "M3 3v18h18M7 15l4-4 3 3 5-6",
};
const Ico = ({ n, s = 16, w = 2 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w}>
    <path d={PATH[n]} />
  </svg>
);

// "**teks**" -> tebal
const rich = (t) => t.split("**").map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p));

// timer kecil yang berjalan sendiri (supaya halaman tidak ikut render ulang tiap detik)
const Ticker = () => {
  const [s, setS] = useState(1455);
  useEffect(() => {
    const t = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return formatTime(s);
};

/* ---------- isi ---------- */
const NAV = [
  ["cara-kerja", "Cara kerja"],
  ["fitur", "Fitur"],
  ["panduan", "Panduan"],
  ["faq", "Pertanyaan umum"],
];

const STEPS = [
  ["Izinkan akses kamera", "Buka Live Monitoring, tekan Mulai pemantauan, lalu izinkan akses webcam pada peramban."],
  ["Bekerja seperti biasa", "Posisi kepala dan bahu dibaca secara terus-menerus, dan statusnya tampil langsung di layar."],
  ["Terima pengingat", "Jika postur buruk bertahan melewati jeda toleransi, alarm berbunyi dan peringatan dicatat saat Anda kembali tegak."],
];

const FEATURES = [
  ["eye", "Deteksi langsung", "Status postur tampil di layar selama kamera aktif."],
  ["bell", "Alarm dengan jeda toleransi", "Alarm berbunyi setelah postur buruk bertahan 5 hingga 10 detik, dengan 5 pilihan nada."],
  ["win", "Jendela pop-up", "Pantau status dan timer sesi dari tab lain."],
  ["pulse", "Pengingat peregangan", "Opsional, dengan interval 15, 30, 45, atau 60 menit."],
  ["chart", "Rekap dan riwayat", "Ringkasan setiap sesi dan tren tujuh hari terakhir."],
];

const STATES = [
  ["Postur Baik", "Duduk tegak, tidak ada tindakan"],
  ["Menganalisis AI...", "Posisi sedang dibaca"],
  ["Postur Buruk!", "Hitung mundur dimulai"],
];

const GUIDE = [
  {
    label: "Sebelum mulai",
    sub: "Atur kamera dan posisi duduk",
    visual: "diagram",
    steps: [
      ["Posisikan kamera setinggi mata", "Naikkan laptop atau kamera hingga sejajar dengan mata."],
      ["Pastikan telinga dan bahu terlihat", "Sistem membaca titik-titik ini untuk menilai postur."],
      ["Atur jarak dan pencahayaan", "Duduklah sejauh satu lengan dari layar dengan cahaya yang cukup."],
    ],
    tip: "Jika muncul pesan bahu tidak terlihat, **mundur sedikit** atau tambah pencahayaan.",
  },
  {
    label: "Saat memantau",
    sub: "Status dan alarm",
    visual: "pip",
    steps: [
      ["Mulai pemantauan", "Tekan Mulai pemantauan, lalu izinkan akses kamera pada peramban."],
      ["Baca status postur", "Status tampil pada kartu Klasifikasi Postur dan pada bingkai kamera."],
      ["Tegakkan punggung saat alarm", "Alarm berbunyi jika postur buruk melewati jeda toleransi."],
      ["Gunakan jendela pop-up", "Tekan Pop-up pada kamera agar status dan timer tetap terlihat saat berpindah tab."],
    ],
    tip: "Kecepatan alarm dapat diatur pada **Jeda Toleransi**, antara 5 hingga 10 detik.",
  },
  {
    label: "Setelah sesi",
    sub: "Rekap dan riwayat",
    visual: "recap",
    steps: [
      ["Hentikan sesi", "Tekan Hentikan untuk menampilkan rekap durasi dan postur."],
      ["Tinjau riwayat", "Buka Riwayat untuk melihat sesi dan peringatan yang tercatat."],
      ["Sesuaikan pengaturan", "Ubah nada alarm, jeda toleransi, dan pengingat peregangan melalui Pengaturan."],
    ],
    tip: "Menghapus sebuah sesi juga **menghapus peringatan** yang terjadi di dalamnya.",
  },
];

const FAQ = [
  ["Apakah video saya direkam atau disimpan?", "Tidak. Gambar dari webcam hanya digunakan untuk menentukan postur pada saat itu. Data yang tersimpan hanya berupa catatan teks: waktu, durasi, dan skor peringatan."],
  ["Apakah diperlukan kamera khusus atau komputer berspesifikasi tinggi?", "Tidak. Webcam laptop biasa sudah memadai, dan model berjalan pada CPU tanpa GPU."],
  ["Mengapa muncul pesan bahu tidak terlihat?", "Model membaca titik telinga dan bahu. Mundurlah sedikit, naikkan kamera, atau tambahkan pencahayaan hingga keduanya terlihat jelas."],
  ["Mengapa alarm tidak langsung berbunyi saat saya membungkuk?", "Terdapat jeda toleransi (5 hingga 10 detik, dapat diatur) agar gerakan membungkuk sesaat, misalnya saat mengambil barang, tidak dianggap pelanggaran."],
  ["Apakah pengingat peregangan wajib diaktifkan?", "Tidak. Fitur ini bersifat opsional. Aktifkan melalui Pengaturan dan pilih interval 15, 30, 45, atau 60 menit."],
];

/* ---------- visual panduan ---------- */
// ilustrasi posisi kamera dan duduk yang ideal (tampak samping), tidak diubah
const Diagram = () => (
  <div className="lp-diagram">
    <svg viewBox="0 0 270 180" role="img" aria-label="Kamera setinggi mata, telinga sejajar bahu, jarak sekitar satu lengan">
      <rect x="6" y="150" width="258" height="5" rx="2.5" fill="var(--line)" />
      <rect x="150" y="116" width="112" height="6" rx="3" fill="var(--brand)" opacity=".25" />
      <line x1="236" y1="122" x2="236" y2="150" stroke="var(--brand)" strokeWidth="5" opacity=".25" />
      {/* laptop */}
      <rect x="156" y="108" width="52" height="8" rx="3" fill="var(--brand)" />
      <line x1="160" y1="108" x2="152" y2="58" stroke="var(--brand)" strokeWidth="7" strokeLinecap="round" />
      <circle cx="152" cy="58" r="3.5" fill="var(--accent)" />
      {/* orang */}
      <rect x="50" y="146" width="44" height="5" rx="2.5" fill="var(--brand)" opacity=".35" />
      <rect x="60" y="78" width="22" height="48" rx="11" fill="var(--brand)" />
      <line x1="70" y1="126" x2="110" y2="126" stroke="var(--brand)" strokeWidth="12" strokeLinecap="round" />
      <line x1="110" y1="126" x2="110" y2="148" stroke="var(--brand)" strokeWidth="10" strokeLinecap="round" />
      <path d="M71 90 L100 106 L136 112" fill="none" stroke="var(--brand)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="71" cy="58" r="15" fill="var(--good-ink)" />
      <circle cx="67" cy="60" r="3.2" fill="var(--accent-light)" />
      <circle cx="71" cy="87" r="3.2" fill="var(--accent-light)" />
      {/* garis bantu */}
      <line x1="67" y1="30" x2="67" y2="132" stroke="var(--accent)" strokeWidth="1.8" strokeDasharray="4 4" />
      <line x1="71" y1="56" x2="150" y2="56" stroke="var(--accent)" strokeWidth="1.8" strokeDasharray="4 4" />
      <line x1="84" y1="166" x2="152" y2="166" stroke="var(--ink-soft)" strokeWidth="1.5" />
      <line x1="84" y1="162" x2="84" y2="170" stroke="var(--ink-soft)" strokeWidth="1.5" />
      <line x1="152" y1="162" x2="152" y2="170" stroke="var(--ink-soft)" strokeWidth="1.5" />
      <text x="6" y="22">Telinga sejajar bahu</text>
      <text x="92" y="48">Kamera setinggi mata</text>
      <text x="92" y="180" fontSize="9">Sejarak satu lengan</text>
    </svg>
  </div>
);

const PipMock = () => (
  <div className="lp-visual">
    <p className="lp-cap">Contoh jendela pop-up</p>
    <div className="lp-pipmock">
      <span className="chip"><Ico n="clock" s={14} /> 00:28:37</span>
      <span className="badge"><Ico n="check" s={13} w={3} /> POSTUR BAIK</span>
    </div>
  </div>
);

const RecapMock = () => (
  <div className="lp-visual">
    <p className="lp-cap">Contoh rekap sesi</p>
    <div className="lp-recap">
      {[["Total durasi", "00:42:10"], ["Postur baik", "86%"], ["Waktu bungkuk", "05:12"], ["Peringatan", "3 kali"]].map(([l, v]) => (
        <div key={l}><span>{l}</span><b>{v}</b></div>
      ))}
    </div>
  </div>
);

const VISUAL = { diagram: <Diagram />, pip: <PipMock />, recap: <RecapMock /> };

export default function Landing({ onLogin, onRegister }) {
  const [stepsOn, setStepsOn] = useState(false);
  const [tab, setTab] = useState(0);
  const cur = GUIDE[tab];

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  // garis langkah "terisi" sekali saat bagian ini terlihat
  useEffect(() => {
    const el = document.getElementById("lp-steps");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setStepsOn(true), io.disconnect()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp">
      {/* NAVIGASI */}
      <nav className="lp-nav">
        <div className="lp-wrap">
          <button className="lp-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="brand-mark"><Logo /></span>
            UnSlouch
          </button>
          <div className="lp-links">
            {NAV.map(([id, label]) => (
              <button key={id} onClick={() => go(id)}>{label}</button>
            ))}
          </div>
          <div className="lp-nav-cta">
            <button className="btn btn-ghost" onClick={onLogin}>Masuk</button>
            <button className="btn btn-primary" onClick={onRegister}>Daftar</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="lp-hero">
        <div className="lp-wrap">
          <div className="lp-hero-copy">
            <h1>Duduk tegak, bekerja lebih nyaman.</h1>
            <p className="lp-lead">
              UnSlouch memanfaatkan webcam laptop Anda untuk membaca posisi kepala dan bahu. Jika Anda membungkuk
              terlalu lama, sistem memberikan pengingat secara lembut sehingga Anda dapat tetap fokus bekerja.
            </p>
            <div className="lp-actions">
              <button className="btn btn-primary btn-lg" onClick={onRegister}>Mulai sekarang</button>
              <button className="btn btn-ghost btn-lg" onClick={() => go("panduan")}>Lihat panduan</button>
            </div>
          </div>

          <div className="lp-demo" role="img" aria-label="Animasi: siluet duduk membungkuk lalu menegak, status berubah dari postur buruk ke postur baik">
            <div className="lp-cam">
              <div className="lp-cam-head">
                <div><b>Kamera</b><small>Webcam depan laptop</small></div>
                <span className="lp-live"><i />Sedang Live</span>
              </div>

              <div className="lp-view">
                <svg className="lp-scene" viewBox="0 0 360 270" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
                  <rect x="22" y="28" width="84" height="108" rx="10" fill="#fff" opacity=".35" />
                  <rect x="0" y="238" width="360" height="32" fill="#aebbd3" opacity=".55" />
                  <g className="lp-sh">
                    <path d="M56 270 C56 228 96 208 144 203 L216 203 C264 208 304 228 304 270 Z" fill="var(--brand)" />
                    <line x1="104" y1="216" x2="256" y2="216" stroke="var(--accent-light)" strokeWidth="2.5" strokeDasharray="5 5" />
                    <circle cx="104" cy="216" r="6" fill="var(--accent-light)" />
                    <circle cx="256" cy="216" r="6" fill="var(--accent-light)" />
                  </g>
                  <g className="lp-head">
                    <rect x="156" y="140" width="48" height="70" rx="20" fill="var(--good-ink)" />
                    <ellipse cx="180" cy="104" rx="54" ry="62" fill="var(--good-ink)" />
                    <line x1="127" y1="112" x2="233" y2="112" stroke="var(--accent-light)" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="127" cy="112" r="7" fill="var(--accent-light)" />
                    <circle cx="233" cy="112" r="7" fill="var(--accent-light)" />
                  </g>
                  <line className="lp-link" x1="180" y1="112" x2="180" y2="216" stroke="#b8934e" strokeWidth="3" strokeLinecap="round" />
                </svg>

                <div className="lp-tint good" />
                <div className="lp-tint bad" />
                <i className="lp-corner tl" /><i className="lp-corner tr" />
                <i className="lp-corner bl" /><i className="lp-corner br" />

                <div className="lp-badge good"><i><Ico n="check" s={14} w={3} /></i>POSTUR BAIK</div>
                <div className="lp-badge bad">
                  <i><Ico n="bang" s={14} w={3} /></i>
                  <span>
                    POSTUR BURUK (
                    <span className="lp-count">
                      <em style={{ "--i": 0 }}>3s</em>
                      <em style={{ "--i": 1 }}>2s</em>
                      <em className="hold" style={{ "--i": 2 }}>1s</em>
                    </span>
                    )
                  </span>
                </div>
              </div>
            </div>

            <div className="lp-chip timer"><Ico n="clock" s={16} /><Ticker /></div>
            <div className="lp-chip stretch">
              <span className="dot"><Ico n="bell" s={16} /></span>
              <span>Waktunya peregangan<small>Berdiri dan regangkan badan Anda</small></span>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* CARA KERJA */}
        <section id="cara-kerja" className="lp-sec">
          <div className="lp-wrap">
            <div className="lp-sec-head">
              <h2>Tiga langkah sederhana</h2>
              <p>Tidak ada perangkat tambahan yang perlu dipasang. Cukup buka aplikasi dan aktifkan kamera.</p>
            </div>
            <ol id="lp-steps" className={`lp-steps ${stepsOn ? "on" : ""}`}>
              {STEPS.map(([title, text], i) => (
                <li className="lp-step" key={title}>
                  <div className="lp-step-n">{i + 1}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FITUR */}
        <section id="fitur" className="lp-sec">
          <div className="lp-wrap">
            <div className="lp-sec-head">
              <h2>Dirancang agar tidak mengganggu</h2>
              <p>Pengingat muncul pada waktu yang tepat, bukan setiap kali Anda bergerak sedikit.</p>
            </div>
            <div className="lp-feat">
              <ul className="lp-flist">
                {FEATURES.map(([icon, title, text]) => (
                  <li key={title}>
                    <span className="lp-fic"><Ico n={icon} s={20} /></span>
                    <div><h3>{title}</h3><p>{text}</p></div>
                  </li>
                ))}
              </ul>
              <div className="lp-stage" aria-hidden="true">
                <p className="lp-stage-title">Status postur</p>
                {STATES.map(([name, note], i) => (
                  <div className="lp-state" key={name} style={{ "--i": i }}>
                    <i />
                    <div><b>{name}</b><span>{note}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PANDUAN */}
        <section id="panduan" className="lp-sec">
          <div className="lp-wrap">
            <div className="lp-sec-head">
              <h2>Panduan penggunaan</h2>
              <p>Atur kamera satu kali, sisanya berjalan otomatis.</p>
            </div>
            <div className="lp-tabs" role="tablist">
              {GUIDE.map((g, i) => (
                <button key={g.label} role="tab" aria-selected={tab === i} className={`lp-tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>
                  {g.label}
                  <small>{g.sub}</small>
                </button>
              ))}
            </div>
            <div className="lp-panel" key={tab} role="tabpanel">
              <ol className="lp-todo">
                {cur.steps.map(([title, text]) => (
                  <li key={title}><b>{title}</b><span>{text}</span></li>
                ))}
              </ol>
              <div className="lp-aside">
                {VISUAL[cur.visual]}
                <p className="lp-tip">{rich(cur.tip)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* PERTANYAAN UMUM */}
        <section id="faq" className="lp-sec">
          <div className="lp-wrap">
            <div className="lp-sec-head">
              <h2>Pertanyaan umum</h2>
            </div>
            <div className="lp-faq">
              {FAQ.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap">
          <span>UnSlouch, Kelompok 11</span>
          <nav>
            {NAV.map(([id, label]) => (
              <button key={id} onClick={() => go(id)}>{label}</button>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}