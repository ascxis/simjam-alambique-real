const COLOR_POCION = 0x2ecc71;
const COLOR_BANDA = 0x00e676;
const ALTO_CUADRO = 300;
const VISOR_SUPERIOR = 77;
const VISOR_INFERIOR = 200;

function geometria(indice, cantidad) {
  if (cantidad === 2) {
    return indice === 0
      ? { x: 30, y: 140, w: 358, h: 500 }
      : { x: 405, y: 215, w: 358, h: 500 };
  }
  return { x: 80, y: 150, w: 358, h: 500 };
}

function alturaLimitada(valor) { return Math.max(0, Math.min(3, Number(valor) || 0)); }
function limitesVisor(caja) {
  const escala = caja.h / ALTO_CUADRO;
  return { top: caja.y + VISOR_SUPERIOR * escala, bottom: caja.y + VISOR_INFERIOR * escala };
}
function yNivel(valor, caja) {
  const visor = limitesVisor(caja);
  return visor.bottom - (visor.bottom - visor.top) * alturaLimitada(valor) / 3;
}
function cajaVidrio(caja, conSprites) {
  return conSprites
    ? { x: caja.x + caja.w * .45, w: caja.w * .08, ...limitesVisor(caja) }
    : { x: caja.x + caja.w * .35, w: caja.w * .30, ...limitesVisor(caja) };
}

export function dibujarTanques(g, alturas, cantidad, {
  tanqueControlado = 0, referencia = null, tolerancia = 0, dentroBanda = false,
  aperturaV1 = 0, aperturaV2 = 1, overlay = null, conSprites = false, conSpritesValvula = false,
} = {}) {
  g.clear();
  overlay?.clear();
  const cajas = Array.from({ length: cantidad }, (_, i) => geometria(i, cantidad));
  const capaTuberias = overlay || g;

  dibujarEntrada(capaTuberias, cajas[0], conSpritesValvula);
  if (cantidad === 2) dibujarTuberiaCascada(capaTuberias, cajas[0], cajas[1], aperturaV2, !conSpritesValvula);

  cajas.forEach((caja, i) => {
    const nivel = alturaLimitada(alturas[i]);
    const controlado = i === tanqueControlado;
    const colorLiquido = controlado && dentroBanda ? COLOR_BANDA : COLOR_POCION;
    const visor = cajaVidrio(caja, conSprites);

    // El Graphics ocupa el visor transparente del sprite; conserva la misma escala 0–3 m.
    if (!conSprites) {
      g.fillStyle(0x8a4829).fillRoundedRect(caja.x, caja.y, caja.w, caja.h, 18);
      g.fillStyle(0xcbd0d1, .96).fillRoundedRect(visor.x, visor.top, visor.w, visor.bottom - visor.top, 12);
    }
    const nivelY = yNivel(nivel, caja);
    g.fillStyle(colorLiquido, .96).fillRect(visor.x + 2, nivelY, visor.w - 4, Math.max(0, visor.bottom - nivelY));

    if (controlado && Number.isFinite(referencia)) {
      const bandaY = yNivel(Math.min(3, referencia + tolerancia), caja);
      const bandaAbajoY = yNivel(Math.max(0, referencia - tolerancia), caja);
      g.fillStyle(COLOR_BANDA, .30).fillRect(visor.x + 1, bandaY, visor.w - 2, bandaAbajoY - bandaY);
      for (const yy of [bandaY, bandaAbajoY]) {
        capaTuberias.lineStyle(3, 0x1a1b1d, .9).lineBetween(visor.x, yy, visor.x + visor.w, yy);
        capaTuberias.lineStyle(1, 0xffffff, 1).lineBetween(visor.x, yy, visor.x + visor.w, yy);
      }
      const yRef = yNivel(referencia, caja);
      capaTuberias.lineStyle(2, 0x604b27, 1).lineBetween(visor.x, yRef, visor.x + visor.w, yRef);
    }

    if (!conSprites) {
      g.lineStyle(2, 0x1a1b1d, 1).strokeRoundedRect(caja.x, caja.y, caja.w, caja.h, 18);
      g.fillStyle(0xb85a24).fillRoundedRect(caja.x - 3, caja.y + 6, caja.w + 6, 18, 8);
      g.fillStyle(0xb85a24).fillRoundedRect(caja.x - 3, caja.y + caja.h - 24, caja.w + 6, 18, 8);
    }

    // Marcas H/HH y escala comparten exactamente la conversión aplicada al líquido.
    for (const [altura, color] of [[2.4, 0xffd700], [2.8, 0xff1744]]) {
      const yy = yNivel(altura, caja);
      capaTuberias.lineStyle(3, color, 1).lineBetween(visor.x + visor.w, yy, visor.x + visor.w + 13, yy);
    }
    for (let metro = 0; metro <= 3; metro++) {
      const yy = yNivel(metro, caja);
      capaTuberias.lineStyle(1, 0x4c5a5e, .95).lineBetween(visor.x - 7, yy, visor.x, yy);
    }
  });

  // Respaldo para el volante de v1 si falta alguno de sus sprites.
  if (!conSpritesValvula) dibujarVolante(capaTuberias, cajas[0].x + cajas[0].w * .085, cajas[0].y + cajas[0].h * .05, aperturaV1, 8);
}

