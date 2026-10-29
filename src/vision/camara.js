import { FilesetResolver, HandLandmarker } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';

const VERSION = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODELO = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export class CamaraManos {
  constructor({ intercambiar = false, onFrame = () => {} } = {}) {
    this.intercambiar = intercambiar; this.onFrame = onFrame; this.activo = false; this.fps = 0;
    this.video = null; this.stream = null; this.detector = null; this.deviceId = null;
    this.numHands = 2; this.delegado = '—'; this.tiemposDeteccion = []; this.promedioDeteccionMs = 0;
    this.resolucionReducida = false; this.avisoResolucion = '';
  }

  async iniciar(video, deviceId, { numHands = this.numHands || 2 } = {}) {
    this.pausarDeteccion();
    this.numHands = numHands;
    const idElegido = deviceId || null;
    const mismaCamara = this.stream && this.deviceId === idElegido;
    if (!mismaCamara) {
      this.resolucionReducida = false; this.avisoResolucion = ''; this.intentoBajarResolucion = false;
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
        this.detector = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODELO, delegate: 'GPU' }, runningMode: 'VIDEO', numHands });
        this.delegado = 'GPU';
      } catch {
        this.detector = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODELO, delegate: 'CPU' }, runningMode: 'VIDEO', numHands });
        this.delegado = 'CPU';
      }
    } else await this.detector.setOptions({ numHands });
    this.activo = true;
    this.ultimoMediaTime = null;
    this.ultimoTiempoDeteccion = null;
    this.inicioVentanaFps = performance.now(); this.cuadrosVentanaFps = 0;
    this.iniciarBucle();
    const resolucion = this.obtenerResolucion();
    console.info(`[CÁMARA] MediaPipe ${this.delegado} · video ${resolucion.ancho}×${resolucion.alto}`);
    return this.stream;
  }

  obtenerResolucion() {
    const settings = this.stream?.getVideoTracks()[0]?.getSettings?.() || {};
    return { ancho: this.video?.videoWidth || settings.width || 0, alto: this.video?.videoHeight || settings.height || 0 };
  }

  async ajustarResolucionSiLenta(now) {
    if (this.resolucionReducida || this.intentoBajarResolucion || now - this.inicioVentanaFps < 5000) return;
    const segundos = (now - this.inicioVentanaFps) / 1000;
    const promedioFps = this.cuadrosVentanaFps / Math.max(segundos, .001);
    if (promedioFps >= 18) return;
    this.intentoBajarResolucion = true;
    try {
      const track = this.stream?.getVideoTracks()[0];
      if (!track?.applyConstraints) throw new Error('applyConstraints no disponible en el track de video');
      await track.applyConstraints({ width: { exact: 320 }, height: { exact: 240 } });
      const settings = track.getSettings();
      this.resolucionReducida = settings.width <= 320 && settings.height <= 240;
      this.avisoResolucion = this.resolucionReducida
        ? 'detección <18 FPS tras 5 s: video reducido a 320×240'
        : `detección <18 FPS; resolución real ${settings.width}×${settings.height}`;
      this.fpsCamara = settings.frameRate ?? this.fpsCamara;
    } catch (error) {
      this.avisoResolucion = 'detección <18 FPS; no se pudo reducir a 320×240';
      console.warn('[CÁMARA] No se pudo bajar la resolución', error);
    }
  }

  async dispositivos() { return (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput'); }

  procesarCuadro(now) {
    if (!this.activo || !this.detector) return;
    try {
      const inicioDeteccion = performance.now();
      const resultado = this.detector.detectForVideo(this.video, now);
      const tiempoDeteccion = performance.now() - inicioDeteccion;
      this.tiemposDeteccion.push(tiempoDeteccion);
      if (this.tiemposDeteccion.length > 60) this.tiemposDeteccion.shift();
      this.promedioDeteccionMs = this.tiemposDeteccion.reduce((s, v) => s + v, 0) / this.tiemposDeteccion.length;
      this.fps = this.ultimoTiempoDeteccion === null ? 0 : 1000 / Math.max(1, now - this.ultimoTiempoDeteccion);
      this.ultimoTiempoDeteccion = now;
      this.cuadrosVentanaFps += 1;
      const manos = (resultado.landmarks || []).map((puntos, i) => {
        const etiqueta = (resultado.handednesses?.[i]?.[0]?.categoryName || 'Right') === 'Right' ? 'der' : 'izq';
        return { puntos, etiqueta: this.intercambiar ? (etiqueta === 'der' ? 'izq' : 'der') : etiqueta };
      });
      const resolucion = this.obtenerResolucion();
      this.onFrame({ manos, fps: this.fps, fpsCamara: this.fpsCamara, tiempo: now, promedioDeteccionMs: this.promedioDeteccionMs, delegado: this.delegado, resolucion, resolucionReducida: this.resolucionReducida, avisoResolucion: this.avisoResolucion });
      this.ajustarResolucionSiLenta(now);
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
