// Escenario del laboratorio (etapa 5): matriz de baldosas, decoraciones animadas y
// ambiente por nivel. Solo es decoración: las piezas del modelo (líquido, chorros, volantes)
// se siguen dibujando desde el estado del modelo y nunca se vuelven baldosas.
//
// Hoja public/assets/tiles/laboratorio_tiles.png: 8x4 baldosas de 32x32 px.
//   fila 0 (0-7): losas y paneles de piso · fila 1 (8-15): muro de piedra
//   fila 2 (16-23): tuberías de cobre     · fila 3 (24-31): pasarelas
// -1 = vacío.

export const TAM_BALDOSA = 32;

// Zócalo de piedra detrás de la mesa y piso de losas, a lo ancho de la planta (20 columnas).
// Muro: se alternan las variantes 8-15 para que no se vea repetido; piso: 0-7.
const muro = (desfase) => Array.from({ length: 20 }, (_, i) => 8 + ((i * 3 + desfase) % 8));
const piso = Array.from({ length: 20 }, (_, i) => [0, 1, 4, 0, 6, 1, 0, 3][i % 8]);
export const MATRIZ_LABORATORIO = [muro(0), muro(5), piso];

// Origen de la matriz en pantalla: el piso empieza en y = 650 (línea del piso de LAYOUT).
export const ORIGEN_BALDOSAS = { x: 16, y: 650 - 2 * TAM_BALDOSA };

// Decoraciones animadas (4 cuadros de 64x64 en el atlas 'piezas'); (x, y) = punto de apoyo
// abajo al centro. Solo objetos que tienen sentido en un laboratorio: velas encendidas y un
// frasco. No se ponen cerca de las tuberías para que no parezcan parte de la planta. Los
// engranajes quedan en el atlas y en la Galería, pero no en la planta (flotaban sin mecanismo).
// bajoLlave: en el nivel 2 el frasco recibe el chorro de la llave de consumo (q_d).
export const DECORACIONES_NIVEL = {
  1: [{ deco: 'vela', x: 168, y: 519, tam: 44 }, { deco: 'frasco', x: 66, y: 650, tam: 46 }],
  2: [{ deco: 'vela', x: 66, y: 650, tam: 44 }, { deco: 'frasco', x: 217, y: 519, tam: 48, bajoLlave: true }],
  3: [{ deco: 'vela', x: 168, y: 519, tam: 44 }],
};

// Ambiente: capa de color semitransparente según la zona del laboratorio y partículas
// lentas de polvo (máximo 30).
export const AMBIENTE_NIVEL = {
  // El fondo pintado tiene su propio alambique, frascos y estantes: se oscurece lo suficiente
  // para que no se confundan con la planta del modelo.
  1: { color: 0x1a1008, alfa: 0.42, nombre: 'taller a la luz de las velas' },
  2: { color: 0x14120a, alfa: 0.44, nombre: 'bodega del caldero real' },
  3: { color: 0x0e0a1a, alfa: 0.48, nombre: 'torre de noche' },
};
export const POLVO_MAXIMO = 30;

/** Comprueba que la matriz sea rectangular y use índices válidos de la hoja 8x4. */
export function validarMatriz(matriz, total = 32) {
  const ancho = matriz[0]?.length ?? 0;
  return matriz.length > 0 && matriz.every((fila) => fila.length === ancho && fila.every((v) => Number.isInteger(v) && v >= -1 && v < total));
}

// Orden de profundidad (setDepth) de todo el juego, de atrás hacia adelante.
export const PROFUNDIDAD = Object.freeze({
  fondo: -1000, vineta: -990, baldosas: -40, decoraciones: -30, ambiente: -20, polvo: -15,
  // objetos apoyados sobre la mesa o el piso: delante de la mesa (-0,8) y detrás del equipo (-0,5)
  decoracionesApoyadas: -0.79,
  // equipo y piezas del modelo: -1,1 a 4 · perturbaciones: -0,6 a 3,2 · efectos: 3,9 a 5,8
  primerPlano: 4.9, hmi: 5,
});
