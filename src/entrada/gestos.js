const nuevaMano = () => ({ altura: 0.5, x: 0, pellizco: 0, giro: 0, puno: false, dedos: 0, presente: false, u_crudo: {} });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const centro = (p) => [0, 5, 9, 13, 17].reduce((s, i) => ({ x: s.x + p[i].x / 5, y: s.y + p[i].y / 5 }), { x: 0, y: 0 });
export class EntradaGestos {
  constructor({ alfa = 0.35, opciones = {}, emitir = () => {} } = {}) { this.alfa = alfa; this.opciones = opciones; this.emitir = emitir; this.controles = { der: nuevaMano(), izq: nuevaMano(), pausa: false }; this.cache = {}; this.tiempo = {}; this.punos = {}; this.dedosPendientes = {}; this.dedosTiempo = {}; this.ultimaMano = {}; this.zona = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 }; this.cargarCalibracion(); }
  cargarCalibracion() { try { this.calibracion = JSON.parse(localStorage.getItem('alambique.calibracion') || '{}'); } catch { this.calibracion = {}; } }
  guardarCalibracion() { try { localStorage.setItem('alambique.calibracion', JSON.stringify(this.calibracion)); } catch {} }
  procesar({ manos = [], tiempo = performance.now() }) {
    if (this.tiempoAnterior !== undefined) this.Ts = Math.max(0.001, (tiempo - this.tiempoAnterior) / 1000);
    this.tiempoAnterior = tiempo;
    for (const id of ['der', 'izq']) this.controles[id].presente = false;
    for (const hand of manos) {
      const { puntos: p, etiqueta: id } = hand; if (!p?.[20]) continue;
      const c = centro(p); if (c.x < .1 || c.x > .9 || c.y < .1 || c.y > .9) continue;
      const m = this.controles[id], raw = { altura: 1 - (c.y - .1) / .8, x: ((c.x - .1) / .8) * 2 - 1, pellizco: Math.min(1, dist(p[4], p[8]) / Math.max(.001, dist(p[0], p[9]))), giro: Math.max(-1, Math.min(1, Math.atan2(p[9].x - p[0].x, p[0].y - p[9].y) / (Math.PI / 4))) };
      this.ultimaMano[id] = tiempo; m.presente = true;
      for (const key of Object.keys(raw)) {
        const sinEscalar = raw[key]; m.medidaCruda ||= {}; m.medidaCruda[key] = sinEscalar;
        const cal = this.calibracion[id]?.[key]; if (cal && Number.isFinite(cal.min) && Number.isFinite(cal.max) && cal.max !== cal.min) raw[key] = Math.max(0, Math.min(1, (sinEscalar - cal.min) / (cal.max - cal.min)));
        m.u_crudo[key] = raw[key];
        const previo = this.cache[`${id}.${key}`] ?? raw[key]; const suavizado = previo + this.alfa * (raw[key] - previo); this.cache[`${id}.${key}`] = suavizado;
        const umbral = this.opciones.zonaMuerta ?? 0.015; m[key] = Math.abs(suavizado - (m[key] ?? suavizado)) < umbral ? m[key] : suavizado;
      }
      const cerrado = [8, 12, 16, 20].every((tip, i) => dist(p[tip], p[0]) < dist(p[[6, 10, 14, 18][i]], p[0]));
      if (cerrado !== this.punos[id]) { this.emitir(cerrado ? 'puno' : 'puno_fin', { mano: id }); this.punos[id] = cerrado; }
      let dedos = [8, 12, 16, 20].filter((tip, i) => dist(p[tip], p[0]) > dist(p[[6, 10, 14, 18][i]], p[0])).length;
      if (Math.abs(p[4].x - p[3].x) > Math.abs(p[4].y - p[3].y) * .5) dedos += (id === 'der' ? p[4].x < p[3].x : p[4].x > p[3].x) ? 1 : 0;
      if (this.dedosPendientes[id] !== dedos) { this.dedosPendientes[id] = dedos; this.dedosTiempo[id] = tiempo; }
      else if (tiempo - this.dedosTiempo[id] >= 300) { if (m.dedos !== dedos) this.emitir('dedos', { mano: id, valor: dedos }); m.dedos = dedos; }
    }
    return this.controles;
  }
  depuracion() { return { tau: -((this.Ts || 1 / 60) / Math.log(1 - this.alfa)), Ts: this.Ts || 1 / 60, alfa: this.alfa, controles: this.controles }; }
}
