export function calcularMetricas(muestras, { referencia = 0, banda = 0.02, objetivoFinal = referencia } = {}) {
  if (!muestras.length) return { valorFinal: 0, Mp: 0, ts: null, IAE: 0, ISE: 0, tiempoEnBanda: 0 };
  let iae = 0, ise = 0, dentro = 0, ts = null, max = -Infinity, picoPendiente = true;
  for (let i = 0; i < muestras.length; i++) {
    const a = muestras[i], y = Number(Array.isArray(a.y) ? a.y[0] : a.y), e = referencia - y;
    max = Math.max(max, y);
    if (i) { const prev = muestras[i - 1], py = Number(Array.isArray(prev.y) ? prev.y[0] : prev.y), dt = a.t - prev.t; iae += Math.abs(referencia - (y + py) / 2) * dt; ise += ((referencia - (y + py) / 2) ** 2) * dt; }
    const enBanda = Math.abs(e) <= banda; if (enBanda) dentro += i ? a.t - muestras[i - 1].t : 0;
    if (ts === null && enBanda && muestras.slice(i).every((m) => Math.abs(referencia - Number(Array.isArray(m.y) ? m.y[0] : m.y)) <= banda)) ts = a.t;
  }
  const amplitud = Math.abs(objetivoFinal - (Number(Array.isArray(muestras[0].y) ? muestras[0].y[0] : muestras[0].y)));
  const mp = amplitud ? Math.max(0, (max - objetivoFinal) / amplitud * 100) : 0;
  return { valorFinal: Number(Array.isArray(muestras.at(-1).y) ? muestras.at(-1).y[0] : muestras.at(-1).y), Mp: picoPendiente ? mp : 0, ts, IAE: iae, ISE: ise, tiempoEnBanda: dentro };
}
