import { LAYOUT } from '../hmi/layout.js';
import { crearBoton, dibujarPanel } from '../hmi/estilo.js';
import { obtenerGestorAudio } from './audio.js';
import { CAPAS_FONDO, PROFUNDIDAD, apagarCapa } from './niveles/escenario.js';

export class EscenaBase extends Phaser.Scene {
  constructor(key) { super(key); }

  // Fondo fijo: capa lejana y capa media a pantalla completa, y viñeta oscura en los bordes.
  // { cercana: true } agrega la capa cercana completa detrás de los paneles (solo el menú: en la
  // simulación se usan trozos de ella en huecos de la planta, ver Simulacion.crearCapaCercana).
  crearFondo({ cercana = false } = {}) {
    const { ancho, alto } = LAYOUT.canvas;
    this.cameras.main.setBackgroundColor('#1C2026');
    const capa = (c, profundidad) => (this.textures.exists(c.clave)
      ? apagarCapa(this.add.image(ancho / 2, alto / 2, c.clave).setDisplaySize(ancho, alto).setDepth(profundidad), c)
      : null);
    this.fondoLejano = capa(CAPAS_FONDO.lejana, PROFUNDIDAD.fondo);
    this.fondoMedio = capa(CAPAS_FONDO.media, PROFUNDIDAD.fondoMedio);
    if (cercana) this.fondoCercano = capa(CAPAS_FONDO.cercana, PROFUNDIDAD.cercanaMenu);
    this.vineta = this.add.graphics().setDepth(PROFUNDIDAD.vineta);
    const { viñeta } = LAYOUT.fondo;
    for (const banda of viñeta.slice(0, 4)) {
      const x = banda.ancho;
      this.vineta.fillStyle(0x050608, banda.alpha).fillRect(0, 0, x, alto);
      this.vineta.fillRect(ancho - x, 0, x, alto);
    }
    for (const banda of viñeta.slice(4)) {
      const y = banda.alto;
      this.vineta.fillStyle(0x050608, banda.alpha).fillRect(0, 0, ancho, y);
      this.vineta.fillRect(0, alto - y, ancho, y);
    }
  }

  panel(rect, opciones) { return dibujarPanel(this, rect, opciones); }
  boton(rect, texto, callback, opciones) {
    const normalizado = texto.toLowerCase();
    const clave = normalizado.includes('iniciar') || normalizado.includes('descargar') || normalizado.includes('aplicar')
      ? 'sfx_interfaz_aceptar'
      : normalizado.includes('volver') || normalizado.includes('omitir')
        ? 'sfx_interfaz_cancelar'
        : 'sfx_interfaz_clic';
    return crearBoton(this, rect, texto, (...args) => {
      const audio = obtenerGestorAudio(this);
      audio?.desbloquear();
      audio?.sonar(clave, 'interfaz');
      callback?.(...args);
    }, opciones);
  }
}
