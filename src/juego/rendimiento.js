// Ajuste del ritmo de cuadros de Phaser en tiempo de ejecución (etapa 8).
// El simulador apunta a 60 FPS. Con la cámara, MediaPipe comparte el hilo principal: si la
// detección promedia menos de 20 FPS, se baja el juego a 30 FPS y se reducen los efectos
// para dejarle tiempo a la detección. El modelo no cambia: el paso fijo h = 1/120 s del
// integrador da la misma respuesta con 30 o con 60 FPS (ver test/paso-fijo.test.js).

export const FPS_OBJETIVO = 60;
export const FPS_REDUCIDO = 30;
export const DETECCION_MINIMA = 20;

/** Cambia el límite de FPS del bucle de Phaser (0 = sin límite) y lo reinicia sin saltos. */
export function limitarFps(game, limite) {
  const loop = game?.loop;
  if (!loop || loop.fpsLimit === limite) return false;
  loop.fpsLimit = limite;
  loop.hasFpsLimit = limite > 0;
  loop._limitRate = limite > 0 ? 1000 / limite : 0;
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
