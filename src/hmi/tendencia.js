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
  tiempoCompleto = false, ejeTiempo = false, autoEscala = false, series = null, alarma = false, bandaInferiorClave = null, bandaSuperiorClave = null
}) {
  const g = scene.add.graphics(), textos = [];
  g.fillStyle(0xe2e3e3).fillRect(x, y, ancho, alto); g.lineStyle(1, 0x777777).strokeRect(x, y, ancho, alto);
  const serie = tiempoCompleto ? muestras : muestras.slice(-30 * 30);
  const definiciones = series || [{ clave, indice: 0, nombre: '', color: alarma ? 0xc42020 : 0x425e67 }];
  const lineas = definiciones.map((d) => ({ d, puntos: serie.map((m, i) => ({ t: Number.isFinite(m.t) ? m.t : i, valor: Number(Array.isArray(m[d.clave]) ? m[d.clave][d.indice || 0] : m[d.clave]) })).filter((p) => Number.isFinite(p.valor) && Number.isFinite(p.t)) }));
  const puntos = lineas[0]?.puntos || [];
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
  if (bandaInferiorClave && bandaSuperiorClave) {
    const mapX = (t) => plotX + Math.max(0, Math.min(1, t / duracion)) * plotW;
    for (let i = 1; i < serie.length; i++) {
      const a = serie[i - 1], b = serie[i];
      const loA = yMap(Number(a[bandaInferiorClave])), loB = yMap(Number(b[bandaInferiorClave]));
      const hiA = yMap(Number(a[bandaSuperiorClave])), hiB = yMap(Number(b[bandaSuperiorClave]));
      if ([loA, loB, hiA, hiB].every(Number.isFinite)) {
        g.fillStyle(0x71858b, .18);
        g.fillPoints([{ x: mapX(a.t), y: loA }, { x: mapX(b.t), y: loB }, { x: mapX(b.t), y: hiB }, { x: mapX(a.t), y: hiA }], true);
      }
    }
  }
  for (const linea of lineas) {
    g.lineStyle(2, linea.d.color ?? (alarma ? 0xc42020 : 0x425e67));
    for (let i = 1; i < linea.puntos.length; i++) {
      const x1 = plotX + Math.max(0, Math.min(1, (linea.puntos[i - 1].t - inicioT) / duracion)) * plotW;
      const x2 = plotX + Math.max(0, Math.min(1, (linea.puntos[i].t - inicioT) / duracion)) * plotW;
      g.lineBetween(x1, yMap(linea.puntos[i - 1].valor), x2, yMap(linea.puntos[i].valor));
    }
    if (linea.d.nombre) textos.push(scene.add.text(plotX + 8 + (textos.length % 3) * 70, plotY + 2, linea.d.nombre, { fontSize: '11px', color: `#${(linea.d.color ?? 0x425e67).toString(16).padStart(6, '0')}` }));
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
