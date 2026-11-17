export const contextoJuego = {
  camara: null,
  gestor: null,
  fuenteElegida: null,
  nivelElegido: 1
};

export const FUENTES_CONTROL = ['camara', 'gamepad', 'teclado', 'escalon'];

// Fuente de control con la que arranca el menú. Se recuerda la última que se usó en esta sesión del juego
// (el módulo vive mientras la página esté abierta, así que al recargar vuelve a 'camara'). Antes de haber elegido
// algo, manda el parámetro ?control= de la URL y, si no hay, la cámara.
export function fuenteInicial(solicitada, recordada) {
  if (FUENTES_CONTROL.includes(recordada)) return recordada;
  return FUENTES_CONTROL.includes(solicitada) ? solicitada : 'camara';
}
