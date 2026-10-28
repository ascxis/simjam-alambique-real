const colorNivel = 0x71858b;
const Y = 195, H = 350, INTERIOR = H - 18;

function yNivel(valor) {
  return Y + H - 9 - INTERIOR * Math.max(0, Math.min(3, valor)) / 3;
}

export function dibujarTanques(g, alturas, cantidad, {
  tanqueControlado = 0, referencia = null, tolerancia = 0, dentroBanda = false, alarmas = {},
} = {}) {
  g.clear();
  for (let i = 0; i < cantidad; i++) {
    const x = 115 + i * 245, w = 165;
    const nivel = Math.max(0, Math.min(3, alturas[i] || 0));
    const controlado = i === tanqueControlado;
    const color = nivel >= 2.8 ? 0xd52b27 : nivel >= 2.4 ? 0xd08a18 : (controlado && dentroBanda ? 0x3e9b78 : colorNivel);
    g.fillStyle(0xcbd0d1).fillRoundedRect(x, Y, w, H, 12);
    g.fillStyle(color, .92).fillRect(x + 9, yNivel(nivel), w - 18, (INTERIOR * nivel) / 3);
    if (controlado && Number.isFinite(referencia)) {
      const inferior = Math.max(0, referencia - tolerancia), superior = Math.min(3, referencia + tolerancia);
      const bandaY = yNivel(superior);
      g.fillStyle(0x68a889, 0.28).fillRect(x + 9, bandaY, w - 18, yNivel(inferior) - bandaY);
    }
    g.lineStyle(3, 0x52666d).strokeRoundedRect(x, Y, w, H, 12);

    // Marcas de escala y niveles de alarma, usando la misma escala del líquido.
    for (let m = 0; m <= 3; m++) {
      const yy = yNivel(m);
      g.lineStyle(1, 0x657579, 0.8).lineBetween(x - 5, yy, x + 2, yy);
    }
    for (const [altura, colorAlarma] of [[2.4, 0xe0a51b], [2.8, 0xd52b27]]) {
      const yy = yNivel(altura);
      g.lineStyle(3, colorAlarma, 0.95).lineBetween(x + w - 19, yy, x + w - 5, yy);
    }
    if (controlado && Number.isFinite(referencia)) {
      const yy = yNivel(referencia);
      g.lineStyle(3, 0x604b27, 1).lineBetween(x + 5, yy, x + w - 5, yy);
    }
  }
}

export function posicionEscalaTanque(indice, metro) {
  return { x: 115 + indice * 245 - 43, y: yNivel(metro) - 9 };
}
