export class Registro {
  constructor({ frecuencia = 30, encabezados = ['t (s)', 'u_crudo (0-1)', 'u (0-1)', 'x1', 'x2', 'y'] } = {}) { this.periodo = 1 / frecuencia; this.encabezados = encabezados; this.filas = []; this.reloj = 0; }
  agregar(dt, muestra) { this.reloj += dt; if (this.reloj + 1e-9 < this.periodo) return false; this.reloj %= this.periodo; this.filas.push([muestra.t, muestra.u_crudo, muestra.u, ...(muestra.x || []), ...(Array.isArray(muestra.y) ? muestra.y : [muestra.y])]); return true; }
  csv() { const esc = (v) => String(v ?? '').replaceAll(';', ','); return [this.encabezados.join(';'), ...this.filas.map((f) => f.map(esc).join(';'))].join('\n'); }
  descargar(nombre = 'partida.csv') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + this.csv()], { type: 'text/csv;charset=utf-8' })); a.download = nombre; a.click(); URL.revokeObjectURL(a.href); }
}
