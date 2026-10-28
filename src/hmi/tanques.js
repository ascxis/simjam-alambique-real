const colorNivel = 0x71858b;
export function dibujarTanques(g, alturas, cantidad, { alarmas = {} } = {}) {
  g.clear();
  for (let i = 0; i < cantidad; i++) {
    const x = 115 + i * 245, y = 195, w = 165, h = 350, nivel = Math.max(0, Math.min(3, alturas[i] || 0));
    const color = nivel >= 2.8 ? 0xd52b27 : nivel >= 2.4 ? 0xd08a18 : colorNivel;
    g.fillStyle(0xcbd0d1).fillRoundedRect(x, y, w, h, 12);
    g.fillStyle(color, .9).fillRect(x + 9, y + h - 9 - (h - 18) * nivel / 3, w - 18, (h - 18) * nivel / 3);
    g.lineStyle(3, 0x52666d).strokeRoundedRect(x, y, w, h, 12);
    g.lineStyle(1, 0x8e9698).lineBetween(x + 4, y + h * .2, x + w - 4, y + h * .2);
    g.lineStyle(1, 0x8e9698).lineBetween(x + 4, y + h * .4, x + w - 4, y + h * .4);
  }
}
