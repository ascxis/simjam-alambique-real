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

// Fondo en tres capas fijas de 1280x720 (guía 2: tabla 5.2, 5.3 paso 4 y etapa 5). La cámara
// no se mueve, así que no hay parallax: las capas solo dan profundidad. Se generan con
// `npm run fondos` (scripts/procesar_fondos.py) desde arte_fuente/originales/.
// Colores apagados y menos contraste que la HMI: cada capa lleva un tinte (multiplica el color;
// funciona en WebGL y en Canvas) y una desaturación (preFX, solo WebGL; -1 = gris).
export const CAPAS_FONDO = Object.freeze({
  lejana: { clave: 'fondo-lejano', archivo: 'assets/fondos/fondo_lejano.png', tinte: 0xffffff, saturacion: 0 },
  media: { clave: 'fondo-medio', archivo: 'assets/fondos/fondo_medio.png', tinte: 0x8a827c, saturacion: -0.5 },
  cercana: { clave: 'fondo-cercano', archivo: 'assets/fondos/fondo_cercano.png', tinte: 0x9a9088, saturacion: -0.3 },
});

/** Aplica el tinte y la desaturación de una capa de CAPAS_FONDO a una imagen de Phaser. */
export function apagarCapa(imagen, capa) {
  if (!imagen) return imagen;
  if (capa.tinte !== 0xffffff) imagen.setTint(capa.tinte);
  if (capa.saturacion) imagen.preFX?.addColorMatrix().saturate(capa.saturacion);
  return imagen;
}

// Capa cercana en la simulación: dibujada completa taparía la planta (cadenas sobre la entrada
// de v1 y el alambique; velas sobre la mesa, el caldero y la franja de perturbación). Por eso se
// usan solo trozos de ella (recorte en la imagen de 1280x720) puestos en huecos libres de la
// planta de cada nivel (destino = esquina superior izquierda). Las cadenas cuelgan desde el borde
// inferior de la barra superior (y = 82, debajo de su borde) y cada gancho termina antes de la primera pieza.
const CADENA_IZQ = { x: 145, ancho: 46, fin: 322 };   // cadena con gancho del lado izquierdo
const CADENA_DER = { x: 1172, ancho: 44, fin: 322 };  // cadena con gancho del lado derecho
const cadena = (c, destinoX, largo) => ({
  recorte: { x: c.x, y: c.fin - largo, ancho: c.ancho, alto: largo },
  destino: { x: destinoX, y: 82 },
});
export const CERCANA_NIVEL = {
  // entre los soportes de la tubería de v1 (gancho en y 172; la tubería empieza en y 178) y
  // sobre el alambique, a la derecha de la bajada de v1 (gancho en y 202; la cúpula, en y 235)
  1: [cadena(CADENA_IZQ, 200, 90), cadena(CADENA_DER, 365, 120)],
  2: [cadena(CADENA_IZQ, 200, 90), cadena(CADENA_DER, 365, 120)],
  // columna izquierda libre (las etiquetas empiezan en x 95), encima de la entrada de v1
  // (que empieza en y 175) y una vela alta en la esquina de abajo a la izquierda
  3: [
    cadena(CADENA_IZQ, 30, 200),
    cadena(CADENA_DER, 570, 85),
    { recorte: { x: 76, y: 440, ancho: 66, alto: 220 }, destino: { x: 22, y: 430 } },
  ],
};

