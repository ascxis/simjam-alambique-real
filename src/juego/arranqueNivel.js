// Arranque de una partida: el mismo camino para el botón "Iniciar simulación" del menú y para
// "Repetir nivel" / "Siguiente nivel" de la pantalla final.
//   1. El nivel queda en contextoJuego.nivelElegido (Simulacion lo lee en create()).
//   2. Si la fuente elegida es la cámara, se reanuda la sesión de cámara: CamaraManos.iniciar
//      reutiliza el stream y el detector si la cámara es la misma (no vuelve a pedir permiso ni
//      hay que recalibrar; la calibración vive en el gestor de entrada y en las preferencias).
//   3. Se arranca la escena Simulacion, que crea su GestorEntrada con contextoJuego.fuenteElegida.
import { contextoJuego } from './contexto.js';
import { leerPreferencia } from './preferencias.js';
import { obtenerSesionCamara } from '../vision/servicioCamara.js';
import { obtenerVideoPreview } from '../hmi/vistaCamara.js';

/**
 * Inicia o reanuda la detección de manos. deviceId: el del menú (null = cámara predeterminada);
 * si no se indica, se usa la cámara que ya estaba abierta o la guardada en las preferencias.
 */
export async function activarCamaraJuego({ deviceId, intercambiar } = {}) {
  const camara = obtenerSesionCamara();
  if (intercambiar !== undefined) camara.intercambiar = intercambiar;
  const id = deviceId !== undefined ? deviceId : camara.stream ? camara.deviceId : leerPreferencia('alambique.cameraId', '') || null;
  await camara.iniciar(obtenerVideoPreview(), id || undefined, { numHands: 2 }); // siempre 2 manos (ver Menu)
  obtenerVideoPreview().style.display = 'block';
  return camara;
}

/** Arranca la partida del nivel indicado con la fuente de control ya elegida. */
export async function arrancarNivel(escena, nivelId, { activarCamara = activarCamaraJuego } = {}) {
  contextoJuego.nivelElegido = Number(nivelId) || 1;
  if (contextoJuego.fuenteElegida === 'camara') await activarCamara();
  escena.scene.start('Simulacion');
}
