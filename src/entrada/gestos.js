import { crearManoControl } from './controles.js';

const nuevaMano = () => crearManoControl();
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const centro = (p) => [0, 5, 9, 13, 17].reduce((s, i) => ({ x: s.x + p[i].x / 5, y: s.y + p[i].y / 5 }), { x: 0, y: 0 });
export class EntradaGestos {
  constructor({ alfa = null, opciones = {}, emitir = () => {} } = {}) {
    let alfaGuardado = null;
    try {
      const guardado = localStorage.getItem('alambique.alfa');
      alfaGuardado = guardado === null ? null : Number(guardado);
      if (!Number.isFinite(alfaGuardado) || alfaGuardado <= 0 || alfaGuardado >= 1) {
        alfaGuardado = 0.5;
        localStorage.setItem('alambique.alfa', '0.5');
      }
    } catch {}
    this.alfa = Number.isFinite(alfa) && alfa > 0 && alfa < 1 ? alfa : Number.isFinite(alfaGuardado) && alfaGuardado > 0 && alfaGuardado < 1 ? alfaGuardado : 0.5;
    this.opciones = opciones; this.emitir = emitir; this.controles = { der: nuevaMano(), izq: nuevaMano(), pausa: false }; this.cache = {}; this.tiempo = {}; this.punos = {}; this.dedosPendientes = {}; this.dedosTiempo = {}; this.ultimaMano = {}; this.calibracionAvisada = new Set(); this.zona = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
    this.muestrasFiltro = { 'der.altura': [], 'izq.pellizco': [] };
    this.estadosMedicion = { 'der.altura': { reposo: [], movimiento: null, esperasFiltro: [] }, 'izq.pellizco': { reposo: [], movimiento: null, esperasFiltro: [] } };
    this.retrasos = { 'der.altura': { ultimo: null, ultimosCinco: [], n: 0 }, 'izq.pellizco': { ultimo: null, ultimosCinco: [], n: 0 } };
    this.cargarCalibracion();
  }
  cargarCalibracion() { try { this.calibracion = JSON.parse(localStorage.getItem('alambique.calibracion') || '{}'); } catch { this.calibracion = {}; } }
  guardarCalibracion() { try { localStorage.setItem('alambique.calibracion', JSON.stringify(this.calibracion)); } catch {} }
  procesar({ manos = [], tiempo = performance.now() }) {
    if (this.tiempoAnterior !== undefined) this.Ts = Math.max(0.001, (tiempo - this.tiempoAnterior) / 1000);
    this.tiempoAnterior = tiempo;
    for (const id of ['der', 'izq']) this.controles[id].presente = false;
    for (const hand of manos) {
      const { puntos: p, etiqueta: id } = hand; if (!p?.[20]) continue;
      const c = centro(p); if (c.x < .1 || c.x > .9 || c.y < .1 || c.y > .9) continue;
      // x y giro usan la imagen espejada que ve el jugador; MediaPipe entrega puntos sin espejo.
      const giroEspejado = -Math.atan2(p[9].x - p[0].x, p[0].y - p[9].y);
      const xEspejo = -(((c.x - .1) / .8) * 2 - 1);
      const m = this.controles[id], raw = { altura: 1 - (c.y - .1) / .8, x: xEspejo, pellizco: Math.min(1, dist(p[4], p[8]) / Math.max(.001, dist(p[0], p[9]))), giro: Math.max(-1, Math.min(1, giroEspejado / (Math.PI / 4))) };
      this.ultimaMano[id] = tiempo; m.presente = true;
      for (const key of Object.keys(raw)) {
        const sinEscalar = raw[key]; m.medidaCruda ||= {}; m.medidaCruda[key] = sinEscalar;
        const cal = this.calibracion[id]?.[key];
        if (cal) {
          const diferencia = cal.max - cal.min;
          const minimoDeCalibracion = key === 'altura' || key === 'pellizco' ? 0.05 : 0;
          const rangoValido = Number.isFinite(cal.min) && Number.isFinite(cal.max) && (minimoDeCalibracion === 0.05 ? Math.abs(diferencia) >= minimoDeCalibracion : Math.abs(diferencia) > 0);
          if (rangoValido) raw[key] = Math.max(0, Math.min(1, (sinEscalar - cal.min) / diferencia));
          else {
            const claveAviso = `${id}.${key}`;
            if (!this.calibracionAvisada.has(claveAviso)) {
              console.warn(`[CALIBRACIÓN] Rango ${claveAviso} inválido (min=${cal.min}, max=${cal.max}); se usará el gesto sin calibrar para este canal.`);
              this.calibracionAvisada.add(claveAviso);
            }
          }
        }
        m.u_crudo[key] = raw[key];
        const canal = `${id}.${key}`, previo = this.cache[canal] ?? raw[key]; const suavizado = previo + this.alfa * (raw[key] - previo); this.cache[canal] = suavizado;
        if (this.muestrasFiltro[canal]) {
          const historial = this.muestrasFiltro[canal];
          historial.push({ t: tiempo, valor: suavizado });
          while (historial.length && tiempo - historial[0].t > 2000) historial.shift();
          this.actualizarMedicionMovimiento(canal, tiempo, raw[key], suavizado);
        }
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
  actualizarMedicionMovimiento(canal, tiempo, crudo, filtrado) {
    const estado = this.estadosMedicion[canal];
    estado.esperasFiltro = estado.esperasFiltro.filter((espera) => {
      const anterior = espera.ultimoFiltro;
      if ((anterior.valor - espera.umbral90) * espera.direccion < 0 && (filtrado - espera.umbral90) * espera.direccion >= 0) {
        const cruceFiltro = anterior.t + (tiempo - anterior.t) * (espera.umbral90 - anterior.valor) / (filtrado - anterior.valor);
        this.registrarRetraso(canal, cruceFiltro - espera.tiempoCrudo90);
        return false;
      }
      espera.ultimoFiltro = { t: tiempo, valor: filtrado };
      return tiempo - espera.tiempoCrudo90 < 5000;
    });
    const reposo = estado.reposo;
    while (reposo.length && tiempo - reposo[0].t > 500) reposo.shift();
    if (!estado.movimiento) {
      if (reposo.length >= 2 && tiempo - reposo[0].t >= 450) {
        const reposoMedio = reposo.reduce((suma, muestra) => suma + muestra.crudo, 0) / reposo.length;
        if (Math.abs(crudo - reposoMedio) > 0.05) {
          estado.movimiento = { base: reposoMedio, muestras: [{ t: tiempo, crudo, filtrado }] };
          estado.reposo = [];
          return;
        }
      }
      reposo.push({ t: tiempo, crudo, filtrado });
      return;
    }

    const movimiento = estado.movimiento;
    movimiento.muestras.push({ t: tiempo, crudo, filtrado });
    // Incluye hasta un periodo de muestreo para que la ventana cubra 300 ms
    // incluso cuando los cuadros llegan, por ejemplo, cada 62 ms.
    const ventanaQuietudMs = 300 + (this.Ts || 1 / 60) * 1000;
    const ventanaQuietud = movimiento.muestras.filter((muestra) => tiempo - muestra.t <= ventanaQuietudMs);
    if (ventanaQuietud.length < 2 || tiempo - ventanaQuietud[0].t < 295) return;
    const valoresVentana = ventanaQuietud.map((muestra) => muestra.crudo);
    if (Math.max(...valoresVentana) - Math.min(...valoresVentana) >= 0.03) return;

    const extremo = movimiento.muestras.reduce((mejor, muestra) => Math.abs(muestra.crudo - movimiento.base) > Math.abs(mejor.crudo - movimiento.base) ? muestra : mejor, movimiento.muestras[0]);
    const salto = extremo.crudo - movimiento.base;
    if (Math.abs(salto) > 0.4) {
      const umbral90 = movimiento.base + salto * 0.9;
      const tiempoCrudo90 = tiempoCruce(movimiento.muestras, 'crudo', umbral90, Math.sign(salto));
      const tiempoFiltrado90 = tiempoCruce(movimiento.muestras, 'filtrado', umbral90, Math.sign(salto));
      if (Number.isFinite(tiempoCrudo90)) {
        if (Number.isFinite(tiempoFiltrado90)) this.registrarRetraso(canal, tiempoFiltrado90 - tiempoCrudo90);
        else estado.esperasFiltro.push({ umbral90, direccion: Math.sign(salto), tiempoCrudo90, ultimoFiltro: movimiento.muestras.at(-1) && { t: movimiento.muestras.at(-1).t, valor: movimiento.muestras.at(-1).filtrado } });
      }
    }
    estado.reposo = ventanaQuietud.map((muestra) => ({ ...muestra }));
    estado.movimiento = null;
  }
  registrarRetraso(canal, retrasoMs) {
    const medicion = this.retrasos[canal];
    medicion.ultimo = retrasoMs;
    medicion.ultimosCinco.push(retrasoMs);
    if (medicion.ultimosCinco.length > 5) medicion.ultimosCinco.shift();
    medicion.n++;
  }
  depuracion() {
    const Ts = this.Ts || 1 / 60;
    const canales = Object.fromEntries(Object.entries(this.muestrasFiltro).map(([canal, muestras]) => {
      const valores = muestras.map((m) => m.valor), ruido = valores.length ? Math.max(...valores) - Math.min(...valores) : 0;
      const retrasos = this.retrasos[canal].ultimosCinco;
      return [canal, { ruido, n: this.retrasos[canal].n, ultimoRetraso: this.retrasos[canal].ultimo, retrasoPromedio: retrasos.length ? retrasos.reduce((a, b) => a + b, 0) / retrasos.length : null }];
    }));
    return { tau: -((Ts / Math.log(1 - this.alfa))), Ts, alfa: this.alfa, controles: this.controles, canales };
  }
}

function tiempoCruce(muestras, clave, umbral, direccion) {
  for (let i = 1; i < muestras.length; i++) {
    const anterior = muestras[i - 1], actual = muestras[i];
    if ((anterior[clave] - umbral) * direccion < 0 && (actual[clave] - umbral) * direccion >= 0) {
      const amplitud = actual[clave] - anterior[clave];
      const fraccion = Math.abs(amplitud) < 1e-12 ? 0 : (umbral - anterior[clave]) / amplitud;
      return anterior.t + (actual.t - anterior.t) * fraccion;
    }
  }
  return NaN;
}
