import { fuenteInterfaz } from './estilo.js';

function escalaBonita(valores) {
  if (!valores.length) return { min: 0, max: 1, paso: 0.2 };
  const datoMin = Math.min(0, ...valores), datoMax = Math.max(0, ...valores);
  const rango = datoMax - datoMin || 1, aproximado = rango / 5, magnitud = 10 ** Math.floor(Math.log10(aproximado));
  const normalizado = aproximado / magnitud;
  const paso = (normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10) * magnitud;
  let min = Math.floor(datoMin / paso) * paso, max = Math.ceil(datoMax / paso) * paso;
  if (max <= min) max = min + paso;
  return { min, max, paso };
}

export function dibujarTendencia(scene, opcionesIniciales) {
  let opciones = { ...opcionesIniciales };
  const { x, y, ancho, alto } = opciones;
  const g = scene.add.graphics();
  const ejesY = Array.from({ length: 5 }, () => scene.add.text(0, 0, '', fuenteInterfaz(10)));
  const ejesX = Array.from({ length: 5 }, () => scene.add.text(0, 0, '', fuenteInterfaz(10)).setOrigin(.5, 0));
  const unidadTiempo = scene.add.text(0, 0, 't (s)', fuenteInterfaz(10)).setOrigin(1, 0);
  const titulo = scene.add.text(0, 0, '', fuenteInterfaz(12, '#F2E6C9', { fontStyle: 'bold' }));
  const actual = scene.add.text(0, 0, '', fuenteInterfaz(11)).setOrigin(0, 0);
  const etiquetas = (opciones.series || [{ nombre: '' }]).map(() => scene.add.text(0, 0, '', fuenteInterfaz(10)));
  const muestrasLeyenda = (opciones.series || [{ nombre: '' }]).map(() => scene.add.graphics());
  const etiquetaEjeY = scene.add.text(0, 0, '', fuenteInterfaz(10)).setOrigin(.5).setRotation(-Math.PI / 2);

  function actualizar(nuevas = {}) {
    opciones = { ...opciones, ...nuevas };
    const { muestras = [], clave = 'y', min: minInicial = 0, max: maxInicial = 3, unidad = '', referencia = null, banda = 0, titulo: tituloTexto = '', tiempoCompleto = false, ejeTiempo = false, autoEscala = false, series = null, alarma = false, bandaInferiorClave = null, bandaSuperiorClave = null, fondoTransparente = false, rejillaPanel = false, tituloEjeY = '', formatoTickY = null } = opciones;
    const ultimaMuestra = muestras.at(-1)?.t ?? 0;
    const serie = tiempoCompleto ? muestras : muestras.filter((m) => Number.isFinite(m.t) && m.t >= Math.max(0, ultimaMuestra - 30));
    const definiciones = series || [{ clave, indice: 0, nombre: '', color: alarma ? 0xc42020 : 0x425e67 }];
    const lineas = definiciones.map((d) => ({ d, puntos: serie.map((m, i) => ({ t: Number.isFinite(m.t) ? m.t : i, valor: Number(Array.isArray(m[d.clave]) ? m[d.clave][d.indice || 0] : m[d.clave]) })).filter((p) => Number.isFinite(p.valor) && Number.isFinite(p.t)) }));
    const puntos = lineas[0]?.puntos || [];
    let min = minInicial, max = maxInicial;
    if (autoEscala) ({ min, max } = escalaBonita(lineas.flatMap((l) => l.puntos.map((p) => p.valor))));
    if (!(max > min)) max = min + 1;
    const margenIzq = tituloEjeY ? 70 : ejeTiempo ? 46 : 0, margenSup = 26, margenInf = ejeTiempo ? 38 : 0;
    const plotX = x + margenIzq, plotY = y + margenSup, plotW = ancho - margenIzq - 8, plotH = alto - margenSup - margenInf - 8;
    const yMap = (valor) => plotY + plotH * (max - valor) / (max - min);
    const pasoY = autoEscala ? escalaBonita(lineas.flatMap((l) => l.puntos.map((p) => p.valor))).paso : (max - min) / 4;
    const decimales = pasoY < 1 ? Math.min(3, Math.ceil(-Math.log10(pasoY))) : 0;
    g.clear();
    if (!fondoTransparente) g.fillStyle(0x3a3d40, 1).fillRoundedRect(x, y, ancho, alto, 7);
    g.lineStyle(1, fondoTransparente ? 0x9a8b70 : 0x687076, fondoTransparente ? .7 : 1).strokeRoundedRect(x, y, ancho, alto, 7);
    g.lineStyle(1, 0x62676b, .65);
    for (let i = 0; i <= 4; i++) {
      const valor = max - (max - min) * i / 4, yy = plotY + plotH * i / 4;
      if (!rejillaPanel) g.lineBetween(plotX, yy, plotX + plotW, yy);
      const tick = formatoTickY ? formatoTickY(valor) : `${valor.toFixed(decimales)}${unidad ? ` ${unidad}` : ''}`;
      ejesY[i].setPosition(tituloEjeY ? x + 21 : ejeTiempo ? x + 2 : x + 4, yy - 7).setText(tick);
    }
    if (referencia !== null) {
      const top = yMap(Math.min(max, referencia + banda)), bot = yMap(Math.max(min, referencia - banda));
      g.fillStyle(0x87959a, .22).fillRect(plotX, top, plotW, bot - top);
      g.lineStyle(1, 0xc9a227, .9).lineBetween(plotX, yMap(referencia), plotX + plotW, yMap(referencia));
    }
    const finalMuestra = puntos.at(-1)?.t ?? 0, inicioT = tiempoCompleto ? 0 : Math.max(0, finalMuestra - 30), duracion = Math.max(finalMuestra - inicioT, 1e-9);
    const mapX = (t) => plotX + Math.max(0, Math.min(1, (t - inicioT) / duracion)) * plotW;
    if (bandaInferiorClave && bandaSuperiorClave) {
      for (let i = 1; i < serie.length; i++) {
        const a = serie[i - 1], b = serie[i];
        const puntosBanda = [{ x: mapX(a.t), y: yMap(Number(a[bandaInferiorClave])) }, { x: mapX(b.t), y: yMap(Number(b[bandaInferiorClave])) }, { x: mapX(b.t), y: yMap(Number(b[bandaSuperiorClave])) }, { x: mapX(a.t), y: yMap(Number(a[bandaSuperiorClave])) }];
        if (puntosBanda.every((p) => Number.isFinite(p.y))) g.fillStyle(0xb7bdc2, .18).fillPoints(puntosBanda, true);
      }
    }
    const anchosLeyenda = definiciones.map((d) => Math.max(26, (d.nombre || '').length * 6.4));
    let leyendaX = x + ancho - 10 - anchosLeyenda.reduce((s, n) => s + n + 20, 0);
    lineas.forEach((linea, index) => {
      const color = linea.d.color ?? (alarma ? 0xc42020 : 0x425e67);
      g.lineStyle(2, color);
      for (let i = 1; i < linea.puntos.length; i++) g.lineBetween(mapX(linea.puntos[i - 1].t), yMap(linea.puntos[i - 1].valor), mapX(linea.puntos[i].t), yMap(linea.puntos[i].valor));
      const etiqueta = etiquetas[index], swatch = muestrasLeyenda[index];
      if (etiqueta && swatch) {
        const nombre = linea.d.nombre || '';
        etiqueta.setPosition(leyendaX + 17, y + 5).setText(nombre).setColor(`#${color.toString(16).padStart(6, '0')}`);
        swatch.clear().lineStyle(3, color, 1).lineBetween(leyendaX, y + 11, leyendaX + 12, y + 11);
        leyendaX += anchosLeyenda[index] + 20;
      }
    });
    for (let i = lineas.length; i < etiquetas.length; i++) etiquetas[i].setText('');
    if (ejeTiempo) {
      for (let i = 0; i <= 4; i++) {
        const valorT = inicioT + duracion * i / 4, xx = plotX + plotW * i / 4;
        if (!rejillaPanel) g.lineStyle(1, 0x555b5d).lineBetween(xx, plotY + plotH, xx, plotY + plotH + 3);
        ejesX[i].setPosition(xx, plotY + plotH + 5).setText(valorT.toFixed(duracion < 10 ? 1 : 0)).setVisible(true);
      }
      unidadTiempo.setPosition(plotX + plotW, y + alto - 14).setVisible(true);
    } else { ejesX.forEach((t) => t.setVisible(false)); unidadTiempo.setVisible(false); }
    actual.setText(puntos.length ? `${puntos.at(-1).valor.toFixed(2)} ${unidad}` : '').setPosition(x + 8, y + 3);
    titulo.setPosition(x + 8 + actual.width + 12, y + 3).setText(tituloTexto);
    etiquetaEjeY.setText(tituloEjeY).setPosition(x + 8, y + alto / 2).setVisible(Boolean(tituloEjeY));
  }

  actualizar();
  return { actualizar, destruir: () => { g.destroy(); ejesY.forEach((t) => t.destroy()); ejesX.forEach((t) => t.destroy()); unidadTiempo.destroy(); titulo.destroy(); actual.destroy(); etiquetas.forEach((t) => t.destroy()); muestrasLeyenda.forEach((s) => s.destroy()); etiquetaEjeY.destroy(); } };
}
