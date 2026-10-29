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

export function dibujarTanques(g, alturas, cantidad, { tanqueControlado = 0, referencia = null, tolerancia = 0, dentroBanda = false, overlay = null, conSprites = false, conSpritesValvula = false } = {}) {
  g.clear(); overlay?.clear();
  const cajas = obtenerCajasTanques(cantidad), capa = overlay || g;
  if (cantidad === 1) dibujarEntrada(capa, cajas[0], L.valvula1Solo);
  else {
    dibujarEntrada(capa, cajas[0], L.valvula1Cascada);
    const a = cajas[0], b = cajas[1], salidaX = a.x + a.w * .82, salidaY = a.y + a.h;
    const codoY = Math.max(salidaY + 22, b.y + 55), entradaX = b.x + b.w * .48, entradaY = b.y + 2;
    linea(capa, salidaX, salidaY - 3, salidaX, codoY);
    linea(capa, salidaX, codoY, entradaX, codoY);
    linea(capa, entradaX, codoY, entradaX, entradaY);
    const salida2X = b.x + b.w * .78, salida2Y = b.y + b.h;
    const valve = { x: L.valvula2Cascada.margenDerecho + L.planta.x + L.planta.ancho - L.valvula2Cascada.margenDerecho, y: salida2Y - L.valvula2Cascada.margenBase };
    linea(capa, salida2X, salida2Y - 2, salida2X, valve.y);
    linea(capa, salida2X, valve.y, valve.x, valve.y);
    if (!conSpritesValvula) {
      capa.lineStyle(2, 0xb85a24, 1).strokeCircle(valve.x, valve.y, 12);
      const giro = Math.PI * 1.5;
      for (let i = 0; i < 4; i++) capa.lineBetween(valve.x, valve.y, valve.x + Math.cos(giro + i * Math.PI / 2) * 10, valve.y + Math.sin(giro + i * Math.PI / 2) * 10);
    }
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
      for (const yy of [arriba, abajo]) capa.lineStyle(2, 0xe6e8ea, .95).lineBetween(visor.x - 1, yy, visor.x + visor.w + 1, yy);
      capa.lineStyle(2, 0xc9a227, 1).lineBetween(visor.x, yNivel(referencia, caja), visor.x + visor.w, yNivel(referencia, caja));
    }
    for (const [hAlarma, color] of [[2.4, 0xffd700], [2.8, 0xff1744]]) {
      const yy = yNivel(hAlarma, caja);
      capa.lineStyle(2, color, 1).lineBetween(visor.x + visor.w, yy, visor.x + visor.w + 9, yy);
    }
    for (let metro = 0; metro <= 3; metro++) {
      const yy = yNivel(metro, caja);
      capa.lineStyle(1, 0xe6e8ea, .8).lineBetween(visor.x + visor.w, yy, visor.x + visor.w + (metro ? 7 : 10), yy);
    }
  });
  return cajas;
}

function dibujarEntrada(g, caja, cfg) {
  const valveY = caja.y - cfg.margenTanque, valveX = caja.x + caja.w / 2;
  linea(g, valveX, cfg.tuboDesdeY, valveX, valveY - 18);
  linea(g, valveX, valveY + 18, valveX, caja.y + 4);
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
  const v1 = { x: cajas[0].x + cajas[0].w / 2, y: cajas[0].y - cfg.margenTanque };
  const v2 = cantidad === 2 ? { x: L.planta.x + L.planta.ancho - L.valvula2Cascada.margenDerecho, y: cajas[1].y + cajas[1].h - L.valvula2Cascada.margenBase } : null;
  const alarmas = cajas.map((c, i) => {
    const l = cantidad === 2 ? (i === 0 ? L.etiqueta1Cascada : L.etiqueta2Cascada) : L.etiquetaSolo;
    return { x: l.x + 20, y: l.y + 20 };
  });
  return { v1, v2, alarmas };
}
export function posicionAyudaCascada() { return { x: L.footer.ayuda?.x ?? L.simulacion.ayuda.x, y: L.simulacion.ayuda.y }; }
