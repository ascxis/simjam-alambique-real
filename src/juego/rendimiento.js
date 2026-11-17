// Ajuste del ritmo de cuadros de Phaser en tiempo de ejecución (etapa 8).
// El simulador apunta a 60 FPS. Con la cámara, MediaPipe comparte el hilo principal: si la
// detección promedia menos de 20 FPS, se baja el juego a 30 FPS y se reducen los efectos
// para dejarle tiempo a la detección. El modelo no cambia: el paso fijo h = 1/120 s del
// integrador da la misma respuesta con 30 o con 60 FPS (ver test/paso-fijo.test.js).

export const FPS_OBJETIVO = 60;
export const FPS_REDUCIDO = 30;
export const DETECCION_MINIMA = 20;

// Margen del límite de FPS. En Phaser 3.87, TimeStep.stepLimitFPS dibuja un cuadro cuando el tiempo
// acumulado llega a 1000/límite ms y luego lo deja en 0 (sin guardar el sobrante). Con vsync los
// refrescos duran 16,66 ± 0,1 ms (60 Hz) o 5,555 ms (180 Hz, tres = 16,665 ms): cuando quedan
// apenas por debajo de 16,667 ms se pierde el cuadro y el juego va a 40-52 FPS en vez de 60.
// Con 1 ms de margen un refresco de 60 Hz (o tres de 180 Hz) siempre alcanza, y dos de 180 Hz
// (11,1 ms) no, así que el tope sigue siendo 60.
export const MARGEN_LIMITE_MS = 1;

/** Umbral en ms entre cuadros para un límite de FPS (0 = sin límite). */
export function intervaloLimite(limite) {
  return limite > 0 ? 1000 / limite - MARGEN_LIMITE_MS : 0;
}

/** Cambia el límite de FPS del bucle de Phaser (0 = sin límite) y lo reinicia sin saltos. */
export function limitarFps(game, limite) {
  const loop = game?.loop;
  if (!loop || (loop.fpsLimit === limite && loop._limitRate === intervaloLimite(limite))) return false;
  loop.fpsLimit = limite;
  loop.hasFpsLimit = limite > 0;
  loop._limitRate = intervaloLimite(limite);
  loop.sleep();
  loop.wake(true);
  return true;
}

/**
 * Decide si hay que reducir la carga: devuelve true cuando la detección lleva al menos
 * 'esperaMs' activa y su promedio está bajo el mínimo.
 */
export function debeReducir({ camaraActiva, fpsDeteccion, msActiva, esperaMs = 5000, minimo = DETECCION_MINIMA }) {
  return Boolean(camaraActiva) && msActiva >= esperaMs && Number.isFinite(fpsDeteccion) && fpsDeteccion > 0 && fpsDeteccion < minimo;
}
