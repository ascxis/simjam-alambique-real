export function dibujarBarraActuador(scene, x, y, etiqueta, apertura, variable, unidad = '') {
  const g = scene.add.graphics(); g.fillStyle(0xc8cbcc).fillRect(x, y, 220, 16); g.fillStyle(0x64777d).fillRect(x, y, 220 * Math.max(0, Math.min(1, apertura)), 16); g.lineStyle(1, 0x505659).strokeRect(x, y, 220, 16);
  const texto = scene.add.text(x, y - 19, `${etiqueta}: ${(apertura * 100).toFixed(0)}%  |  ${variable.toFixed(2)} ${unidad}`, { fontSize: '13px', color: '#282d2f' }); return { destruir: () => { g.destroy(); texto.destroy(); } };
}
