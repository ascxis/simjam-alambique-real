import { FilesetResolver, HandLandmarker } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';

const VERSION = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODELO = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
export class CamaraManos {
  constructor({ intercambiar = false, onFrame = () => {} } = {}) { this.intercambiar = intercambiar; this.onFrame = onFrame; this.activo = false; this.fps = 0; }
  async iniciar(video, deviceId) {
    this.detener();
    const constraints = { audio: false, video: { width: 640, height: 480, ...(deviceId ? { deviceId: { exact: deviceId } } : {}) } };
    this.stream = await navigator.mediaDevices.getUserMedia(constraints); video.srcObject = this.stream; await video.play();
    const vision = await FilesetResolver.forVisionTasks(VERSION);
    try { this.detector = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODELO, delegate: 'GPU' }, runningMode: 'VIDEO', numHands: 2 }); }
    catch { this.detector = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODELO, delegate: 'CPU' }, runningMode: 'VIDEO', numHands: 2 }); }
    this.video = video; this.activo = true; this.ultimo = -1; this.iniciarBucle(); return this.stream;
  }
  async dispositivos() { return (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput'); }
  iniciarBucle() {
    const tick = (now) => { if (!this.activo) return; if (this.video.currentTime !== this.ultimo) { const r = this.detector.detectForVideo(this.video, now); this.fps = this.t0 ? 1000 / (now - this.t0) : 0; this.t0 = now; const manos = (r.landmarks || []).map((p, i) => ({ puntos: p, etiqueta: (r.handednesses?.[i]?.[0]?.categoryName || 'Right') === 'Right' ? 'der' : 'izq' })).map((m) => ({ ...m, etiqueta: this.intercambiar ? (m.etiqueta === 'der' ? 'izq' : 'der') : m.etiqueta })); this.onFrame({ manos, fps: this.fps, tiempo: now }); this.ultimo = this.video.currentTime; } this.raf = requestAnimationFrame(tick); };
    this.raf = requestAnimationFrame(tick);
  }
  detener() { this.activo = false; cancelAnimationFrame(this.raf); this.stream?.getTracks().forEach((t) => t.stop()); this.detector?.close(); this.detector = null; }
}
