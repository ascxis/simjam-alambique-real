import { FilesetResolver, HandLandmarker } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';

const VERSION = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODELO = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
export class CamaraManos {
  constructor({ intercambiar = false, onFrame = () => {} } = {}) { this.intercambiar = intercambiar; this.onFrame = onFrame; this.activo = false; this.fps = 0; }
  async iniciar(video, deviceId) {
    this.detener();
    const constraints = { audio: false, video: { width: { ideal: 480 }, height: { ideal: 360 }, frameRate: { ideal: 30 }, ...(deviceId ? { deviceId: { exact: deviceId } } : {}) } };
    this.stream = await navigator.mediaDevices.getUserMedia(constraints); this.fpsCamara = this.stream.getVideoTracks()[0]?.getSettings().frameRate ?? null; video.srcObject = this.stream; await video.play();
    const vision = await FilesetResolver.forVisionTasks(VERSION);
    try { this.detector = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODELO, delegate: 'GPU' }, runningMode: 'VIDEO', numHands: 2 }); }
    catch { this.detector = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODELO, delegate: 'CPU' }, runningMode: 'VIDEO', numHands: 2 }); }
    this.video = video; this.activo = true; this.t0 = 0; this.ultimoMediaTime = null; this.iniciarBucle(); return this.stream;
  }
  async dispositivos() { return (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput'); }
  iniciarBucle() {
    const detectar = (now) => {
      const r = this.detector.detectForVideo(this.video, now);
      this.fps = this.t0 ? 1000 / (now - this.t0) : 0; this.t0 = now;
      const manos = (r.landmarks || []).map((p, i) => ({ puntos: p, etiqueta: (r.handednesses?.[i]?.[0]?.categoryName || 'Right') === 'Right' ? 'der' : 'izq' })).map((m) => ({ ...m, etiqueta: this.intercambiar ? (m.etiqueta === 'der' ? 'izq' : 'der') : m.etiqueta }));
      this.onFrame({ manos, fps: this.fps, tiempo: now });
    };
    if (typeof this.video.requestVideoFrameCallback === 'function') {
      const tickFrame = (now, metadata) => { if (!this.activo) return; if (metadata.mediaTime !== this.ultimoMediaTime) { this.ultimoMediaTime = metadata.mediaTime; detectar(now); } this.videoFrameCallback = this.video.requestVideoFrameCallback(tickFrame); };
      this.videoFrameCallback = this.video.requestVideoFrameCallback(tickFrame);
      return;
    }
    // Respaldo para navegadores sin requestVideoFrameCallback: procesa solo al cambiar currentTime.
    let ultimoTiempoVideo = -1;
    const tick = (now) => {
      if (!this.activo) return;
      const tiempoVideo = this.video.currentTime;
      if (tiempoVideo !== ultimoTiempoVideo) { ultimoTiempoVideo = tiempoVideo; detectar(now); }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
  detener() { this.activo = false; cancelAnimationFrame(this.raf); if (this.videoFrameCallback !== undefined) this.video?.cancelVideoFrameCallback?.(this.videoFrameCallback); this.videoFrameCallback = undefined; this.stream?.getTracks().forEach((t) => t.stop()); this.detector?.close(); this.detector = null; }
}
