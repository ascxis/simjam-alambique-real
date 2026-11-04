import { leerPreferencia, guardarPreferencia } from './preferencias.js';

const INICIALES = Object.freeze({ musica: .25, efectos: .70, interfaz: .60, sonificacion: .50 });
const CLAVE_VOLUMEN = 'alambique.audio.volumenes';
const CLAVE_SILENCIO = 'alambique.audio.silencio';

function leerVolumenes() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_VOLUMEN) || '{}');
    return Object.fromEntries(Object.entries(INICIALES).map(([canal, inicial]) => {
      const valor = Number(guardado[canal]);
      return [canal, Number.isFinite(valor) ? Math.max(0, Math.min(1, valor)) : inicial];
    }));
  } catch { return { ...INICIALES }; }
}

export class GestorAudio {
  constructor(escena) {
    this.escena = escena;
    this.manager = escena.sound;
    this.volumenes = leerVolumenes();
    this.silencio = leerPreferencia(CLAVE_SILENCIO, 'false') === 'true';
    this.desbloqueado = false;
    this.musicaDeseada = null;
    this.musicaActual = null;
    this.sonidos = new Map();
    this.despedido = false;
    this.ultimaEntradaGamepad = false;
    this.sonidoContextual = null;
    this.cursorBurbuja = 0;
    this.nextBubble = 0;
    this.duckTimer = null;
    this.iconos = [];
    this.prompt = null;
    this.documentKey = (event) => {
      if (!this.escena?.sys?.isActive?.() || event.code !== 'KeyM') return;
      event.preventDefault();
      this.toggleSilencio();
    };
  }

  vincular(escena) { this.escena = escena; this.manager = escena.sound; }

  instalarDesbloqueo(escena, prompt) {
    this.vincular(escena);
    this.prompt = prompt || null;
    const desbloquear = () => this.desbloquear();
    escena.input?.once('pointerdown', desbloquear);
    escena.input?.keyboard?.once('keydown', desbloquear);
    document.addEventListener('keydown', this.documentKey, true);
    escena.events?.once('shutdown', () => {
      escena.input?.off('pointerdown', desbloquear);
      escena.input?.keyboard?.off('keydown', desbloquear);
      if (this.prompt === prompt) this.prompt = null;
      document.removeEventListener('keydown', this.documentKey, true);
      this.detenerSonificacion();
    });
  }

  async desbloquear() {
    if (this.despedido) return;
    this.desbloqueado = true;
    try { await this.manager?.context?.resume?.(); }
    catch (error) { console.warn('[AVISO AUDIO] El navegador no pudo activar el audio.', error); }
    this.prompt?.setVisible(false);
    this.iniciarMusicaDeseada();
  }

  actualizarDesbloqueo() {
    try {
      const pads = navigator.getGamepads?.() || [];
      const pulsado = [...pads].some((pad) => pad?.buttons?.some((boton) => boton?.pressed));
      if (pulsado && !this.ultimaEntradaGamepad) this.desbloquear();
      const select = [...pads].some((pad) => pad?.buttons?.[8]?.pressed);
      if (select && !this.ultimoSelect) this.toggleSilencio();
      this.ultimoSelect = select;
      this.ultimaEntradaGamepad = pulsado;
    } catch {}
  }

  setMusic(nombre) {
    this.musicaDeseada = nombre || null;
    if (this.desbloqueado) this.iniciarMusicaDeseada();
  }

  iniciarMusicaDeseada() {
    const nombre = this.musicaDeseada;
    if (!nombre || this.despedido || !this.escena?.cache?.audio?.exists(nombre)) return;
    if (this.musicaActual?.key === nombre && this.musicaActual.isPlaying) return;
    const anterior = this.musicaActual;
    let nueva;
    try {
      nueva = this.manager.add(nombre, { loop: true, volume: 0 });
      nueva.play();
    } catch (error) {
      console.warn(`[AVISO AUDIO] No se pudo iniciar ${nombre}; se mantiene el silencio.`, error);
      return;
    }
    this.musicaActual = nueva;
    this.fundido(nueva, 0, this.volumenFinal('musica'), 1000);
    if (anterior) this.fundido(anterior, anterior.volume, 0, 1000, () => anterior.stop());
  }

