export const MAPA_CONTROL = Object.freeze({
  actuadorU: Object.freeze({ mano: 'der', senal: 'altura' })
});

export function leerSenal(controles, mapeo, campo = null, defecto = 0) {
  const mano = controles?.[mapeo.mano];
  const origen = campo ? mano?.[campo] : mano;
  const valor = origen?.[mapeo.senal];
  return Number.isFinite(valor) ? valor : defecto;
}
