import { useEffect } from "react";

const ICON_PATH = {
  danger: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
  info: "M12 7v5l3 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0",
};

export default function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  tone = "danger",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`dialog-icon ${tone}`}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={ICON_PATH[tone]} />
          </svg>
        </div>
        <h3 id="dialog-title">{title}</h3>
        <p>{text}</p>
        <div className="dialog-actions">
          {cancelLabel && (
            <button className="btn btn-ghost" onClick={onCancel} autoFocus>
              {cancelLabel}
            </button>
          )}
          <button
            className={`btn ${tone === "danger" ? "btn-delete" : "btn-primary"}`}
            onClick={onConfirm}
            autoFocus={!cancelLabel}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}