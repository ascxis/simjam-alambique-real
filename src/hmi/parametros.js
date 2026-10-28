export function mostrarPanelParametros(scene, parametros, onChange) {
  const bg = scene.add.rectangle(640, 360, 530, 400, 0xe2e3e3).setStrokeStyle(2, 0x64777d).setInteractive();
  scene.add.text(425, 180, 'Parámetros del modelo (P para cerrar)', { fontSize: '20px', color: '#202526' });
  const elementos = Object.entries(parametros).map(([nombre, valor], i) => { const t = scene.add.text(430, 230 + i * 38, `${nombre}: ${valor}   [−] [+]`, { fontSize: '17px', color: '#263236' }).setInteractive({ useHandCursor: true }); t.on('pointerdown', (p) => { const nuevo = Number(valor) + (p.downElement?.index % 2 ? .1 : .1); onChange(nombre, nuevo); }); return t; });
  return { destruir: () => { bg.destroy(); elementos.forEach((e) => e.destroy()); } };
}
