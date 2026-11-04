import { animacionEquipo } from '../animaciones.js';

const Q_IN_MAX = 0.4;
const UMBRAL_ALARMA_ENTRA = 2.8;
const UMBRAL_ALARMA_SALE = 2.7;
const UMBRAL_FALLA = 3;
const TIEMPO_ARRANQUE = 0.8;

/** Máquina de estados visual. Solo lee el modelo y nunca modifica su estado. */
export class Equipo {
  constructor(scene, sprite, { familia = 'alambique-simple' } = {}) {
    this.scene = scene;
    this.sprite = sprite;
    this.familia = familia;
    this.estado = 'apagado';
    this.fallaLatched = false;
    this.alarmaLatched = false;
    this.alarmas = [];
    this.tiempoArranque = 0;
    this.actualizar({ alturas: [], qIn: 0, dt: 0 });
  }

  actualizar({ alturas = [], qIn = 0, dt = 0 } = {}) {
    const alturaMaxima = alturas.reduce((max, valor) => Math.max(max, Number(valor) || 0), 0);
    this.alarmas = alturas.map((valor, i) => {
      const h = Number(valor) || 0, previa = this.alarmas[i];
      if (previa === 'HH' && h >= UMBRAL_ALARMA_SALE) return 'HH';
      if (h >= UMBRAL_ALARMA_ENTRA) return 'HH';
      if (previa === 'H' && h >= 2.3) return 'H';
      if (h >= 2.4) return 'H';
      return null;
    });
    if (alturaMaxima >= UMBRAL_FALLA) this.fallaLatched = true;

    if (this.fallaLatched) {
      this.cambiarEstado('falla');
      return this.estado;
    }

    if (this.alarmaLatched) {
      if (alturaMaxima < UMBRAL_ALARMA_SALE) this.alarmaLatched = false;
    } else if (alturaMaxima >= UMBRAL_ALARMA_ENTRA) {
      this.alarmaLatched = true;
    }
    if (this.alarmaLatched) {
      this.cambiarEstado('alarma');
      return this.estado;
    }

    const activo = Number.isFinite(qIn) && qIn > 1e-5;
    if (!activo) {
      this.tiempoArranque = 0;
      this.cambiarEstado('apagado');
    } else if (this.estado === 'apagado') {
      this.tiempoArranque = 0;
      this.cambiarEstado('arranque');
    } else if (this.estado === 'arranque') {
      this.tiempoArranque += Math.max(0, Number(dt) || 0);
      if (this.tiempoArranque >= TIEMPO_ARRANQUE) this.cambiarEstado('funcionando');
    } else if (this.estado !== 'funcionando') {
      this.cambiarEstado('funcionando');
    }

    if (this.sprite?.anims?.currentAnim && this.estado === 'funcionando') {
      const escala = 0.5 + 1.5 * Math.max(0, Math.min(1, qIn / Q_IN_MAX));
      this.sprite.anims.timeScale = escala;
    } else if (this.sprite?.anims?.currentAnim && this.estado === 'arranque') {
      this.sprite.anims.timeScale = 0.5;
    }
    return this.estado;
  }

  cambiarEstado(estado) {
    if (estado === this.estado) return;
    this.estado = estado;
    if (!this.sprite) return;
    const animacion = animacionEquipo(this.familia, estado);
    if (this.scene.anims.exists(animacion)) {
      this.sprite.anims.timeScale = 1;
      this.sprite.play(animacion, true);
      if (estado === 'arranque') this.sprite.anims.timeScale = 0.5;
    } else if (estado === 'apagado') {
      const reposo = animacionEquipo(this.familia, 'apagado');
      if (this.scene.textures.exists(reposo)) this.sprite.setTexture(reposo, 0);
    }
  }
}
