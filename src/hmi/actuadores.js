export function dibujarBarraActuador(scene, x, y, etiqueta, apertura, variable, unidad = '', nombreVariable = 'h') {
  const g = scene.add.graphics();
  const texto = scene.add.text(x, y - 19, '', { fontSize: '13px', color: '#282d2f' });
  const actualizar = (nuevoApertura = apertura, nuevaVariable = variable) => {
    apertura = nuevoApertura; variable = nuevaVariable;
    g.clear(); g.fillStyle(0xc8cbcc).fillRect(x, y, 220, 16);
    g.fillStyle(0x64777d).fillRect(x, y, 220 * Math.max(0, Math.min(1, apertura)), 16);
    g.lineStyle(1, 0x505659).strokeRect(x, y, 220, 16);
    texto.setText(`${etiqueta} ${(apertura * 100).toFixed(0)} % · ${nombreVariable} ${variable.toFixed(2)} ${unidad}`);
  };
  actualizar();
  return { actualizar, destruir: () => { g.destroy(); texto.destroy(); } };
}
