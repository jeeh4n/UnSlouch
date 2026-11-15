import Icon from "./Icon";

export default function Topbar({ page, cameraOn, user, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <span>Workspace</span>
        <span className="slash">/</span>
        <strong>{page}</strong>
      </div>
      <div className="topbar-right">
        <span className={`pill ${cameraOn ? "pill-on" : ""}`}>
          <i />
          {cameraOn ? "Kamera aktif" : "Kamera mati"}
        </span>
        <div className="profile-avatar" title={user.email}>
          {user.name[0].toUpperCase()}
        </div>
        <button className="icon-btn" onClick={onLogout} title="Keluar" aria-label="Keluar">
          <Icon name="logout" size={18} />
        </button>
      </div>
    </header>
  );
}
