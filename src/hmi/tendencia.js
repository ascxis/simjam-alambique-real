function escalaBonita(valores) {
  if (!valores.length) return { min: 0, max: 1, paso: 0.2 };
  const datoMin = Math.min(0, ...valores), datoMax = Math.max(0, ...valores);
  const rango = datoMax - datoMin || 1;
  const aproximado = rango / 5, magnitud = 10 ** Math.floor(Math.log10(aproximado));
  const normalizado = aproximado / magnitud;
  const paso = (normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10) * magnitud;
  let min = Math.floor(datoMin / paso) * paso, max = Math.ceil(datoMax / paso) * paso;
  if (max <= min) max = min + paso;
  return { min, max, paso };
}

export function dibujarTendencia(scene, {
  x, y, ancho, alto, muestras, clave = 'y', min = 0, max = 3, unidad = '', referencia = null, banda = 0, titulo = '',
  tiempoCompleto = false, ejeTiempo = false, autoEscala = false
}) {
  const g = scene.add.graphics(), textos = [];
  g.fillStyle(0xe2e3e3).fillRect(x, y, ancho, alto); g.lineStyle(1, 0x777777).strokeRect(x, y, ancho, alto);
  const serie = tiempoCompleto ? muestras : muestras.slice(-30 * 30);
  const puntos = serie.map((m, i) => ({
    t: Number.isFinite(m.t) ? m.t : i,
    valor: Number(Array.isArray(m[clave]) ? m[clave][0] : m[clave])
  })).filter((p) => Number.isFinite(p.valor) && Number.isFinite(p.t));
  if (autoEscala) ({ min, max } = escalaBonita(puntos.map((p) => p.valor)));
  if (!(max > min)) max = min + 1;

  const margenIzq = ejeTiempo ? 46 : 0, margenSup = 20, margenInf = ejeTiempo ? 42 : 0;
  const plotX = x + margenIzq, plotY = y + margenSup, plotW = ancho - margenIzq - 8, plotH = alto - margenSup - margenInf - 8;
  const yMap = (valor) => plotY + plotH * (max - valor) / (max - min);
  const pasoY = autoEscala ? escalaBonita(puntos.map((p) => p.valor)).paso : (max - min) / 4;
  const decimales = pasoY < 1 ? Math.min(3, Math.ceil(-Math.log10(pasoY))) : 0;
  g.lineStyle(1, 0x999999);
  for (let i = 0; i <= 4; i++) {
    const valor = max - (max - min) * i / 4;
    const yy = plotY + plotH * i / 4;
    g.lineBetween(plotX, yy, plotX + plotW, yy);
    textos.push(scene.add.text(ejeTiempo ? x + 2 : x + 4, yy - 7, `${valor.toFixed(decimales)}${unidad ? ` ${unidad}` : ''}`, { fontSize: '11px', color: '#343638' }));
  }
  if (referencia !== null) {
    const top = yMap(Math.min(max, referencia + banda)), bot = yMap(Math.max(min, referencia - banda));
    g.fillStyle(0x87959a, .22).fillRect(plotX, top, plotW, bot - top);
    g.lineStyle(1, 0x4c5c62, .8).lineBetween(plotX, yMap(referencia), plotX + plotW, yMap(referencia));
  }
  const inicioT = 0, finalMuestra = puntos.at(-1)?.t ?? 0, duracion = Math.max(finalMuestra, 1e-9);
  g.lineStyle(2, 0x425e67);
  for (let i = 1; i < puntos.length; i++) {
    const x1 = plotX + Math.max(0, Math.min(1, (puntos[i - 1].t - inicioT) / duracion)) * plotW;
    const x2 = plotX + Math.max(0, Math.min(1, (puntos[i].t - inicioT) / duracion)) * plotW;
    g.lineBetween(x1, yMap(puntos[i - 1].valor), x2, yMap(puntos[i].valor));
  }
  if (ejeTiempo) {
    for (let i = 0; i <= 4; i++) {
      const valorT = duracion * i / 4, xx = plotX + plotW * i / 4;
      g.lineStyle(1, 0x555b5d).lineBetween(xx, plotY + plotH, xx, plotY + plotH + 3);
      textos.push(scene.add.text(xx, plotY + plotH + 5, valorT.toFixed(duracion < 10 ? 1 : 0), { fontSize: '11px', color: '#343638' }).setOrigin(.5, 0));
    }
    textos.push(scene.add.text(plotX + plotW, y + alto - 14, 't (s)', { fontSize: '11px', color: '#343638' }).setOrigin(1, 0));
  }
  if (titulo) textos.push(scene.add.text(plotX + 4, y + 3, titulo, { fontSize: '13px', color: '#242829', fontStyle: 'bold' }));
  const actual = puntos.at(-1)?.valor;
  if (actual !== undefined) textos.push(scene.add.text(x + ancho - 84, y + 3, `${actual.toFixed(2)} ${unidad}`, { fontSize: '12px', color: '#242829' }));
  return { destruir: () => { g.destroy(); textos.forEach((texto) => texto.destroy()); } };
}
