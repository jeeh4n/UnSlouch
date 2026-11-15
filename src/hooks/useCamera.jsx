import { useCallback, useEffect, useRef, useState } from "react";

export function useCamera(onStop) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const elapsedRef = useRef(0);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const on = stream !== null;

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    if (!on) return;
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [on]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const start = useCallback(async () => {
    if (streamRef.current) return;
    try {
      setError("");
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user", frameRate: { ideal: 30 } },
        audio: false,
      });
      streamRef.current = s;
      setElapsed(0);
      setStream(s);
    } catch {
      setError("Kamera tidak bisa diakses. Izinkan akses kamera di browser dan buka lewat localhost atau HTTPS.");
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    if (elapsedRef.current > 0) onStop?.(elapsedRef.current);
  }, [onStop]);

  return { videoRef, canvasRef, stream, on, error, elapsed, start, stop };
}
