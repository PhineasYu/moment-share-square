let ctx: AudioContext | null = null;
let noiseBuf: AudioBuffer | null = null;
let lastTickAt = 0;

export function initAudio() {
  if (ctx) {
    if (ctx.state !== "running") void ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  if ("audioSession" in navigator) {
    try {
      (navigator as unknown as { audioSession: { type: string } }).audioSession.type = "playback";
    } catch {
      /* ignore */
    }
  }
  const len = Math.floor(ctx.sampleRate * 0.006);
  noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  void ctx.resume();
}

/** Returns the velocity used, or 0 when the tick was rate-limited away. */
export function tick(): number {
  if (!ctx || !noiseBuf || ctx.state !== "running") return 0;
  const now = performance.now();
  const dt = now - lastTickAt;
  if (dt < 28) return 0;
  lastTickAt = now;
  const velocity = Math.max(0.35, Math.min(1, dt / 90));
  const t = ctx.currentTime;

  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2400;
  bp.Q.value = 6;
  const g1 = ctx.createGain();
  g1.gain.value = 0.2 * velocity;
  src.connect(bp).connect(g1).connect(ctx.destination);
  src.start(t);

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(3100, t);
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.06 * velocity, t);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.004);
  osc.connect(g2).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.005);

  return velocity;
}

export function haptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(8);
  }
}
