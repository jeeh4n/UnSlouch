export function formatTime(seconds) {
  if (!seconds) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function playBeep(type = 1) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  
  const playTone = (freq, typeOsc, startTime, duration) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = typeOsc;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    osc.start(ctx.currentTime + startTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
    osc.stop(ctx.currentTime + startTime + duration);
  };

  // Pastikan data dibaca sebagai angka
  const alarmType = Number(type);

  if (alarmType === 1) {
    playTone(750, "square", 0, 0.15);
    playTone(750, "square", 0.25, 0.15);
  } 
  else if (alarmType === 2) {
    playTone(800, "sawtooth", 0, 0.1);
    playTone(900, "sawtooth", 0.15, 0.1);
    playTone(1000, "sawtooth", 0.3, 0.2);
  } 
  else if (alarmType === 3) {
    playTone(300, "sawtooth", 0, 0.25);
    playTone(300, "sawtooth", 0.35, 0.35);
  } 
  else if (alarmType === 4) {
    playTone(800, "square", 0, 0.2);
    playTone(600, "square", 0.2, 0.2);
    playTone(800, "square", 0.4, 0.2);
    playTone(600, "square", 0.6, 0.2);
  } 
  else {
    playTone(1000, "square", 0, 0.05);
    playTone(1200, "square", 0.05, 0.05);
    playTone(1000, "square", 0.1, 0.05);
    playTone(1200, "square", 0.15, 0.05);
    playTone(1000, "square", 0.2, 0.05);
    playTone(1200, "square", 0.25, 0.1);
  }
}