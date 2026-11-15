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
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Logo />
        </div>
        <div>
          <h2>PostureGuard</h2>
          <span>Pantau postur duduk</span>
        </div>
      </div>

      <nav aria-label="Menu utama">
        {MENU.map((item) => (
          <button key={item.name} className={`nav-item ${page === item.name ? "active" : ""}`} onClick={() => setPage(item.name)} title={item.name}>
            <Icon name={item.icon} />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-help">
          <div className="cd-row" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <p>Duduk tegak hari ini, untuk kesehatan punggung.</p>
        </div>
      </div>
    </aside>
  );
}
