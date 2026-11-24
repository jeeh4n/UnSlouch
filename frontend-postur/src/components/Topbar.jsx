import Icon from "./Icon";

export default function Topbar({ page, cameraOn, user, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
      </div>
      <div className="topbar-right">
        <span 
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px", 
            padding: "6px 14px", borderRadius: "999px",
            fontSize: "0.85rem", fontWeight: "bold",
            backgroundColor: cameraOn ? "#fee2e2" : "var(--brand-tint)",
            // Warna teks menjadi merah saat kamera aktif
            color: cameraOn ? "#ef4444" : "var(--ink-soft)",
            border: `1px solid ${cameraOn ? "rgba(239, 68, 68, 0.18)" : "var(--line)"}`
          }}
        >
          {cameraOn ? (
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444", animation: "pulse 1.5s infinite" }} />
          ) : (
            <i style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#b4c3c9" }} />
          )}
          {cameraOn ? "Kamera aktif" : "Kamera mati"}
        </span>
        
        <div 
          className="profile-avatar" 
          title={user?.email || "User"}
          style={{ 
            border: "1px solid var(--line)", // Penambahan border tipis
            backgroundColor: "var(--card)", 
            color: "var(--brand)" 
          }}
        >
          {user?.email?.[0]?.toUpperCase() || "?"}
        </div>
        
        <button 
          className="icon-btn" 
          onClick={onLogout} 
          title="Keluar" 
          aria-label="Keluar"
          style={{
            backgroundColor: "var(--bad)", 
            color: "var(--bad-ink)", 
            border: "1px solid var(--line)",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--bad-ink)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--bad-ink)"; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "var(--bad)"; e.currentTarget.style.color = "var(--bad-ink)"; e.currentTarget.style.borderColor = "var(--line)"; }}
        >
          <Icon name="logout" size={18} />
        </button>
      </div>
    </header>
  );
}