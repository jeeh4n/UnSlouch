// Variabel untuk membatasi frekuensi pengiriman ke API (throttle) & mencegah antrean request
let lastAnalyzeTime = 0;
let isAnalyzing = false;
const ANALYZE_INTERVAL_MS = 150;
const CAPTURE_MAX_WIDTH = 320;

export async function detectPose(video, timestamp, canvas, token) {
  if (!token || !video || video.readyState < 2 || !canvas) return null;

  const now = performance.now();
  if (isAnalyzing || now - lastAnalyzeTime < ANALYZE_INTERVAL_MS) {
    return undefined;
  }

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return undefined;

  isAnalyzing = true;
  lastAnalyzeTime = now;

  try {
    const targetW = Math.min(vw, CAPTURE_MAX_WIDTH);
    const targetH = Math.round(vh * (targetW / vw));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-targetW, 0);
    ctx.drawImage(video, 0, 0, targetW, targetH);
    ctx.restore();

    const imageBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.7);
    });

    if (!imageBlob) return null;

    const formData = new FormData();
    formData.append("file", imageBlob, "frame.jpg");

    const res = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    console.log("Respon AI:", data);

    if (data.status === "sukses") {
      const isBad = data.hasil.target_prediksi === 1;
      return {
        bad: isBad,
        detail: data.hasil,
        landmarks: data.hasil.titik_tubuh,
      };
    } else {
      return { error: data.pesan || "Gagal mendeteksi postur" };
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    return { error: "Koneksi backend terputus" };
  } finally {
    isAnalyzing = false;
  }
}

// createDwell biarkan seperti sebelumnya...
export function createDwell(seconds, onTrigger) {
  let since = null;
  let fired = false;
  return {
    update(isBad, now = performance.now()) {
      if (!isBad) { since = null; fired = false; return; }
      if (since === null) since = now;
      if (!fired && now - since >= seconds * 1000) { fired = true; onTrigger(); }
    },
  };
}