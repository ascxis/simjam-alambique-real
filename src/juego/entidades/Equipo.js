// Máquina de estados del equipo principal (alambique). Lee el estado del modelo y los
// límites de docs/niveles.md; elige la animación y la alarma, y NUNCA escribe en el modelo.
//
//   apagado ──(q_in > 0)──> arranque ──(1,5 s)──> funcionando
//      ^                                   │  ^        │
//      └────────(q_in = 0 y h ≈ 0)─────────┘  │   (h ≥ 2,8)
//                                            (h < 2,7)  v
//                                              └──── alarma
//   cualquier estado ──(h ≥ 3,0, desborde)──> falla (se queda hasta reiniciar)
//
// La histéresis (entra en 2,8 m, sale en 2,7 m) evita que la alarma parpadee cuando el
// nivel ronda el límite.
import { LIMITES, UmbralHisteresis, velocidadFuncionando } from '../../hmi/representacion.js';

export const ESTADOS_EQUIPO = Object.freeze(['apagado', 'arranque', 'funcionando', 'falla', 'alarma']);

// Estado lógico -> hoja de sprites (docs/recursos.md: reposo 1, funcionando 4, falla 4, alarma 2).
const HOJA = { apagado: 'reposo', arranque: 'funcionando', funcionando: 'funcionando', falla: 'falla', alarma: 'alarma' };

export class Equipo {
  constructor({ duracionArranque = 1.5, qinMax = 0.4, limites = LIMITES } = {}) {
    this.duracionArranque = duracionArranque;
    this.qinMax = qinMax;
    this.limites = limites;
    this.hh = new UmbralHisteresis(limites.HH, limites.HH_sale);
    this.reiniciar();
  }

  reiniciar() {
    this.estado = 'apagado';
    this.tiempoEnEstado = 0;
    this.hh.reiniciar();
    this.cambios = 0;
  }

  /**
   * @param {number} dt     paso de tiempo de simulación (s)
   * @param {{h:number[], qin:number}} lectura  niveles del modelo y caudal de entrada
   * @returns {string} estado actual
   */
  actualizar(dt, { h, qin }) {
    const hMax = Math.max(...h);
    const alarmaHH = this.hh.actualizar(hMax);
    let siguiente = this.estado;
    if (this.estado === 'falla') siguiente = 'falla';
    else if (hMax >= this.limites.desborde) siguiente = 'falla';
    else if (alarmaHH) siguiente = 'alarma';
    else if (this.estado === 'alarma') siguiente = 'funcionando';
    else if (qin <= 1e-4 && hMax <= 0.02) siguiente = 'apagado';
    else if (this.estado === 'apagado') siguiente = qin > 1e-4 ? 'arranque' : 'apagado';
    else if (this.estado === 'arranque' && this.tiempoEnEstado + dt >= this.duracionArranque) siguiente = 'funcionando';
    if (siguiente !== this.estado) { this.estado = siguiente; this.tiempoEnEstado = 0; this.cambios += 1; }
    else this.tiempoEnEstado += dt;
    this.qin = qin;
    return this.estado;
  }

  /** Clave de la hoja de sprites que corresponde al estado. */
  hoja() { return HOJA[this.estado]; }

  /** timeScale de la animación: proporcional a q_in en "funcionando", lento en el arranque. */
  velocidad() {
    if (this.estado === 'arranque') return 0.5;
    if (this.estado === 'funcionando') return velocidadFuncionando(this.qin ?? 0, this.qinMax);
    return 1;
  }
}
