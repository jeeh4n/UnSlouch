import { useEffect, useRef } from "react";
import Icon from "./Icon";
import { formatTime } from "../lib/utils"; 

// Ikon kecil di dalam badge status (digambar di canvas, pengganti emoji)
const ICON_COLORS = { good: "#16a34a", bad: "#dc2626", warn: "#d97706", wait: "#4b5563" };

function drawBadgeIcon(ctx, kind, cx, cy, r) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = ctx.fillStyle = ICON_COLORS[kind];
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (kind === "good") {
    // centang
    ctx.moveTo(cx - r * 0.45, cy + r * 0.02);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.38);
    ctx.lineTo(cx + r * 0.5, cy - r * 0.32);
    ctx.stroke();
  } else if (kind === "wait") {
    // lingkaran berputar
    const a = (Date.now() / 300) % (Math.PI * 2);
    ctx.arc(cx, cy, r * 0.5, a, a + Math.PI * 1.5);
    ctx.stroke();
  } else {
    // tanda seru (buruk & peringatan)
    ctx.moveTo(cx, cy - r * 0.5);
    ctx.lineTo(cx, cy + r * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.45, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------- HUD khusus jendela pop-up (PiP): timer sesi + pengingat peregangan ----------
function box(ctx, x, y, w, h, r, bg) {
  ctx.fillStyle = bg;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.fill();
}

function drawPipHud(ctx, vw, vh, timeText, stretchAge) {
  ctx.save();
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  // Timer sesi (tengah atas)
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  const tw = ctx.measureText("00:00:00").width; // lebar tetap supaya tidak goyang
  const ch = 38;
  const cw = tw + 56;
  const cx0 = (vw - cw) / 2;
  const cy0 = 24;
  box(ctx, cx0, cy0, cw, ch, ch / 2, "rgba(0,0,0,0.55)");

  const ix = cx0 + 24;
  const iy = cy0 + ch / 2;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.arc(ix, iy, 8, 0, Math.PI * 2);
  ctx.moveTo(ix, iy - 4);
  ctx.lineTo(ix, iy);
  ctx.lineTo(ix + 3.5, iy + 2.5);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(timeText, ix + 16, iy + 1);

  // Pengingat peregangan (tampil 60 detik, berkedip pelan)
  if (stretchAge !== null && stretchAge < 60000) {
    ctx.globalAlpha = 0.85 + 0.15 * Math.sin(Date.now() / 250);
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    const l1 = "WAKTUNYA PEREGANGAN";
    const w1 = ctx.measureText(l1).width;
    ctx.font = "16px system-ui, -apple-system, sans-serif";
    const l2 = "Berdiri dan regangkan badanmu";
    const w2 = ctx.measureText(l2).width;

    const r = 15;
    const bh = 66;
    const bw = Math.max(w1, w2) + r * 2 + 12 + 40;
    const bx = (vw - bw) / 2;
    const by = cy0 + ch + 14;
    box(ctx, bx, by, bw, bh, 22, "#f59e0b");

    const tx = bx + 20;
    drawBadgeIcon(ctx, "warn", tx + r, by + bh / 2, r);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    ctx.fillText(l1, tx + r * 2 + 12, by + bh / 2 - 11);
    ctx.font = "16px system-ui, -apple-system, sans-serif";
    ctx.fillText(l2, tx + r * 2 + 12, by + bh / 2 + 13);
  }
  ctx.restore();
}

export default function CameraStage({ camera, posture, title, hint, dwell = 7, landmarks = null, stretchAlert = false }) {
  const { videoRef, canvasRef, stream } = camera;

  const pipCanvasRef = useRef(null);
  const pipVideoRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  const animationRef = useRef(null);
  const badgeRef = useRef(null); 
  
  const postureRef = useRef(posture);
  const badSinceRef = useRef(null); 
  const landmarksRef = useRef(landmarks);
  const elapsedRef = useRef(camera.elapsed);
  const stretchRef = useRef(false);
  const stretchSinceRef = useRef(0);

  useEffect(() => {
    postureRef.current = posture;
    if (posture === "bad") {
      if (!badSinceRef.current) badSinceRef.current = Date.now();
    } else {
      badSinceRef.current = null;
    }
  }, [posture]);

  useEffect(() => {
    landmarksRef.current = landmarks;
  }, [landmarks]);

  useEffect(() => {
    elapsedRef.current = camera.elapsed;
  }, [camera.elapsed]);

  useEffect(() => {
    stretchRef.current = stretchAlert;
    if (stretchAlert) stretchSinceRef.current = Date.now();
  }, [stretchAlert]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    
    if (stream) {
      video.play().catch(() => {});

      const pipCanvas = pipCanvasRef.current;
      const pipVideo = pipVideoRef.current;
      
      if (pipCanvas && pipVideo) {
        const pipStream = pipCanvas.captureStream(30);
        pipVideo.srcObject = pipStream;
        pipVideo.play().catch(() => {});
      }

      let pipInitialized = false;

      const drawLoop = () => {
        if (video.videoWidth > 0) {
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          const overlay = overlayCanvasRef.current;

          if (overlay) {
            if (overlay.width !== vw || overlay.height !== vh) {
              overlay.width = vw;
              overlay.height = vh;
            }
            const ctx = overlay.getContext("2d");
            ctx.clearRect(0, 0, vw, vh);

            // ========================================================
            // LAPISAN 1: UI INDIKATOR POSTUR 
            // ========================================================
            const currentPosture = postureRef.current;
            let text = "Menganalisis..."; let kind = "wait";
            let themeColor = "rgba(255,255,255,0.4)"; 
            let badgeBg = "rgba(0,0,0,0.6)";
            let isBad = false;
            let isGood = false;

            if (currentPosture === "bad") {
              isBad = true;
              themeColor = "#ef4444"; 
              badgeBg = "rgba(239, 68, 68, 0.9)";
              const elapsed = (Date.now() - badSinceRef.current) / 1000;
              const remaining = Math.max(0, Math.ceil(dwell - elapsed));
              kind = "bad";
              text = remaining > 0 ? `POSTUR BURUK (${remaining}s)` : "SEGERA PERBAIKI POSTUR!";
            } else if (currentPosture === "good") {
              isGood = true;
              themeColor = "#22c55e"; 
              badgeBg = "rgba(34, 197, 94, 0.85)";
              kind = "good";
              text = "POSTUR BAIK";
            } else if (currentPosture === "error") {
              themeColor = "#f59e0b"; 
              badgeBg = "rgba(245, 158, 11, 0.9)";
              kind = "warn";
              text = "Mundur sedikit, bahu tidak terlihat!";
            }

            const cx = vw / 2;
            const cy = vh / 2;
            const gradient = ctx.createRadialGradient(cx, cy, vh * 0.3, cx, cy, Math.max(vw, vh) * 0.8);
            gradient.addColorStop(0, "rgba(0,0,0,0)");
            if (isBad) gradient.addColorStop(1, "rgba(239, 68, 68, 0.4)");
            else if (isGood) gradient.addColorStop(1, "rgba(34, 197, 94, 0.2)");
            else gradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, vw, vh);

            ctx.strokeStyle = themeColor;
            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            const len = 35; const pad = 24; 
            ctx.beginPath();
            ctx.moveTo(pad, pad + len); ctx.lineTo(pad, pad); ctx.lineTo(pad + len, pad);
            ctx.moveTo(vw - pad - len, pad); ctx.lineTo(vw - pad, pad); ctx.lineTo(vw - pad, pad + len);
            ctx.moveTo(pad, vh - pad - len); ctx.lineTo(pad, vh - pad); ctx.lineTo(pad + len, vh - pad);
            ctx.moveTo(vw - pad - len, vh - pad); ctx.lineTo(vw - pad, vh - pad); ctx.lineTo(vw - pad, vh - pad - len);
            ctx.stroke();

            ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
            const textWidth = ctx.measureText(text).width;
            const iconR = 13; const badgeW = textWidth + iconR * 2 + 10 + 36; const badgeH = 46;
            const badgeX = (vw - badgeW) / 2; const badgeY = vh - badgeH - 32;

            ctx.fillStyle = badgeBg;
            if (ctx.roundRect) { 
              ctx.beginPath(); ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 23); ctx.fill(); 
            } else { 
              ctx.fillRect(badgeX, badgeY, badgeW, badgeH); 
            }

            const startX = badgeX + 18;
            drawBadgeIcon(ctx, kind, startX + iconR, badgeY + badgeH / 2, iconR);
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText(text, startX + iconR * 2 + 10, badgeY + badgeH / 2 + 1);

            if (badgeRef.current && badgeRef.current.innerText !== text) {
              badgeRef.current.innerText = text;
            }

            // ========================================================
            // LAPISAN 2: MENGGAMBAR TITIK (Paling Atas)
            // ========================================================
            const currentLandmarks = landmarksRef.current;
            if (currentLandmarks && currentLandmarks.nose) {
              ctx.save();
              ctx.fillStyle = "#00efff";
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 2;

              const drawPoint = (landmark) => {
                if (!landmark) return;
                const px = landmark.x * vw;
                const py = landmark.y * vh;
                ctx.beginPath();
                ctx.arc(px, py, 7, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
              };

              drawPoint(currentLandmarks.nose);
              drawPoint(currentLandmarks.left_ear);
              drawPoint(currentLandmarks.right_ear);
              drawPoint(currentLandmarks.left_shoulder);
              drawPoint(currentLandmarks.right_shoulder);

              if (currentLandmarks.left_shoulder && currentLandmarks.right_shoulder) {
                const ls = currentLandmarks.left_shoulder;
                const rs = currentLandmarks.right_shoulder;
                ctx.beginPath();
                ctx.moveTo(ls.x * vw, ls.y * vh);
                ctx.lineTo(rs.x * vw, rs.y * vh);
                ctx.strokeStyle = "rgba(0, 239, 255, 0.7)";
                ctx.lineWidth = 3;
                ctx.stroke();
              }

              if (currentLandmarks.left_ear && currentLandmarks.right_ear) {
                const le = currentLandmarks.left_ear;
                const re = currentLandmarks.right_ear;
                ctx.beginPath();
                ctx.moveTo(le.x * vw, le.y * vh);
                ctx.lineTo(re.x * vw, re.y * vh);
                ctx.strokeStyle = "rgba(34, 197, 94, 0.8)";
                ctx.lineWidth = 2.5;
                ctx.stroke();
              }
              ctx.restore();
            }

            // ========================================================
            // LAPISAN 3: GABUNGKAN KE POP-UP PiP (hanya saat PiP aktif / inisialisasi awal)
            // ========================================================
            const pipActive = document.pictureInPictureElement === pipVideoRef.current;
            if (pipCanvas && (!pipInitialized || pipActive)) {
              if (pipCanvas.width !== vw || pipCanvas.height !== vh) {
                pipCanvas.width = vw;
                pipCanvas.height = vh;
              }
              const pipCtx = pipCanvas.getContext("2d");

              // 1. Gambar video mentah, TAPI KITA MIRROR SECARA MANUAL
              pipCtx.save();
              pipCtx.scale(-1, 1);
              pipCtx.translate(-vw, 0);
              pipCtx.drawImage(video, 0, 0, vw, vh);
              pipCtx.restore();

              // 2. Tempelkan overlay titik & tulisan (Orientasi sudah benar)
              pipCtx.drawImage(overlay, 0, 0, vw, vh);

              // 3. HUD khusus pop-up: timer sesi + pengingat peregangan
              drawPipHud(
                pipCtx, vw, vh,
                formatTime(elapsedRef.current || 0),
                stretchRef.current ? Date.now() - stretchSinceRef.current : null
              );
              pipInitialized = true;
            }
          }
        }
        animationRef.current = requestAnimationFrame(drawLoop);
      };
      drawLoop();
    } else {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      }
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [stream, videoRef, dwell]);

  const togglePiP = async () => {
    if (!pipVideoRef.current) return;
    try {
      if (document.pictureInPictureElement) { await document.exitPictureInPicture(); } 
      else { await pipVideoRef.current.play(); await pipVideoRef.current.requestPictureInPicture(); }
    } catch (err) { console.error("Gagal Pop-up:", err); }
  };

  return (
    <div className="camera-area" style={{ position: "relative", overflow: "hidden", borderRadius: "12px", background: "#000" }}>
      <video 
        ref={videoRef} autoPlay playsInline muted 
        className={`camera-video ${stream ? "visible" : ""}`} 
        style={{ transform: "scaleX(-1)" }} /* PAKSA WEB VIDEO JADI CERMIN */
      />
      
      <canvas ref={canvasRef} style={{ display: "none" }} /> 

      {stream && (
        <canvas 
          ref={overlayCanvasRef} 
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", zIndex: 5 }} 
        />
      )}

      <canvas ref={pipCanvasRef} style={{ opacity: 0, position: "absolute", width: 0, height: 0, pointerEvents: "none" }} />
      <video ref={pipVideoRef} autoPlay playsInline muted style={{ opacity: 0, position: "absolute", width: 0, height: 0, pointerEvents: "none" }} />

      {stream && (
        <>
          <span ref={badgeRef} style={{ display: "none" }}></span>
          <button className="pip-btn" onClick={togglePiP} title="Buka jendela pop-up">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <rect x="12" y="12" width="7" height="5" rx="1" fill="currentColor" />
            </svg>
            Pop-up
          </button>
        </>
      )}
      
      {!stream && (
        <div className="camera-placeholder">
          <div className="camera-placeholder-icon">
            <Icon name="camera" size={30} />
          </div>
          <h3>{title}</h3>
          <p>{hint}</p>
        </div>
      )}
    </div>
  );
}