function dibujarEntrada(g, caja, conSpritesValvula) {
  const y = caja.y + caja.h * .05;
  const centro = caja.x + caja.w * .085;
  const segmentos = conSpritesValvula
    ? [[Math.max(0, centro - 60), centro - 23], [centro + 23, caja.x + caja.w * .18]]
    : [[Math.max(0, caja.x - 55), centro + 20]];
  for (const [x1, x2] of segmentos) {
    g.lineStyle(9, 0x1a1b1d, 1).lineBetween(x1, y, x2, y);
    g.lineStyle(5, 0x4a5056, 1).lineBetween(x1, y, x2, y);
  }
  const entradaSuperiorX = caja.x + caja.w * .18;
  g.lineStyle(9, 0x1a1b1d, 1).lineBetween(entradaSuperiorX, y, entradaSuperiorX, caja.y);
  g.lineStyle(5, 0x4a5056, 1).lineBetween(entradaSuperiorX, y, entradaSuperiorX, caja.y);
}

function dibujarTuberiaCascada(g, primero, segundo, aperturaV2, volanteGeometrico) {
  const salidaX = primero.x + primero.w - 10;
  const salidaY = primero.y + primero.h;
  const xRiser = segundo.x - 8;
  const entradaX = segundo.x + segundo.w * .45;
  const entradaY = segundo.y;
  const codoY = salidaY + 10;
  g.lineStyle(10, 0x1a1b1d, 1);
  g.lineBetween(salidaX, salidaY, salidaX, codoY);
  g.lineBetween(salidaX, codoY, xRiser, codoY);
  g.lineBetween(xRiser, codoY, xRiser, entradaY);
  g.lineBetween(xRiser, entradaY, entradaX, entradaY);
  g.lineStyle(6, 0x4a5056, 1);
  g.lineBetween(salidaX, salidaY, salidaX, codoY);
  g.lineBetween(salidaX, codoY, xRiser, codoY);
  g.lineBetween(xRiser, codoY, xRiser, entradaY);
  g.lineBetween(xRiser, entradaY, entradaX, entradaY);

  // Válvula v2 colocada a la salida inferior derecha del alambique 2.
  const salida2X = segundo.x + segundo.w * .76;
  const salida2Y = segundo.y + segundo.h;
  const valvulaX = salida2X + 19, valvulaY = salida2Y - 25;
  g.lineStyle(9, 0x1a1b1d, 1).lineBetween(salida2X, salida2Y - 3, salida2X, valvulaY);
  g.lineStyle(5, 0x4a5056, 1).lineBetween(salida2X, salida2Y - 3, salida2X, valvulaY);
  g.lineStyle(8, 0x1a1b1d, 1).lineBetween(salida2X, valvulaY, valvulaX, valvulaY);
  g.lineStyle(4, 0x4a5056, 1).lineBetween(salida2X, valvulaY, valvulaX, valvulaY);
  if (volanteGeometrico) dibujarVolante(g, valvulaX, valvulaY, aperturaV2, 10);
}

function dibujarVolante(g, x, y, apertura, radio) {
  g.lineStyle(3, 0x1a1b1d, 1).strokeCircle(x, y, radio);
  const giro = Math.max(0, Math.min(1, apertura)) * Math.PI * 1.5;
  for (let k = 0; k < 4; k++) {
    const a = giro + k * Math.PI / 2;
    g.lineBetween(x, y, x + Math.cos(a) * (radio - 2), y + Math.sin(a) * (radio - 2));
  }
}

export function posicionEscalaTanque(indice, metro, cantidad = 1, conSprites = true) {
  const caja = geometria(indice, cantidad), visor = cajaVidrio(caja, conSprites);
  return { x: visor.x - 8, y: yNivel(metro, caja) - 9 };
}

export function posicionSpriteTanque(indice, cantidad = 1) {
  const caja = geometria(indice, cantidad);
  return { x: caja.x + caja.w / 2, y: caja.y + caja.h / 2, ancho: caja.w, alto: caja.h };
}

export function posicionSpritesValvulas(cantidad = 1) {
  const cajas = Array.from({ length: cantidad }, (_, i) => geometria(i, cantidad));
  return {
    v1: { x: cajas[0].x + cajas[0].w * .085, y: cajas[0].y + cajas[0].h * .05 },
    v2: cantidad === 2
      ? { x: cajas[1].x + cajas[1].w * .76 + 19, y: cajas[1].y + cajas[1].h - 25 }
      : null,
    alarmas: cajas.map((caja) => ({ x: caja.x + caja.w * .81, y: caja.y + caja.h * .17 })),
  };
}

export function posicionAyudaCascada() { return { x: 775, y: 105 }; }
