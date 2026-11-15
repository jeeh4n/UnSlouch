import { useEffect } from "react";
import Icon from "./Icon";

export default function CameraStage({ camera, title, hint }) {
  const { videoRef, canvasRef, stream } = camera;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) video.play().catch(() => {});
  }, [stream, videoRef]);

  return (
    <div className="camera-area">
      <video ref={videoRef} autoPlay playsInline muted className={`camera-video ${stream ? "visible" : ""}`} />
      <canvas ref={canvasRef} className="camera-canvas" />
      {stream && (
        <>
          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />
          <span className="rec-badge">
            <i /> Merekam
          </span>
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
