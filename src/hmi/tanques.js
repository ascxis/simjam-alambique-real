const colorNivel = 0x71858b;

function geometria(indice, cantidad) {
  if (cantidad === 2) {
    return indice === 0
      ? { x: 70, y: 100, w: 165, h: 230 }
      : { x: 360, y: 345, w: 165, h: 230 };
  }
  return { x: 115, y: 190, w: 215, h: 300 };
}

function limitarAltura(valor) { return Math.max(0, Math.min(3, Number(valor) || 0)); }
function yNivel(valor, caja) {
  const ventana = caja.h * 0.49;
  const base = caja.y + caja.h * 0.79;
  return base - ventana * limitarAltura(valor) / 3;
}

export function dibujarTanques(g, alturas, cantidad, {
  tanqueControlado = 0, referencia = null, tolerancia = 0, dentroBanda = false, aperturaV2 = 1,
  overlay = null, conSprites = false, aperturaV1 = 0,
} = {}) {
  g.clear();
  overlay?.clear();
  const cascada = cantidad === 2;
  const cajas = Array.from({ length: cantidad }, (_, i) => geometria(i, cantidad));

  if (cascada) dibujarTuberias(g, cajas[0], cajas[1], aperturaV2);
  // La entrada v1 conecta con el costado del primer alambique.
  g.lineStyle(8, 0x1a1b1d, 1).lineBetween(cajas[0].x + cajas[0].w - 6, cajas[0].y + cajas[0].h * .65, cajas[0].x + cajas[0].w + 30, cajas[0].y + cajas[0].h * .65);
  g.lineStyle(4, 0x4a5056, 1).lineBetween(cajas[0].x + cajas[0].w - 6, cajas[0].y + cajas[0].h * .65, cajas[0].x + cajas[0].w + 30, cajas[0].y + cajas[0].h * .65);
  const xRueda1 = cajas[0].x + cajas[0].w + 32, yRueda1 = cajas[0].y + cajas[0].h * .65;
  g.lineStyle(3, 0x1a1b1d, 1).strokeCircle(xRueda1, yRueda1, 9);
  for (let k = 0; k < 4; k++) {
    const a = Math.max(0, Math.min(1, aperturaV1)) * Math.PI * 2 + k * Math.PI / 2;
    g.lineBetween(xRueda1, yRueda1, xRueda1 + Math.cos(a) * 7, yRueda1 + Math.sin(a) * 7);
  }

  cajas.forEach((caja, i) => {
    const nivel = limitarAltura(alturas[i]);
    const controlado = i === tanqueControlado;
    const color = nivel >= 2.8 ? 0xd52b27 : nivel >= 2.4 ? 0xd08a18 : controlado && dentroBanda ? 0x2ecc71 : colorNivel;
    const interiorX = caja.x + caja.w * .405, interiorY = caja.y + caja.h * .30;
    const interiorW = caja.w * .19, interiorH = caja.h * .49;

    // El equipo es una imagen con visor transparente; esta geometría queda como respaldo.
    if (!conSprites) {
      g.fillStyle(0x8a4829).fillRoundedRect(caja.x, caja.y, caja.w, caja.h, 12);
      g.fillStyle(0xcbd0d1, .92).fillRoundedRect(interiorX, interiorY, interiorW, interiorH, 8);
    }
    const nivelY = yNivel(nivel, caja);
    g.fillStyle(color, .94).fillRect(interiorX + 2, nivelY, interiorW - 4, Math.max(0, interiorY + interiorH - 2 - nivelY));
    if (controlado && Number.isFinite(referencia)) {
      const inferior = Math.max(0, referencia - tolerancia), superior = Math.min(3, referencia + tolerancia);
      const bandaY = yNivel(superior, caja);
      const bandaInferiorY = yNivel(inferior, caja);
      g.fillStyle(0x00e676, .35).fillRect(interiorX + 1, bandaY, interiorW - 2, bandaInferiorY - bandaY);
      for (const yy of [bandaY, bandaInferiorY]) {
        const capa = overlay || g;
        capa.lineStyle(3, 0x1a1b1d, .9).lineBetween(interiorX + 1, yy, interiorX + interiorW - 1, yy);
        capa.lineStyle(1, 0xffffff, 1).lineBetween(interiorX + 1, yy, interiorX + interiorW - 1, yy);
      }
    }

    if (!conSprites) {
      g.fillStyle(0xb85a24).fillRoundedRect(caja.x - 3, caja.y + 5, caja.w + 6, 11, 5);
      g.fillStyle(0xb85a24).fillRoundedRect(caja.x - 3, caja.y + caja.h - 16, caja.w + 6, 12, 5);
      g.lineStyle(2, 0x1a1b1d, .95).strokeRoundedRect(caja.x, caja.y, caja.w, caja.h, 12);
    }

    const capaOverlay = overlay || g;
    for (const [altura, colorAlarma] of [[2.4, 0xffd700], [2.8, 0xff1744]]) {
      const yy = yNivel(altura, caja);
      capaOverlay.lineStyle(3, colorAlarma, 1).lineBetween(caja.x + caja.w * .53, yy, caja.x + caja.w * .66, yy);
    }
    if (controlado && Number.isFinite(referencia)) {
      const yy = yNivel(referencia, caja);
      capaOverlay.lineStyle(3, 0x604b27, 1).lineBetween(interiorX, yy, interiorX + interiorW, yy);
    }
  });

  // Escalas cortas visibles a la izquierda de cada recipiente.
  cajas.forEach((caja) => {
    for (let metro = 0; metro <= 3; metro++) {
      const yy = yNivel(metro, caja);
      const capa = overlay || g;
      capa.lineStyle(1, 0x4c5a5e, .9).lineBetween(caja.x - 7, yy, caja.x + 5, yy);
    }
  });
}

