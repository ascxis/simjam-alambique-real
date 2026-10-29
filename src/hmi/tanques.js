import { LAYOUT, obtenerCajasTanques } from './layout.js';

const { simulacion: L } = LAYOUT;
const ALTURA_CUADRO = 300;
const VISOR_SUPERIOR = 77;
const VISOR_INFERIOR = 200;
const limitar = (n) => Math.max(0, Math.min(3, Number(n) || 0));

function limites(caja) {
  const escala = caja.h / ALTURA_CUADRO;
  return { top: caja.y + VISOR_SUPERIOR * escala, bottom: caja.y + VISOR_INFERIOR * escala };
}
function yNivel(valor, caja) {
  const v = limites(caja);
  return v.bottom - (v.bottom - v.top) * limitar(valor) / 3;
}
function vidrio(caja, conSprites) {
  const v = limites(caja);
  return conSprites
    ? { x: caja.x + caja.w * .45, w: caja.w * .08, ...v }
    : { x: caja.x + caja.w * .35, w: caja.w * .30, ...v };
}
function linea(g, x1, y1, x2, y2, width = 7, color = 0x4a5056) {
  g.lineStyle(width + 4, 0x1a1b1d, 1).lineBetween(x1, y1, x2, y2);
  g.lineStyle(width, color, 1).lineBetween(x1, y1, x2, y2);
}

export function dibujarTanques(g, alturas, cantidad, { tanqueControlado = 0, referencia = null, tolerancia = 0, dentroBanda = false, overlay = null, tuberias = null, conSprites = false, conSpritesValvula = false } = {}) {
  g.clear(); overlay?.clear();
  const cajas = obtenerCajasTanques(cantidad), capaMarcas = overlay || g, tubos = tuberias || g;
  if (tuberias) tuberias.clear();
  if (cantidad === 1) dibujarEntrada(tubos, cajas[0], L.valvula1Solo, conSpritesValvula);
  else {
    dibujarEntrada(tubos, cajas[0], L.valvula1Cascada, conSpritesValvula);
    // q12 sale del costado inferior, rodea el pedestal y entra desde arriba en el segundo tanque.
    const a = cajas[0], b = cajas[1];
    const salidaX = a.x + a.w - 2, salidaY = a.y + a.h - 4;
    const codoY = L.tuberiaQ12.codoY, bypassX = b.x - L.tuberiaQ12.margenTanque2;
    const arribaY = b.y - L.tuberiaQ12.margenSuperior;
    const entradaX = b.x + b.w / 2, entradaY = b.y + 2;
    linea(tubos, salidaX, salidaY, salidaX, codoY);
    linea(tubos, salidaX, codoY, bypassX, codoY);
    linea(tubos, bypassX, codoY, bypassX, arribaY);
    linea(tubos, bypassX, arribaY, entradaX, arribaY);
    linea(tubos, entradaX, arribaY, entradaX, entradaY);

    const salida2X = b.x + b.w, salida2Y = b.y + b.h - 4;
    const valve = L.valvula2Cascada;
    linea(tubos, salida2X, salida2Y, salida2X, valve.y);
    linea(tubos, salida2X, valve.y, valve.x - L.valvulaSprite.cuerpo / 2, valve.y);
    linea(tubos, valve.x + L.valvulaSprite.cuerpo / 2, valve.y, L.planta.x + L.planta.ancho, valve.y);
    if (!conSpritesValvula) dibujarValvulaFallback(tubos, valve.x, valve.y, 1);
  }

  cajas.forEach((caja, i) => {
    const h = limitar(alturas[i]), visor = vidrio(caja, conSprites), controlado = i === tanqueControlado;
    if (!conSprites) {
      g.fillStyle(0x34383b).fillRoundedRect(caja.x, caja.y, caja.w, caja.h, 18);
      g.fillStyle(0x171b1f).fillRoundedRect(visor.x, visor.top, visor.w, visor.bottom - visor.top, 7);
      g.lineStyle(2, 0xb85a24, 1).strokeRoundedRect(caja.x, caja.y, caja.w, caja.h, 18);
    }
    const nivelY = yNivel(h, caja);
    g.fillStyle(controlado && dentroBanda ? 0x00e676 : 0x2ecc71, .98).fillRect(visor.x + 1, nivelY, visor.w - 2, Math.max(0, visor.bottom - nivelY));
    if (controlado && Number.isFinite(referencia)) {
      const arriba = yNivel(referencia + tolerancia, caja), abajo = yNivel(referencia - tolerancia, caja);
      g.fillStyle(0xb7bdc2, .3).fillRect(visor.x, arriba, visor.w, abajo - arriba);
      for (const yy of [arriba, abajo]) capaMarcas.lineStyle(2, 0xe6e8ea, .95).lineBetween(visor.x - 1, yy, visor.x + visor.w + 1, yy);
      capaMarcas.lineStyle(2, 0xc9a227, 1).lineBetween(visor.x, yNivel(referencia, caja), visor.x + visor.w, yNivel(referencia, caja));
    }
    for (const [hAlarma, color] of [[2.4, 0xffd700], [2.8, 0xff1744]]) {
      const yy = yNivel(hAlarma, caja);
      capaMarcas.lineStyle(2, color, 1).lineBetween(visor.x + visor.w, yy, visor.x + visor.w + 9, yy);
    }
    for (let metro = 0; metro <= 3; metro++) {
      const yy = yNivel(metro, caja);
      capaMarcas.lineStyle(1, 0xe6e8ea, .8).lineBetween(visor.x + visor.w, yy, visor.x + visor.w + (metro ? 7 : 10), yy);
    }
  });
  return cajas;
}

