export class Actuador {
  constructor({ minimo = 0, maximo = 1, velocidadMaxima = 0.25, inicial = minimo } = {}) {
    this.minimo = minimo; this.maximo = maximo; this.velocidadMaxima = velocidadMaxima;
    this.valor = this.limitar(inicial);
  }
  limitar(v) { return Math.max(this.minimo, Math.min(this.maximo, v)); }
  avanzar(mando, dt) {
    const objetivo = this.limitar(mando);
    const paso = Number.isFinite(this.velocidadMaxima) ? this.velocidadMaxima * Math.max(0, dt) : Infinity;
    this.valor += Math.max(-paso, Math.min(paso, objetivo - this.valor));
    return this.valor;
  }
  salida() { return this.valor; }
  reiniciar(valor = this.minimo) { this.valor = this.limitar(valor); }
}
