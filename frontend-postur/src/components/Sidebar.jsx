import Icon from "./Icon";
import Logo from "./Logo";

const MENU = [
  { name: "Dashboard", icon: "dashboard" },
  { name: "Live Monitoring", icon: "camera" },
  { name: "History", icon: "history" },
  { name: "Settings", icon: "sliders" },
];

export default function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar" style={{ 
      backgroundColor: "var(--card)", 
      borderRight: "1px solid var(--line)", 
      padding: "13px 20px" 
    }}>
      <div className="brand" style={{ marginBottom: "14px", paddingLeft: "4px" }}>
        <div className="brand-mark" style={{ 
          backgroundColor: "var(--brand)", 
          color: "var(--accent-light)", 
          boxShadow: "0 6px 12px -4px rgba(31, 45, 77, 0.4)" 
        }}>
          <Logo />
        </div>
        <div>
          <h2 style={{ color: "var(--brand)", fontSize: "1.2rem", marginBottom: "2px" }}>UnSlouch</h2>
        </div>
      </div>

      <div style={{ 
          height: "1px", 
          backgroundColor: "var(--line)", 
          margin: "0 8px 20px 8px" 
        }} />

      <nav aria-label="Menu utama">
        {MENU.map((item) => {
          const isActive = page === item.name;
          return (
            <button 
              key={item.name} 
              className={`nav-item ${isActive ? "active" : ""}`} 
              onClick={() => setPage(item.name)} 
              title={item.name}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                width: "100%", padding: "12px 16px", borderRadius: "12px",
                fontSize: "0.95rem", fontWeight: isActive ? "700" : "600",
                textAlign: "left", marginBottom: "4px",
                backgroundColor: isActive ? "var(--brand-tint)" : "transparent",
                color: isActive ? "var(--brand)" : "var(--ink-soft)",
                border: "none", cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "var(--bg)";
                  e.currentTarget.style.color = "var(--ink)";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--ink-soft)";
                }
              }}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}