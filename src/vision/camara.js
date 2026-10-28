import { FilesetResolver, HandLandmarker } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';

const VERSION = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODELO = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export class CamaraManos {
  constructor({ intercambiar = false, onFrame = () => {} } = {}) {
    this.intercambiar = intercambiar; this.onFrame = onFrame; this.activo = false; this.fps = 0;
    this.video = null; this.stream = null; this.detector = null; this.deviceId = null;
  }

  async iniciar(video, deviceId) {
    this.pausarDeteccion();
    const idElegido = deviceId || null;
    const mismaCamara = this.stream && this.deviceId === idElegido;
    if (!mismaCamara) {
      try { this.stream?.getTracks().forEach((track) => track.stop()); } catch {}
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: { ideal: 480 }, height: { ideal: 360 }, frameRate: { ideal: 30 }, ...(deviceId ? { deviceId: { exact: deviceId } } : {}) }
      });
      this.deviceId = idElegido;
    }
    this.video = video;
    this.fpsCamara = this.stream.getVideoTracks()[0]?.getSettings().frameRate ?? null;
    if (video.srcObject !== this.stream) video.srcObject = this.stream;
    await video.play();

    if (!this.detector) {
      const vision = await FilesetResolver.forVisionTasks(VERSION);
      try {
        this.detector = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODELO, delegate: 'GPU' }, runningMode: 'VIDEO', numHands: 2 });
      } catch {
        this.detector = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODELO, delegate: 'CPU' }, runningMode: 'VIDEO', numHands: 2 });
      }
    }
    this.activo = true;
    this.ultimoMediaTime = null;
    this.ultimoTiempoDeteccion = null;
    this.iniciarBucle();
    return this.stream;
  }

  async dispositivos() { return (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput'); }

  procesarCuadro(now) {
    if (!this.activo || !this.detector) return;
    try {
      const resultado = this.detector.detectForVideo(this.video, now);
      this.fps = this.ultimoTiempoDeteccion === null ? 0 : 1000 / Math.max(1, now - this.ultimoTiempoDeteccion);
      this.ultimoTiempoDeteccion = now;
      const manos = (resultado.landmarks || []).map((puntos, i) => {
        const etiqueta = (resultado.handednesses?.[i]?.[0]?.categoryName || 'Right') === 'Right' ? 'der' : 'izq';
        return { puntos, etiqueta: this.intercambiar ? (etiqueta === 'der' ? 'izq' : 'der') : etiqueta };
      });
      this.onFrame({ manos, fps: this.fps, fpsCamara: this.fpsCamara, tiempo: now });
    } catch (error) {
      console.warn('Falló la detección de manos en el cuadro actual.', error);
    }
  }

  iniciarBucle() {
    if (typeof this.video.requestVideoFrameCallback === 'function') {
      const tick = (now, metadata) => {
        if (!this.activo) return;
        if (metadata.mediaTime !== this.ultimoMediaTime) {
          this.ultimoMediaTime = metadata.mediaTime;
          this.procesarCuadro(now);
        }
        if (this.activo) this.videoFrameCallback = this.video.requestVideoFrameCallback(tick);
      };
      this.videoFrameCallback = this.video.requestVideoFrameCallback(tick);
      return;
    }
    let ultimoTiempoVideo = -1;
    const tick = (now) => {
      if (!this.activo) return;
      const tiempoVideo = this.video.currentTime;
      if (tiempoVideo !== ultimoTiempoVideo) { ultimoTiempoVideo = tiempoVideo; this.procesarCuadro(now); }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  pausarDeteccion() {
    this.activo = false;
    if (this.raf !== undefined) cancelAnimationFrame(this.raf);
    if (this.videoFrameCallback !== undefined) this.video?.cancelVideoFrameCallback?.(this.videoFrameCallback);
    this.raf = undefined;
    this.videoFrameCallback = undefined;
  }

  // Conservado para usos explícitos fuera de la partida; no se invoca durante el cierre de escenas.
  detener() {
    this.pausarDeteccion();
    try { this.stream?.getTracks().forEach((track) => track.stop()); } catch {}
    this.stream = null;
    this.deviceId = null;
    return Promise.resolve();
  }
}
