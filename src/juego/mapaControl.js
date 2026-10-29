export const MAPA_CONTROL = Object.freeze({
  v1: Object.freeze({ mano: 'der', senal: 'altura', gamepad: 'stick derecho vertical', teclado: 'flechas arriba/abajo' }),
  v2: Object.freeze({ mano: 'izq', senal: 'pellizco', gamepad: 'gatillo izquierdo', teclado: 'E aumenta / Q reduce' }),
  eventos: Object.freeze({
    puno: { gamepad: 'acción 1 / botón A', teclado: 'espacio' },
    dedos: { gamepad: 'cruceta (acciones 2–4)', teclado: 'teclas 1–5' },
    pausa: { gamepad: 'Start', teclado: 'Enter' },
    x: { gamepad: 'stick derecho horizontal', teclado: 'flechas izquierda/derecha' },
    giro: { gamepad: 'stick derecho horizontal', teclado: 'flechas izquierda/derecha' }
  })
});

export function leerSenal(controles, mapeo, campo = null, defecto = 0) {
  const mano = controles?.[mapeo.mano];
  const origen = campo ? mano?.[campo] : mano;
  const valor = origen?.[mapeo.senal];
  return Number.isFinite(valor) ? valor : defecto;
}

export function leerSenalSiPresente(controles, mapeo, campo, defecto, conservarAusente = false) {
  const mano = controles?.[mapeo.mano];
  if (conservarAusente && !mano?.presente) return defecto;
  return leerSenal(controles, mapeo, campo, defecto);
}
