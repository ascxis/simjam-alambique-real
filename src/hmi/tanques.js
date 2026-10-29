const colorNivel = 0x71858b;

function geometria(indice, cantidad) {
  if (cantidad === 2) {
    return indice === 0
      ? { x: 70, y: 235, w: 165, h: 150 }
      : { x: 330, y: 405, w: 165, h: 150 };
  }
  return { x: 115, y: 195, w: 165, h: 350 };
}

function limitarAltura(valor) { return Math.max(0, Math.min(3, Number(valor) || 0)); }
function yNivel(valor, caja) {
  const altoUtil = caja.h - 18;
  return caja.y + caja.h - 9 - altoUtil * limitarAltura(valor) / 3;
}

export function dibujarTanques(g, alturas, cantidad, {
  tanqueControlado = 0, referencia = null, tolerancia = 0, dentroBanda = false, aperturaV2 = 1,
} = {}) {
  g.clear();
  const cascada = cantidad === 2;
  const cajas = Array.from({ length: cantidad }, (_, i) => geometria(i, cantidad));

  if (cascada) dibujarTuberias(g, cajas[0], cajas[1], aperturaV2);

  cajas.forEach((caja, i) => {
    const nivel = limitarAltura(alturas[i]);
    const controlado = i === tanqueControlado;
    const color = nivel >= 2.8 ? 0xd52b27 : nivel >= 2.4 ? 0xd08a18 : controlado && dentroBanda ? 0x2ecc71 : colorNivel;
    const interiorX = caja.x + 10, interiorY = caja.y + 9, interiorW = caja.w - 20, interiorH = caja.h - 18;

    // Cuerpo de cobre y visor de vidrio, construidos como respaldo geométrico.
    g.fillStyle(0x8a4829).fillRoundedRect(caja.x, caja.y, caja.w, caja.h, 12);
    g.fillStyle(0xcbd0d1, .92).fillRoundedRect(interiorX, interiorY, interiorW, interiorH, 8);
    const nivelY = yNivel(nivel, caja);
    g.fillStyle(color, .94).fillRect(interiorX + 3, nivelY, interiorW - 6, Math.max(0, interiorY + interiorH - 3 - nivelY));
    if (controlado && Number.isFinite(referencia)) {
      const inferior = Math.max(0, referencia - tolerancia), superior = Math.min(3, referencia + tolerancia);
      const bandaY = yNivel(superior, caja);
      const bandaInferiorY = yNivel(inferior, caja);
      g.fillStyle(0x00e676, .28).fillRect(interiorX + 3, bandaY, interiorW - 6, bandaInferiorY - bandaY);
      for (const yy of [bandaY, bandaInferiorY]) {
        g.lineStyle(3, 0x1a1b1d, .9).lineBetween(interiorX + 3, yy, interiorX + interiorW - 3, yy);
        g.lineStyle(1, 0xffffff, 1).lineBetween(interiorX + 3, yy, interiorX + interiorW - 3, yy);
      }
    }

    // Aros superior e inferior del alambique.
    g.fillStyle(0xb85a24).fillRoundedRect(caja.x - 3, caja.y + 5, caja.w + 6, 11, 5);
    g.fillStyle(0xb85a24).fillRoundedRect(caja.x - 3, caja.y + caja.h - 16, caja.w + 6, 12, 5);
    g.lineStyle(2, 0x1a1b1d, .95).strokeRoundedRect(caja.x, caja.y, caja.w, caja.h, 12);

    for (const [altura, colorAlarma] of [[2.4, 0xffd700], [2.8, 0xff1744]]) {
      const yy = yNivel(altura, caja);
      g.lineStyle(3, colorAlarma, 1).lineBetween(caja.x + caja.w - 22, yy, caja.x + caja.w - 5, yy);
    }
    if (controlado && Number.isFinite(referencia)) {
      const yy = yNivel(referencia, caja);
      g.lineStyle(3, 0x604b27, 1).lineBetween(interiorX, yy, interiorX + interiorW, yy);
    }
  });

  // Escalas cortas visibles a la izquierda de cada recipiente.
  cajas.forEach((caja) => {
    for (let metro = 0; metro <= 3; metro++) {
      const yy = yNivel(metro, caja);
      g.lineStyle(1, 0x4c5a5e, .9).lineBetween(caja.x - 5, yy, caja.x + 4, yy);
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

  const valveX = segundo.x + segundo.w / 2, valveY = segundo.y + segundo.h + 18;
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
  return { x: caja.x - 11, y: yNivel(metro, caja) - 9 };
}

export function posicionAyudaCascada() { return { x: 36, y: 586 }; }
