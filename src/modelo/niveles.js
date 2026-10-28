import niveles from './niveles.json' with { type: 'json' };

export function cargarNiveles() { return structuredClone(niveles); }
export function obtenerReferencia(nivel, t) { return nivel.cambioReferencia && t >= nivel.cambioReferencia.tiempo ? nivel.cambioReferencia.valor : nivel.referencia; }
export function obtenerPerturbacion(nivel, t) {
  const q = nivel.perturbacion;
  if (!q) return 0;
  if (q.tipo === 'escalon') return t >= q.desde && t < q.hasta ? q.valor : 0;
  if (q.tipo === 'senoidal') return q.amplitud * Math.sin(2 * Math.PI * t / q.periodo);
  return 0;
}
export function obtenerTolerancia(nivel, t) { const r = obtenerReferencia(nivel, t); return nivel.tolerancia.tipo === 'relativa' ? Math.abs(r) * nivel.tolerancia.fraccion : nivel.tolerancia.valor; }
export function evaluarNivel(nivel, muestras, alarmas = []) {
  const esDentro = (m) => Math.abs(m.y - obtenerReferencia(nivel, m.t)) <= obtenerTolerancia(nivel, m.t);
  let tiempoDentro = 0, tiempoTotal = 0;
  for (let i = 1; i < muestras.length; i++) {
    const dt = Math.max(0, muestras[i].t - muestras[i - 1].t);
    tiempoTotal += dt;
    if (esDentro(muestras[i])) tiempoDentro += dt;
  }
  const datos = nivel.criterio.tipo === 'consecutivo'
    ? (() => { let actual = 0, maximo = 0; for (let i = 1; i < muestras.length; i++) { const dt = Math.max(0, muestras[i].t - muestras[i - 1].t); actual = esDentro(muestras[i]) ? actual + dt : 0; maximo = Math.max(maximo, actual); } return { valor: maximo, requisito: nivel.criterio.segundos, unidad: 's', logrado: maximo >= nivel.criterio.segundos }; })()
    : { valor: tiempoTotal ? tiempoDentro / tiempoTotal * 100 : 0, requisito: nivel.criterio.porcentaje, unidad: '%', logrado: tiempoTotal > 0 && tiempoDentro / tiempoTotal * 100 >= nivel.criterio.porcentaje };
  const incumpleAlarma = nivel.falloAlarmaHH && alarmas.some((a) => a.tipo === 'HH');
  return { ...datos, superado: datos.logrado && !incumpleAlarma, texto: `${datos.valor.toFixed(1)} ${datos.unidad} / ${datos.requisito} ${datos.unidad}`, incumpleAlarma };
}
