import { rk4 } from './integrador.js';

export class SistemaContinuo {
  constructor({ f, g = (x) => [...x], p = {}, x0 = [0], metodo = 'rk4', paso = 1 / 120, matrices } = {}) {
    if (!f && matrices) {
      f = (x, u) => matrices.A.map((row, i) => row.reduce((s, a, j) => s + a * x[j], 0) + (matrices.B[i] || []).reduce((s, b, j) => s + b * (u[j] ?? u), 0));
      g = (x, u) => matrices.C.map((row, i) => row.reduce((s, c, j) => s + c * x[j], 0) + (matrices.D?.[i] || []).reduce((s, d, j) => s + d * (u[j] ?? u), 0));
    }
    if (typeof f !== 'function') throw new TypeError('SistemaContinuo requiere f(x,u,t,p) o matrices.');
    this.f = f; this.g = g; this.p = p; this.x = [...x0]; this.metodo = metodo; this.paso = paso;
    this.t = 0; this.acumulador = 0; this.ultimoU = 0;
  }
  avanzar(u, dt) {
    const seguro = Math.min(Math.max(0, dt), 0.1); this.acumulador += seguro; this.ultimoU = u;
    const integrar = this.metodo === 'euler' ? (x, t, h) => x.map((v, i) => v + h * this.f(x, u, t, this.p)[i]) : (x, t, h) => rk4(this.f, x, u, t, h, this.p);
    while (this.acumulador + 1e-12 >= this.paso) { this.x = integrar(this.x, this.t, this.paso); this.t += this.paso; this.acumulador -= this.paso; }
    return this.salida(u);
  }
  salida(u = this.ultimoU) { return this.g(this.x, u, this.t, this.p); }
  reiniciar(x0) { this.x = [...x0]; this.t = 0; this.acumulador = 0; }
}
