import { fuenteInterfaz } from './estilo.js';

export function dibujarBarraActuador(scene, x, y, etiqueta, apertura, variable, unidad = '', nombreVariable = 'h', ancho = 250) {
  const g = scene.add.graphics();
  const texto = scene.add.text(x, y, '', fuenteInterfaz(13, '#E6E8EA', { fontStyle: 'bold' }));
  const actualizar = (nuevoApertura = apertura, nuevaVariable = variable) => {
    apertura = nuevoApertura; variable = nuevaVariable;
    g.clear(); g.fillStyle(0x3a3d40).fillRoundedRect(x, y + 20, ancho, 12, 5);
    g.fillStyle(0xb85a24).fillRoundedRect(x, y + 20, ancho * Math.max(0, Math.min(1, apertura)), 12, 5);
    g.lineStyle(1, 0xb85a24, .85).strokeRoundedRect(x, y + 20, ancho, 12, 5);
    texto.setText(`${etiqueta} ${(apertura * 100).toFixed(0)} % · ${nombreVariable} ${variable.toFixed(2)} ${unidad}`);
  };
  actualizar();
  return { actualizar, destruir: () => { g.destroy(); texto.destroy(); } };
}

export function dibujarProgreso(scene, rect, valor) {
  const g = scene.add.graphics();
  const render = (p = valor) => {
    valor = Math.max(0, Math.min(1, Number(p) || 0));
    g.clear();
    g.fillStyle(0x3a3d40).fillRoundedRect(rect.x, rect.y, rect.ancho, rect.alto, rect.alto / 2);
    g.fillStyle(0xb85a24).fillRoundedRect(rect.x, rect.y, rect.ancho * valor, rect.alto, rect.alto / 2);
    g.lineStyle(1, 0xb85a24, .9).strokeRoundedRect(rect.x, rect.y, rect.ancho, rect.alto, rect.alto / 2);
  };
  render();
  return { actualizar: render, destruir: () => g.destroy() };
}
