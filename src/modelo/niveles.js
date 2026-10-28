import niveles from './niveles.json';
export const cargarNiveles = async () => niveles.map((n) => structuredClone(n));
export function evaluarNivel(nivel, muestras, { desborde = false, alarmaHH = false } = {}) {
  const dentro = muestras.filter((m) => Math.abs((Array.isArray(m.y) ? m.y.at(-1) : m.y) - nivel.referencia) <= nivel.banda).length;
  const fraccion = muestras.length ? dentro / muestras.length : 0;
  const consecutivo = muestras.reduce((acc, m) => Math.abs((Array.isArray(m.y) ? m.y.at(-1) : m.y) - nivel.referencia) <= nivel.banda ? acc + 1 : 0, 0);
  const gana = nivel.criterio.tipo === 'consecutivo' ? consecutivo >= nivel.criterio.segundos * 30 : fraccion * 100 >= nivel.criterio.porcentaje;
  return { superado: gana && !desborde && (nivel.id !== 2 || !alarmaHH), fraccion, consecutivo };
}
