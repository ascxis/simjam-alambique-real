export function dibujarTendencia(scene, { x, y, ancho, alto, muestras, clave = 'y', min = 0, max = 3, unidad = '', referencia = null, banda = 0, titulo = '' }) {
  const g = scene.add.graphics(); const textos = []; g.fillStyle(0xe2e3e3).fillRect(x, y, ancho, alto); g.lineStyle(1, 0x777777).strokeRect(x, y, ancho, alto);
  g.lineStyle(1, 0x999999); for (let i = 0; i <= 4; i++) { const yy = y + alto * i / 4; g.lineBetween(x, yy, x + ancho, yy); textos.push(scene.add.text(x + 4, yy - 12, `${(max - (max - min) * i / 4).toFixed(1)} ${unidad}`, { fontSize: '11px', color: '#343638' })); }
  if (referencia !== null) { const top = y + alto * (max - Math.min(max, referencia + banda)) / (max - min), bot = y + alto * (max - Math.max(min, referencia - banda)) / (max - min); g.fillStyle(0x87959a, .22).fillRect(x, top, ancho, bot - top); const ry = y + alto * (max - referencia) / (max - min); g.lineStyle(1, 0x4c5c62, .8).lineBetween(x, ry, x + ancho, ry); }
  const values = muestras.slice(-30 * 30), ys = values.map((m) => Number(Array.isArray(m[clave]) ? m[clave][0] : m[clave])); g.lineStyle(2, 0x425e67);
  for (let i = 1; i < ys.length; i++) { const px = x + (i - 1) / Math.max(1, ys.length - 1) * ancho, nx = x + i / Math.max(1, ys.length - 1) * ancho; g.lineBetween(px, y + alto * (max - ys[i - 1]) / (max - min), nx, y + alto * (max - ys[i]) / (max - min)); }
  if (titulo) textos.push(scene.add.text(x + 5, y + 3, titulo, { fontSize: '13px', color: '#242829', fontStyle: 'bold' }));
  const actual = ys.at(-1); if (actual !== undefined) textos.push(scene.add.text(x + ancho - 84, y + 3, `${actual.toFixed(2)} ${unidad}`, { fontSize: '12px', color: '#242829' }));
  return { destruir: () => { g.destroy(); textos.forEach((t) => t.destroy()); } };
}