  fundido(sonido, desde, hasta, duracion, terminar) {
    const inicio = performance.now();
    const tick = () => {
      if (this.despedido || !sonido) { clearInterval(id); return; }
      const f = Math.min(1, (performance.now() - inicio) / duracion);
      try { sonido.setVolume(this.silencio ? 0 : desde + (hasta - desde) * f); }
      catch (error) { console.warn('[AVISO AUDIO] Falló un fundido de sonido.', error); }
      if (f >= 1) { clearInterval(id); terminar?.(); }
    };
    const id = setInterval(tick, 30);
  }

  volumenFinal(canal) { return this.silencio ? 0 : this.volumenes[canal] ?? 0; }

  setVolumen(canal, valor) {
    if (!(canal in INICIALES)) return;
    this.volumenes[canal] = Math.max(0, Math.min(1, Number(valor) || 0));
    try { guardarPreferencia(CLAVE_VOLUMEN, JSON.stringify(this.volumenes)); } catch {}
    if (canal === 'musica' && this.musicaActual) {
      try { this.musicaActual.setVolume(this.volumenFinal('musica')); } catch {}
    }
  }

  toggleSilencio() {
    this.silencio = !this.silencio;
    guardarPreferencia(CLAVE_SILENCIO, String(this.silencio));
    if (this.musicaActual) this.musicaActual.setVolume(this.volumenFinal('musica'));
    if (this.sonidoContextual) this.sonidoContextual.master.gain.setTargetAtTime(this.volumenFinal('sonificacion') * this.ultimoVolumenBurbuja, this.sonidoContextual.context.currentTime, .05);
    return this.silencio;
  }

  sonar(nombre, canal = nombre.startsWith('sfx_interfaz') ? 'interfaz' : 'efectos', { importante = false } = {}) {
    if (!this.desbloqueado || this.despedido || !this.escena?.cache?.audio?.exists(nombre)) return false;
    const activos = (this.sonidos.get(nombre) || []).filter((sonido) => sonido.isPlaying);
    this.sonidos.set(nombre, activos);
    if (activos.length >= 3) return false;
    try {
      const sonido = this.manager.add(nombre, { volume: this.volumenFinal(canal), detune: Phaser.Math.Between(-100, 100) });
      sonido.once('complete', () => sonido.destroy());
      activos.push(sonido);
      sonido.play();
      if (importante) this.duckMusica();
      return true;
    } catch (error) {
      console.warn(`[AVISO AUDIO] No se pudo reproducir ${nombre}.`, error);
      return false;
    }
  }

  duckMusica() {
    const sonido = this.musicaActual, contexto = this.manager?.context;
    if (!sonido || !contexto) return;
    const ganancia = sonido.volumeNode?.gain;
    if (ganancia?.setTargetAtTime) {
      ganancia.setTargetAtTime(this.volumenFinal('musica') * .6, contexto.currentTime, .05);
      clearTimeout(this.duckTimer);
      this.duckTimer = setTimeout(() => {
        try { ganancia.setTargetAtTime(this.volumenFinal('musica'), contexto.currentTime, .05); }
        catch {}
      }, 300);
    } else {
      sonido.setVolume(this.volumenFinal('musica') * .6);
      clearTimeout(this.duckTimer);
      this.duckTimer = setTimeout(() => sonido.setVolume(this.volumenFinal('musica')), 300);
    }
  }