// Zonas de la planta que la capa cercana no puede tapar (medidas en las capturas de cada nivel,
// con margen): entrada de v1, alambique, tuberías, mesa, caldero, llave o tubería de
// perturbación y su franja de aviso. test/escenario-rendimiento.test.js comprueba que ningún
// trozo de CERCANA_NIVEL las toque.
export const ZONAS_MODELO_NIVEL = {
  1: [
    { nombre: 'volante y soporte de v1', x: 15, y: 136, ancho: 75, alto: 74 },
    { nombre: 'tubería de v1', x: 15, y: 172, ancho: 330, alto: 30 },
    { nombre: 'soportes de la tubería de v1', x: 174, y: 80, ancho: 14, alto: 100 },
    { nombre: 'soporte derecho de la tubería de v1', x: 274, y: 80, ancho: 14, alto: 100 },
    { nombre: 'bajada de v1 al alambique', x: 316, y: 180, ancho: 24, alto: 60 },
    { nombre: 'etiqueta y placa de alarma', x: 428, y: 92, ancho: 206, alto: 44 },
    { nombre: 'alambique', x: 236, y: 230, ancho: 190, alto: 295 },
    { nombre: 'salida y tubería al caldero', x: 392, y: 400, ancho: 210, alto: 145 },
    { nombre: 'mesa', x: 130, y: 462, ancho: 395, alto: 190 },
    { nombre: 'caldero', x: 530, y: 515, ancho: 110, alto: 137 },
  ],
  3: [
    { nombre: 'alambique en cascada', x: 280, y: 120, ancho: 165, alto: 405 },
    { nombre: 'entrada v1 (volante y tubería)', x: 420, y: 168, ancho: 222, alto: 56 },
    { nombre: 'etiquetas de los alambiques y de q12', x: 92, y: 215, ancho: 140, alto: 250 },
    { nombre: 'tubo q12 y llave lateral', x: 215, y: 265, ancho: 80, alto: 240 },
    { nombre: 'salida v2 y tubería de intercambio', x: 420, y: 418, ancho: 135, alto: 120 },
    { nombre: 'mesa', x: 130, y: 462, ancho: 395, alto: 190 },
    { nombre: 'caldero', x: 480, y: 530, ancho: 115, alto: 122 },
    { nombre: 'franja de perturbación', x: 98, y: 598, ancho: 382, alto: 52 },
  ],
};
// Nivel 2: la misma planta que el nivel 1 más la llave de consumo, el frasco que recibe su
// chorro y la franja de aviso.
ZONAS_MODELO_NIVEL[2] = [
  ...ZONAS_MODELO_NIVEL[1],
  { nombre: 'llave de consumo y su chorro', x: 170, y: 355, ancho: 80, alto: 170 },
  { nombre: 'franja de perturbación', x: 98, y: 598, ancho: 382, alto: 52 },
];

// Ambiente: capa de color semitransparente según la zona del laboratorio y partículas
// lentas de polvo (máximo 30). Baja el contraste de las capas del fondo para que la planta y la
// HMI se lean primero, sin dejarlo negro.
export const AMBIENTE_NIVEL = {
  1: { color: 0x1a1008, alfa: 0.22, nombre: 'taller a la luz de las velas' },
  2: { color: 0x14120a, alfa: 0.24, nombre: 'bodega del caldero real' },
  3: { color: 0x0e0a1a, alfa: 0.28, nombre: 'torre de noche' },
};
export const POLVO_MAXIMO = 30;

/** Comprueba que la matriz sea rectangular y use índices válidos de la hoja 8x4. */
export function validarMatriz(matriz, total = 32) {
  const ancho = matriz[0]?.length ?? 0;
  return matriz.length > 0 && matriz.every((fila) => fila.length === ancho && fila.every((v) => Number.isInteger(v) && v >= -1 && v < total));
}

// Orden de profundidad (setDepth) de todo el juego, de atrás hacia adelante:
// lejana, media, baldosas, decoraciones, equipo y piezas del modelo, perturbaciones, efectos,
// capa cercana y HMI.
export const PROFUNDIDAD = Object.freeze({
  fondo: -1000, fondoMedio: -995, vineta: -990,
  // en el menú la capa cercana va completa, detrás de los paneles (no hay planta que tapar)
  cercanaMenu: -980,
  baldosas: -40, decoraciones: -30, ambiente: -20, polvo: -15,
  // objetos apoyados sobre la mesa o el piso: delante de la mesa (-0,8) y detrás del equipo (-0,5)
  decoracionesApoyadas: -0.79,
  // equipo y piezas del modelo: -1,1 a 4 · perturbaciones: -0,6 a 3,2 · efectos: 3,9 a 4,8
  efectos: 4.8,
  primerPlano: 4.9, hmi: 5,
});
