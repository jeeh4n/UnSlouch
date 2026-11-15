import { useEffect, useRef } from "react";

export function useFrameLoop({ on, videoRef, canvasRef }, onFrame) {
  const callback = useRef(onFrame);
  useEffect(() => {
    callback.current = onFrame;
  });

  useEffect(() => {
    if (!on) return;
    let id;
    let lastTime = -1;
    const tick = (t) => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        const canvas = canvasRef.current;
        if (canvas && canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        callback.current(video, t, canvas);
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [on, videoRef, canvasRef]);
}
