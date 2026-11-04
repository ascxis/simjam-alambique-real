// Retardo elegido: 2 s, mayor que el mínimo de 0,54 s (2 × (161 + 111) ms),
// para dar tiempo a reaccionar al control con la mano.
export const AVISO_PERTURBACION_MS = 2000;

export function instantesInicioPerturbacion(nivel) {
  const p = nivel?.perturbacion;
  if (!p) return [];
  if (p.tipo === 'escalon') return [p.desde].filter((t) => Number.isFinite(t) && t <= nivel.duracion);
  if (p.tipo === 'senoidal') {
    const salida = [];
    for (let t = 0; t <= nivel.duracion; t += p.periodo) salida.push(t);
    return salida;
  }
  return [];
}

export function faseVisualPerturbacion(nivel, tiempo) {
  const p = nivel?.perturbacion;
  if (!p) return 'cerrada';
  if (p.tipo === 'escalon') {
    const aviso = AVISO_PERTURBACION_MS / 1000;
    if (tiempo >= p.desde && tiempo < p.hasta) return 'abierta';
    if (tiempo >= p.desde - aviso && tiempo < p.desde) return 'aviso';
    return 'cerrada';
  }
  if (p.tipo === 'senoidal') {
    const periodo = p.periodo;
    const siguienteInicio = Math.ceil((tiempo + 1e-9) / periodo) * periodo;
    const aviso = AVISO_PERTURBACION_MS / 1000;
    if (siguienteInicio > 0 && tiempo >= siguienteInicio - aviso && tiempo < siguienteInicio) return 'aviso';
    return Math.sin(2 * Math.PI * tiempo / periodo) > 0 ? 'abierta' : 'cerrada';
  }
  return 'cerrada';
}
