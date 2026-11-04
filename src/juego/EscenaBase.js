import { LAYOUT } from '../hmi/layout.js';
import { crearBoton, dibujarPanel } from '../hmi/estilo.js';
import { obtenerGestorAudio } from './audio.js';

export class EscenaBase extends Phaser.Scene {
  constructor(key) { super(key); }

  crearFondo() {
    const { ancho, alto } = LAYOUT.canvas;
    this.cameras.main.setBackgroundColor('#1C2026');
    if (this.textures.exists('fondo-laboratorio')) {
      this.fondoArte = this.add.image(ancho / 2, alto / 2, 'fondo-laboratorio')
        .setDisplaySize(ancho, alto).setDepth(-1000);
    }
    this.vineta = this.add.graphics().setDepth(-990);
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