function dibujarEntrada(g, caja, cfg, conSpritesValvula) {
  const valveX = cfg.x, tubeY = cfg.tuboY, centroTanque = caja.x + caja.w / 2;
  const radio = L.valvulaSprite.cuerpo / 2;
  linea(g, L.planta.x, tubeY, valveX - radio, tubeY);
  linea(g, valveX + radio, tubeY, centroTanque, tubeY);
  linea(g, centroTanque, tubeY, centroTanque, caja.y + 3);
  if (!conSpritesValvula) dibujarValvulaFallback(g, valveX, tubeY, 0);
}

function dibujarValvulaFallback(g, x, y, apertura) {
  const radioCuerpo = L.valvulaSprite.cuerpo / 2, radioVolante = L.valvulaSprite.volante / 2;
  g.fillStyle(0x4a5056, 1).fillCircle(x, y, radioCuerpo);
  g.lineStyle(3, 0x1a1b1d, 1).strokeCircle(x, y, radioCuerpo);
  g.lineStyle(3, 0xb85a24, 1).strokeCircle(x, y, radioVolante);
  const giro = Math.max(0, Math.min(1, apertura)) * Math.PI * 1.5;
  for (let k = 0; k < 4; k++) {
    const a = giro + k * Math.PI / 2;
    g.lineBetween(x, y, x + Math.cos(a) * (radioVolante - 2), y + Math.sin(a) * (radioVolante - 2));
  }
}

export function posicionEscalaTanque(indice, metro, cantidad = 1) {
  const caja = obtenerCajasTanques(cantidad)[indice], visor = vidrio(caja, true);
  return { x: visor.x + visor.w + 12, y: yNivel(metro, caja) - 8 };
}
export function posicionSpriteTanque(indice, cantidad = 1) {
  const c = obtenerCajasTanques(cantidad)[indice];
  return { x: c.x + c.w / 2, y: c.y + c.h / 2, ancho: c.w, alto: c.h };
}
export function posicionSpritesValvulas(cantidad = 1) {
  const cajas = obtenerCajasTanques(cantidad), cfg = cantidad === 2 ? L.valvula1Cascada : L.valvula1Solo;
  const v1 = { x: cfg.x, y: cfg.y };
  const v2 = cantidad === 2 ? { x: L.valvula2Cascada.x, y: L.valvula2Cascada.y } : null;
  const alarmas = cajas.map((_, i) => {
    const a = cantidad === 2 ? (i === 0 ? L.alarma1Cascada : L.alarma2Cascada) : L.alarmaSolo;
    return { x: a.x + a.tamano / 2, y: a.y + a.tamano / 2 };
  });
  return { v1, v2, alarmas };
}