  indicador(texto, habilitado = true) {
    if (!habilitado || this.despedido || !this.escena?.add) return;
    try {
      const icono = this.escena.add.text(1226, 104, `♪ ${texto}`, { fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '10px', color: '#F2E6C9', backgroundColor: 'rgba(28,32,38,.9)', padding: { x: 4, y: 2 } }).setOrigin(1, 0).setDepth(30);
      this.iconos.push(icono);
      this.escena.time.delayedCall(1400, () => { icono.destroy(); this.iconos = this.iconos.filter((x) => x !== icono); });
      this.escena.events.once('shutdown', () => { icono.destroy(); this.iconos = this.iconos.filter((x) => x !== icono); });
    } catch (error) { console.warn('[AVISO AUDIO] No se pudo mostrar el indicador de sonido.', error); }
  }

  iniciarSonificacion() {
    if (!this.desbloqueado || this.despedido || this.sonidoContextual || !this.manager?.context) return;
    try {
      const context = this.manager.context;
      const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
      const filtro = context.createBiquadFilter(); filtro.type = 'bandpass'; filtro.frequency.value = 400; filtro.Q.value = .9;
      const gain = context.createGain(); gain.gain.value = 0;
      const master = context.createGain(); master.gain.value = 0;
      source.connect(filtro); filtro.connect(gain); gain.connect(master); master.connect(context.destination); source.start();
      this.sonidoContextual = { context, source, filtro, gain, master };
      this.nextBubble = context.currentTime;
      this.ultimoVolumenBurbuja = 0;
      this.rateBurbuja = 2;
      this.tiempoRateAnterior = context.currentTime;
    } catch (error) { console.warn('[AVISO AUDIO] No se pudo crear la sonificación; el juego continúa sin burbujeo.', error); }
  }

  actualizarSonificacion(altura, caudalEntrada, pausado = false) {
    if (!this.desbloqueado || pausado) { this.detenerSonificacion(); return; }
    this.iniciarSonificacion();
    const s = this.sonidoContextual;
    if (!s) return;
    try {
      const now = s.context.currentTime;
      const h = Math.max(0, Math.min(3, altura));
      const q = Math.max(0, Math.min(.4, caudalEntrada));
      const rateSolicitada = 2 + 10 * q / .4;
      const dtRate = Math.max(0, now - this.tiempoRateAnterior);
      this.tiempoRateAnterior = now;
      this.rateBurbuja += (rateSolicitada - this.rateBurbuja) * (1 - Math.exp(-dtRate / .03));
      const rate = this.rateBurbuja;
      const volumen = (.2 + .8 * q / .4) * this.volumenFinal('sonificacion');
      s.filtro.frequency.setTargetAtTime(200 + 600 * h / 3, now, .03);
      this.ultimoVolumenBurbuja = .2 + .8 * q / .4;
      s.master.gain.setTargetAtTime(volumen, now, .05);
      if (now >= this.nextBubble) {
        s.gain.gain.cancelScheduledValues(now);
        s.gain.gain.setTargetAtTime(.7, now, .008);
        s.gain.gain.setTargetAtTime(.0001, now + .045, .012);
        this.nextBubble = now + 1 / rate;
      }
    } catch (error) { console.warn('[AVISO AUDIO] Falló la actualización de sonificación.', error); this.detenerSonificacion(); }
  }

  detenerSonificacion() {
    const s = this.sonidoContextual;
    if (!s) return;
    try { s.master.gain.setTargetAtTime(0, s.context.currentTime, .02); s.source.stop(s.context.currentTime + .08); }
    catch {}
    this.sonidoContextual = null;
  }

  destruir() {
    this.despedido = true;
    this.detenerSonificacion();
    clearTimeout(this.duckTimer);
    this.musicaActual?.stop();
    this.musicaActual?.destroy();
    this.musicaActual = null;
    for (const sonidos of this.sonidos.values()) sonidos.forEach((sonido) => { try { sonido.stop(); sonido.destroy(); } catch {} });
    this.sonidos.clear();
    this.iconos.forEach((icono) => icono.destroy());
    this.iconos = [];
  }
}

export function obtenerGestorAudio(escena) {
  return escena.registry.get('gestorAudio');
}

export { INICIALES as VOLUMENES_AUDIO_INICIALES };
