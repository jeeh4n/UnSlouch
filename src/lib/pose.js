// Indeks landmark MediaPipe Pose: telinga 7 (kiri) & 8 (kanan), bahu 11 (kiri) & 12 (kanan).
export const LM = { earL: 7, earR: 8, shoulderL: 11, shoulderR: 12 };

// Sudut (derajat) di titik b, dibentuk oleh garis b->a dan b->c.
export function angleAt(a, b, c) {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const mag = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (!mag) return 0;
  const cos = (v1.x * v2.x + v1.y * v2.y) / mag;
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

// Titik virtual tengah dada: tengah kedua bahu, digeser ke bawah 0.6x lebar bahu.
export function chestPoint(shoulderL, shoulderR) {
  const width = Math.hypot(shoulderL.x - shoulderR.x, shoulderL.y - shoulderR.y);
  return { x: (shoulderL.x + shoulderR.x) / 2, y: (shoulderL.y + shoulderR.y) / 2 + width * 0.6 };
}

// TODO: sambungkan MediaPipe PoseLandmarker di sini.
// Dipanggil setiap ada frame baru dari webcam. Gambar titik di `canvas` bila perlu,
// lalu kembalikan { bad: boolean } atau null kalau belum ada hasil.
export function detectPose(/* video, timestamp, canvas */) {
  return null;
}

// Dwell-time debouncing: onTrigger hanya jalan jika postur buruk bertahan terus-menerus.
export function createDwell(seconds, onTrigger) {
  let since = null;
  let fired = false;
  return {
    update(isBad, now = performance.now()) {
      if (!isBad) {
        since = null;
        fired = false;
        return;
      }
      if (since === null) since = now;
      if (!fired && now - since >= seconds * 1000) {
        fired = true;
        onTrigger();
      }
    },
  };
}
