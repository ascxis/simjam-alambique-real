import { rk4 } from '../../modelo/integrador.js';

const PASO = 1 / 240;

/** Oscilador visual m·x'' + c·x' + k·x = 0, excitado con impulsos. */
export class ResorteVisual {
  constructor({ zeta = 0.3, frecuenciaHz = 2, masa = 1 } = {}) {
    this.masa = Math.max(1e-6, masa);
    this.omega = 2 * Math.PI * Math.max(.01, frecuenciaHz);
    this.zeta = Math.max(0, zeta);
    this.k = this.masa * this.omega ** 2;
    this.c = 2 * this.zeta * this.masa * this.omega;
    this.x = [0, 0];
    this.t = 0;
    this.acumulador = 0;
  }

  impulsar(impulso) {
    if (Number.isFinite(impulso)) this.x[1] += impulso / this.masa;
  }

  actualizar(dt) {
    if (Number.isFinite(dt) && dt > 0) this.acumulador += Math.min(dt, .1);
    let pasos = 0;
    while (this.acumulador >= PASO && pasos < 48) {
      this.x = rk4((estado) => [estado[1], -(this.c * estado[1] + this.k * estado[0]) / this.masa], this.x, [], this.t, PASO);
      this.t += PASO;
      this.acumulador -= PASO;
      pasos++;
    }
    if (Math.abs(this.x[0]) < 1e-7 && Math.abs(this.x[1]) < 1e-6) this.x = [0, 0];
    return this.x[0];
  }

  desplazamiento() { return this.x[0]; }
  velocidad() { return this.x[1]; }
  restablecer() { this.x = [0, 0]; this.t = 0; this.acumulador = 0; }
}
