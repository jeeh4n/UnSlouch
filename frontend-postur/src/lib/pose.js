// Variabel untuk membatasi frekuensi pengiriman ke API (throttle)
let lastAnalyzeTime = 0;
const ANALYZE_INTERVAL_MS = 300; 

export async function detectPose(video, timestamp, canvas, token) {
  if (!token || !video || video.readyState < 2) return null;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  ctx.save();
  ctx.scale(-1, 1); 
  ctx.translate(-canvas.width, 0);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  const now = performance.now();
  if (now - lastAnalyzeTime < ANALYZE_INTERVAL_MS) {
    return undefined; 
  }

  try {
    lastAnalyzeTime = performance.now(); 

    const imageBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.8);
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
    
    // CEK CONSOLE BROWSER (F12) JIKA PENASARAN HASILNYA
    console.log("Respon AI:", data);

    if (data.status === "sukses") {
      const isBad = data.hasil.target_prediksi === 1;
      return { 
        bad: isBad, 
        detail: data.hasil,
        landmarks: data.hasil.titik_tubuh 
      };
    } else {
      // Jika gagal (Misal: Tubuh tidak terdeteksi / Bahu terpotong)
      return { error: data.pesan || "Gagal mendeteksi postur" };
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    return { error: "Koneksi backend terputus" };
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