function dibujarTuberias(g, primero, segundo, aperturaV2) {
  const salidaX = primero.x + primero.w / 2;
  const salidaY = primero.y + primero.h - 1;
  const caidaY = salidaY + 10;
  const entradaX = segundo.x + 34;
  g.lineStyle(9, 0x1a1b1d, 1);
  g.lineBetween(salidaX, salidaY, salidaX, caidaY);
  g.lineBetween(salidaX, caidaY, entradaX, caidaY);
  g.lineBetween(entradaX, caidaY, entradaX, segundo.y + 1);
  g.lineStyle(5, 0x4a5056, 1);
  g.lineBetween(salidaX, salidaY, salidaX, caidaY);
  g.lineBetween(salidaX, caidaY, entradaX, caidaY);
  g.lineBetween(entradaX, caidaY, entradaX, segundo.y + 1);

  const valveX = segundo.x + segundo.w * .5, valveY = segundo.y + segundo.h - 2;
  const bottomY = segundo.y + segundo.h - 1;
  g.lineStyle(9, 0x1a1b1d, 1).lineBetween(valveX, bottomY, valveX, valveY - 11);
  g.lineStyle(5, 0x4a5056, 1).lineBetween(valveX, bottomY, valveX, valveY - 11);
  g.lineStyle(3, 0x1a1b1d, 1).strokeCircle(valveX, valveY, 10);
  const angulo = Math.max(0, Math.min(1, aperturaV2)) * Math.PI / 2;
  for (let k = 0; k < 4; k++) {
    const a = angulo + k * Math.PI / 2;
    g.lineBetween(valveX, valveY, valveX + Math.cos(a) * 8, valveY + Math.sin(a) * 8);
  }
}

export function posicionEscalaTanque(indice, metro, cantidad = 1) {
  const caja = geometria(indice, cantidad);
  return { x: caja.x - 9, y: yNivel(metro, caja) - 9 };
}

export function posicionSpriteTanque(indice, cantidad = 1) {
  const caja = geometria(indice, cantidad);
  return { x: caja.x + caja.w / 2, y: caja.y + caja.h / 2, ancho: caja.w, alto: caja.h };
}

export function posicionSpritesValvulas(cantidad = 1) {
  const cajas = Array.from({ length: cantidad }, (_, i) => geometria(i, cantidad));
  return {
    v1: { x: cajas[0].x + cajas[0].w + 32, y: cajas[0].y + cajas[0].h * .65 },
    v2: cantidad === 2 ? { x: cajas[1].x + cajas[1].w * .5, y: cajas[1].y + cajas[1].h - 2 } : null,
  };
}

export function posicionAyudaCascada() { return { x: 36, y: 597 }; }
