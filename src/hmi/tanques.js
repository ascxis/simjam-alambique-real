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
function linea(g, x1, y1, x2, y2, width = L.tuberia.ancho) {
  g.lineStyle(width + L.tuberia.borde * 2, 0x1a1b1d, 1).lineBetween(x1, y1, x2, y2);
  g.lineStyle(width, 0xb85a24, 1).lineBetween(x1, y1, x2, y2);
  g.lineStyle(L.tuberia.brillo, 0xe6a06d, .9).lineBetween(x1, y1, x2, y2);
}

export function dibujarTuberia(g, puntos, ancho = L.tuberia.ancho) {
  for (let i = 1; i < puntos.length; i++) linea(g, puntos[i - 1].x, puntos[i - 1].y, puntos[i].x, puntos[i].y, ancho);
  for (let i = 1; i < puntos.length - 1; i++) {
    const { x, y } = puntos[i];
    g.fillStyle(0x1a1b1d).fillCircle(x, y, (ancho + 4) / 2);
    g.fillStyle(0xb85a24).fillCircle(x, y, ancho / 2);
    g.fillStyle(0xe6a06d, .9).fillCircle(x, y, 1.1);
  }
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

export function convertirVisoresCascada(caja, metadatos) {
  const visores = metadatos?.visores || {
    superior: { x: .404, y: .160, ancho: .038, alto: .227 },
    inferior: { x: .404, y: .638, ancho: .038, alto: .225 },
  };
  return Object.fromEntries(Object.entries(visores).map(([nombre, v]) => [nombre, {
    x: caja.x + v.x * caja.w,
    y: caja.y + v.y * caja.h,
    w: v.ancho * caja.w,
    h: v.alto * caja.h,
  }]));
}

export function dibujarLiquidosCascada(liquido, visores, alturas, referencia, tolerancia, dentroBanda) {
  liquido.clear();
  if (!visores?.superior || !visores?.inferior) return;
  const nivel = (visor, h) => visor.y + visor.h * (1 - limitar(h) / 3);
  for (const [clave, indice] of [['superior', 0], ['inferior', 1]]) {
    const v = visores[clave], y = nivel(v, alturas[indice] ?? 0);
    liquido.fillStyle(indice === 1 && dentroBanda ? 0x00e676 : 0x2ecc71, .98)
      .fillRect(v.x + 1, y, Math.max(1, v.w - 2), Math.max(0, v.y + v.h - y));
    if (clave === 'inferior' && Number.isFinite(referencia)) {
      const superior = nivel(v, referencia + tolerancia), inferior = nivel(v, referencia - tolerancia);
      liquido.fillStyle(0xb7bdc2, .32).fillRect(v.x + 1, superior, Math.max(1, v.w - 2), inferior - superior);
      liquido.lineStyle(1, 0xe6e8ea, .95).lineBetween(v.x, superior, v.x + v.w, superior);
      liquido.lineStyle(1, 0xe6e8ea, .95).lineBetween(v.x, inferior, v.x + v.w, inferior);
      liquido.lineStyle(1, 0xc9a227, 1).lineBetween(v.x, nivel(v, referencia), v.x + v.w, nivel(v, referencia));
    }
    for (const [h, color] of [[2.4, 0xffd700], [2.8, 0xff1744]]) {
      const yy = nivel(v, h);
      liquido.lineStyle(2, color, 1).lineBetween(v.x + v.w - 5, yy, v.x + v.w, yy);
    }
  }
}

function dibujarEntrada(g, caja, cfg, conSpritesValvula) {
  const valveX = cfg.x, tubeY = cfg.tuboY, centroTanque = caja.x + caja.w / 2;
  const radio = cfg.tuboSemiancho ?? 25;
  dibujarTuberia(g, [{ x: L.planta.x, y: tubeY }, { x: valveX - radio, y: tubeY }], L.tuberia.ancho);
  dibujarTuberia(g, [
    { x: valveX + radio, y: tubeY }, { x: centroTanque, y: tubeY },
    { x: caja.x + cfg.domeXRel * caja.w, y: caja.y + caja.h * cfg.domeYRel },
  ], L.tuberia.ancho);
  if (!conSpritesValvula) dibujarValvulaFallback(g, valveX, cfg.y, 0);
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
