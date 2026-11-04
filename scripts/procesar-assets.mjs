import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const raiz = process.cwd();
const origen = path.join(raiz, 'arte_fuente/originales');
const salidaSprites = path.join(raiz, 'public/assets/sprites');
const salidaFondos = path.join(raiz, 'public/assets/fondos');
const salidaEfectos = path.join(raiz, 'public/assets/efectos');
const salidaTiles = path.join(raiz, 'public/assets/tiles');
const salidaAssets = path.join(raiz, 'public/assets');

// Medidas y distribución tomadas de docs/recursos.md.
const recursos = [
  { archivo: 'alambique_cuerpo_vacio.png', destino: 'sprites/alambique_cuerpo_vacio.png', ancho: 215, alto: 300 },
  { archivo: 'alambique_columna_liquido.jpg', destino: 'sprites/columna_liquido.png', recorteFraccion: [.693, .087, .773, .913], altoMaximo: 300 },
  { archivo: 'mesa_laboratorio.jpg', destino: 'sprites/mesa_laboratorio.png', anchoObjetivo: 390 },
  { archivo: 'caldero_real.jpg', destino: 'sprites/caldero_real.png', anchoObjetivo: 110 },
  { archivo: 'valvula_cuerpo_estatico.jpg', destino: 'sprites/valvula_cuerpo_estatico.png', ancho: 80, alto: 80 },
  { archivo: 'valvula_volante_aislado.png', destino: 'sprites/valvula_volante_aislado.png', ancho: 50, alto: 50 },
  { archivo: 'alarma_placa.png', destino: 'sprites/alarma_placa.png', ancho: 64, alto: 64 },
  { archivo: 'alarma_runa.png', destino: 'sprites/alarma_runa.png', ancho: 64, alto: 64 },
  { archivo: 'fondo_laboratorio.png', destino: 'fondos/fondo_laboratorio.png', ancho: 1280, alto: 720, fondo: true },
  { archivo: 'baldosas_laboratorio.png', destino: 'sprites/baldosas_laboratorio.png', columnas: 4, filas: 4, cuadros: 16, cuadro: 64 },
  { archivo: 'interfaz_iconos.png', destino: 'sprites/interfaz_iconos.png', columnas: 4, filas: 2, cuadros: 8, cuadro: 64 },
  { archivo: 'logotipo_titulo.png', destino: 'sprites/logotipo_titulo.png', ancho: 400, alto: 256 },
  { archivo: 'pantalla_post_partida.png', destino: 'sprites/pantalla_post_partida.png', ancho: 588, alto: 680 },
];

async function pixelesConTransparencia(archivo, quitarMagenta = true) {
  const { data, info } = await sharp(archivo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (quitarMagenta) {
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // El umbral tolera la compresión JPG y los bordes suavizados del fondo magenta.
      const magenta = Math.min(r, b) - g;
      if (r > 40 && b > 40 && g < 120 && magenta > 18) {
        // Incluye el borde antialiasado de magenta; limpia RGB para evitar halos al escalar.
        data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 0;
      }
    }
  }
  return { data, info };
}

function quitarMagentaRaw(data, info) {
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const magenta = Math.min(r, b) - g;
    if (r > 40 && b > 40 && g < 120 && magenta > 18) {
      data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 0;
    }
  }
}

function limitesAlfa(data, info, offsetX = 0, offsetY = 0) {
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * info.channels + 3] > 8) {
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
  }
  if (maxX < 0) return null;
  return { left: offsetX + minX, top: offsetY + minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function extraerRecorte(buffer, recorte) {
  return sharp(buffer).extract(recorte).png().toBuffer();
}

async function crearCuadro(buffer, tamano, { base = true } = {}) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const caja = limitesAlfa(data, info);
  if (!caja) return Buffer.alloc(tamano * tamano * 4);
  const recorte = await extraerRecorte(buffer, caja);
  const contenido = await sharp(recorte).resize(tamano, tamano, { fit: 'inside', withoutEnlargement: false }).png().toBuffer();
  const metadatos = await sharp(contenido).metadata();
  const left = Math.floor((tamano - metadatos.width) / 2);
  // Las hojas de objetos comparten la línea de base para que el giro/animación no salte.
  const top = base ? tamano - metadatos.height : Math.floor((tamano - metadatos.height) / 2);
  return sharp({ create: { width: tamano, height: tamano, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: contenido, left, top }]).png().toBuffer();
}

async function procesarUnico(recurso, archivo) {
  const { data, info } = await pixelesConTransparencia(archivo, !recurso.fondo);
  const buffer = await sharp(data, { raw: info }).png().toBuffer();
  const limites = recurso.fondo ? { left: 0, top: 0, width: info.width, height: info.height } : limitesAlfa(data, info);
  if (!limites) throw new Error(`No se encontró contenido visible en ${recurso.archivo}`);
  let imagen = sharp(buffer).extract(limites);
  if (recurso.altoMaximo) imagen = imagen.resize({ height: recurso.altoMaximo, withoutEnlargement: true });
  else if (recurso.anchoObjetivo) imagen = imagen.resize({ width: recurso.anchoObjetivo, withoutEnlargement: false });
  else imagen = imagen.resize(recurso.ancho, recurso.alto, { fit: 'contain', background: recurso.fondo ? '#1c2026' : { r: 0, g: 0, b: 0, alpha: 0 } });
  return imagen.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
}

async function procesarPiezaFraccion(recurso, archivo) {
  const origenMeta = await sharp(archivo).metadata();
  const [x0, y0, x1, y1] = recurso.recorteFraccion;
  const recortePx = {
    left: Math.floor(x0 * origenMeta.width), top: Math.floor(y0 * origenMeta.height),
    width: Math.ceil(x1 * origenMeta.width) - Math.floor(x0 * origenMeta.width),
    height: Math.ceil(y1 * origenMeta.height) - Math.floor(y0 * origenMeta.height),
  };
  const { data, info } = await sharp(archivo).extract(recortePx).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  quitarMagentaRaw(data, info);
  const contenido = limitesAlfa(data, info);
  if (!contenido) throw new Error(`No se encontró contenido en el recorte de ${recurso.archivo}`);
  const bufferRecortado = await sharp(data, { raw: info }).extract(contenido).png().toBuffer();
  let imagen = sharp(bufferRecortado);
  if (recurso.altoObjetivo) imagen = imagen.resize({ height: recurso.altoObjetivo, withoutEnlargement: false });
  else if (recurso.altoMaximo) imagen = imagen.resize({ height: recurso.altoMaximo, withoutEnlargement: true });
  const salida = await imagen.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();

  let json = null;
  if (recurso.visores) {
    const aRecorte = (fracciones) => {
      const [vx0, vy0, vx1, vy1] = fracciones;
      let xInicial = vx0 * origenMeta.width - recortePx.left - contenido.left;
      let yInicial = vy0 * origenMeta.height - recortePx.top - contenido.top;
      let xFinal = vx1 * origenMeta.width - recortePx.left - contenido.left;
      let yFinal = vy1 * origenMeta.height - recortePx.top - contenido.top;

      // El vidrio gris del arte tiene un borde algo mayor que la fracción nominal.
      // Busca pixeles gris claro solo en una ventana acotada alrededor del visor esperado.
      const margenX = Math.ceil(origenMeta.width * .012), margenY = Math.ceil(origenMeta.height * .018);
      const roi = {
        left: Math.max(0, Math.floor(vx0 * origenMeta.width - recortePx.left - contenido.left - margenX)),
        top: Math.max(0, Math.floor(vy0 * origenMeta.height - recortePx.top - contenido.top - margenY)),
        right: Math.min(contenido.width, Math.ceil(vx1 * origenMeta.width - recortePx.left - contenido.left + margenX)),
        bottom: Math.min(contenido.height, Math.ceil(vy1 * origenMeta.height - recortePx.top - contenido.top + margenY)),
      };
      let minX = roi.right, minY = roi.bottom, maxX = -1, maxY = -1, pixeles = 0;
      for (let y = roi.top; y < roi.bottom; y++) for (let x = roi.left; x < roi.right; x++) {
        const i = ((y + contenido.top) * info.width + (x + contenido.left)) * info.channels;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const grisClaro = data[i + 3] > 200 && Math.min(r, g, b) > 85 && Math.max(r, g, b) - Math.min(r, g, b) < 55;
        if (grisClaro) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); pixeles++; }
      }
      if (pixeles > 100 && maxX >= minX && maxY >= minY) {
        xInicial = minX; yInicial = minY; xFinal = maxX + 1; yFinal = maxY + 1;
      }
      return {
        x: xInicial / contenido.width, y: yInicial / contenido.height,
        ancho: (xFinal - xInicial) / contenido.width, alto: (yFinal - yInicial) / contenido.height,
      };
    };
    json = {
      fuente: recurso.archivo,
      recorteOriginal: { left: recortePx.left, top: recortePx.top, width: recortePx.width, height: recortePx.height },
      recorteAlfa: contenido,
      visores: {
        superior: aRecorte(recurso.visores.superior),
        inferior: aRecorte(recurso.visores.inferior),
      },
    };
  }
  return { buffer: salida, json };
}

async function procesarHoja(recurso, archivo) {
  const { data, info } = await pixelesConTransparencia(archivo, true);
  const celdaAncho = info.width / recurso.columnas, celdaAlto = info.height / recurso.filas;
  const cuadros = [];
  for (let i = 0; i < recurso.cuadros; i++) {
    const col = i % recurso.columnas, fila = Math.floor(i / recurso.columnas);
    const left = Math.floor(col * celdaAncho), top = Math.floor(fila * celdaAlto);
    const right = Math.floor((col + 1) * celdaAncho), bottom = Math.floor((fila + 1) * celdaAlto);
    const celda = await sharp(data, { raw: info }).extract({ left, top, width: right - left, height: bottom - top }).png().toBuffer();
    cuadros.push(await crearCuadro(celda, recurso.cuadro, { base: recurso.archivo !== 'interfaz_iconos.png' }));
  }
  const composiciones = cuadros.map((input, i) => ({
    input,
    left: (i % recurso.columnas) * recurso.cuadro,
    top: Math.floor(i / recurso.columnas) * recurso.cuadro,
  }));
  return sharp({
    create: {
      width: recurso.columnas * recurso.cuadro,
      height: recurso.filas * recurso.cuadro,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite(composiciones).png({ compressionLevel: 9 }).toBuffer();
}

async function limpiarHalo(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    const tonoMagenta = Math.min(r, b) > 35 && g < Math.min(r, b) * .45 && Math.abs(r - b) < 80;
    if (a < 250 && tonoMagenta) { data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 0; }
  }
  return sharp(data, { raw: info }).png({ compressionLevel: 9 }).toBuffer();
}

await fs.mkdir(salidaSprites, { recursive: true });
await fs.mkdir(salidaFondos, { recursive: true });
for (const recurso of recursos) {
  const archivo = path.join(origen, recurso.archivo);
  try { await fs.access(archivo); }
  catch { console.warn(`[assets] Falta ${recurso.archivo}; se conserva el respaldo geométrico.`); continue; }
  const salida = path.join(raiz, 'public/assets', recurso.destino);
  let json = null;
  let buffer;
  if (recurso.recorteFraccion) ({ buffer, json } = await procesarPiezaFraccion(recurso, archivo));
  else buffer = recurso.cuadros ? await procesarHoja(recurso, archivo) : await procesarUnico(recurso, archivo);
  if (!recurso.fondo) buffer = await limpiarHalo(buffer);
  await fs.writeFile(salida, buffer);
  console.info(`[assets] ${recurso.archivo} → ${recurso.destino} (${(buffer.length / 1024).toFixed(1)} KB)`);
  if (json) {
    const destinoJson = salida.replace(/\.png$/i, '.json');
    await fs.writeFile(destinoJson, `${JSON.stringify(json, null, 2)}\n`);
    console.info(`[assets] metadatos de visores → ${path.relative(raiz, destinoJson)}`);
  }
}

// Recursos del día 2. Las celdas se detectan usando la separación magenta;
// los tamaños indicados son el tamaño FINAL de cada cuadro, no el del original.
// Las hojas del equipo se mantienen como arte fuente de la pareja: este script
// solo las registra en el manifiesto, nunca las procesa ni las sobrescribe.
const familiasEquipo = [
  { familia: 'alambique_simple', key: 'alambique-simple', archivo: 'sprites/alambique_simple.json' },
  { familia: 'alambique_cascada', key: 'alambique-cascada', archivo: 'sprites/alambique_cascada.json' },
];
const familias = [];

const entradasManifiesto = [];
function agregarEntrada({ key, pathRel, type = 'image', width, height, frameWidth, frameHeight, frameCount, columns, rows, files, available }) {
  entradasManifiesto.push({ key, type, path: pathRel, width, height, frameWidth, frameHeight, frameCount, columns, rows, files, available });
}
function registrarAusente(key, pathRel, type = 'image', extra = {}) {
  agregarEntrada({ key, pathRel, type, available: false, ...extra });
}

function registroLegacy() {
  const entradas = [
    ['liquido-referencia', 'sprites/columna_liquido.png', 'image'],
    ['mesa-laboratorio', 'sprites/mesa_laboratorio.png', 'image'],
    ['caldero-real', 'sprites/caldero_real.png', 'image'],
    ['valvula-cuerpo', 'sprites/valvula_cuerpo_estatico.png', 'image'],
    ['valvula-volante', 'sprites/valvula_volante_aislado.png', 'image'],
    ['alarma-placa', 'sprites/alarma_placa.png', 'image'],
    ['alarma-runa', 'sprites/alarma_runa.png', 'image'],
    ['fondo-laboratorio', 'fondos/fondo_laboratorio.png', 'image'],
    ['baldosas', 'sprites/baldosas_laboratorio.png', 'spritesheet', 64, 64, 16, 4, 4],
    ['interfaz', 'sprites/interfaz_iconos.png', 'spritesheet', 64, 64, 8, 4, 2],
    ['logotipo', 'sprites/logotipo_titulo.png', 'image'],
    ['panel-final', 'sprites/pantalla_post_partida.png', 'image'],
  ];
  for (const [key, pathRel, type, frameWidth, frameHeight, frameCount, columns, rows] of entradas) agregarEntrada({ key, pathRel, type, frameWidth, frameHeight, frameCount, columns, rows });
}

function esMagenta(r, g, b) {
  return r > 40 && b > 40 && g < 120 && Math.min(r, b) - g > 18;
}

function intervalosColumnas(data, info, cuadrosEsperados) {
  const ocupacion = new Uint32Array(info.width);
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * info.channels;
    if (data[i + 3] > 8) ocupacion[x]++;
  }
  let intervalos = [], inicio = -1;
  for (let x = 0; x <= info.width; x++) {
    const presente = x < info.width && ocupacion[x] > 0;
    if (presente && inicio < 0) inicio = x;
    if (!presente && inicio >= 0) { intervalos.push({ inicio, fin: x - 1 }); inicio = -1; }
  }
  // Una misma figura puede tener pequeños huecos entre componentes (p. ej., vapor).
  // Se unen los espacios más cortos hasta obtener la cantidad declarada en la guía.
  while (intervalos.length > cuadrosEsperados) {
    let mejor = 0, menorHueco = Infinity;
    for (let i = 0; i < intervalos.length - 1; i++) {
      const hueco = intervalos[i + 1].inicio - intervalos[i].fin - 1;
      if (hueco < menorHueco) { menorHueco = hueco; mejor = i; }
    }
    intervalos[mejor].fin = intervalos[mejor + 1].fin;
    intervalos.splice(mejor + 1, 1);
  }
  if (intervalos.length !== cuadrosEsperados) {
    throw new Error(`Se detectaron ${intervalos.length} cuadros, se esperaban ${cuadrosEsperados} (${info.width}×${info.height}).`);
  }
  return intervalos;
}

function recorteContenido(data, info, x0 = 0, x1 = info.width) {
  let minX = x1, minY = info.height, maxX = x0 - 1, maxY = -1;
  for (let y = 0; y < info.height; y++) for (let x = x0; x < x1; x++) {
    if (data[(y * info.width + x) * info.channels + 3] > 8) {
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
  }
  return maxX < minX ? null : { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function medirCajaCobre(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * info.channels, r = data[i], g = data[i + 1], b = data[i + 2];
    const cobre = data[i + 3] > 8 && r > 50 && g > 20 && r > g * 1.2 && g > b * 1.08;
    if (cobre) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
  }
  if (maxX < minX) throw new Error('No se encontró el cuerpo cobrizo para alinear la familia de alambiques.');
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function cargarCuadrosDetectados(archivo, cantidad, cortarGrifo = 0) {
  const { data, info } = await pixelesConTransparencia(archivo, true);
  const intervalos = intervalosColumnas(data, info, cantidad), cuadros = [];
  for (const intervalo of intervalos) {
    const caja = recorteContenido(data, info, intervalo.inicio, intervalo.fin + 1);
    if (!caja) throw new Error(`Cuadro vacío detectado en ${path.basename(archivo)}.`);
    let recorte = caja;
    if (cortarGrifo > 0) {
      // Se corta el apéndice superior del grifo, justo antes de la cúpula.
      const corte = Math.max(1, Math.floor(caja.height * cortarGrifo));
      recorte = { ...caja, top: caja.top + corte, height: caja.height - corte };
    }
    cuadros.push(await sharp(data, { raw: info }).extract(recorte).png().toBuffer());
  }
  return cuadros;
}

function medirVidrios(frame, ancho, alto, cantidad, rangoY) {
  return sharp(frame).ensureAlpha().raw().toBuffer({ resolveWithObject: true }).then(({ data, info }) => {
    const x0 = Math.floor(ancho * .38), x1 = Math.ceil(ancho * .62);
    const y0 = Math.floor(alto * rangoY[0]), y1 = Math.ceil(alto * rangoY[1]);
    const activos = new Uint8Array(alto);
    for (let y = y0; y < y1; y++) {
      let n = 0;
      for (let x = x0; x < x1; x++) {
        const i = (y * ancho + x) * info.channels, r = data[i], g = data[i + 1], b = data[i + 2];
        const grisOscuro = data[i + 3] > 200 && Math.min(r, g, b) > 10 && Math.max(r, g, b) < 125 && Math.max(r, g, b) - Math.min(r, g, b) < 32;
        if (grisOscuro) n++;
      }
      activos[y] = n >= 8 ? 1 : 0;
    }
    const bandas = [];
    let inicio = -1;
    for (let y = y0; y <= y1; y++) {
      if (y < y1 && activos[y] && inicio < 0) inicio = y;
      if ((y === y1 || !activos[y]) && inicio >= 0) {
        if (y - inicio >= Math.max(12, Math.round(alto * .045))) bandas.push({ y: inicio, alto: y - inicio });
        inicio = -1;
      }
    }
    bandas.sort((a, b) => b.alto - a.alto);
    const elegidas = bandas.slice(0, cantidad).sort((a, b) => a.y - b.y);
    if (elegidas.length !== cantidad) throw new Error(`No se detectó(n) ${cantidad} visor(es) oscuros en un cuadro ${ancho}×${alto}.`);
    return elegidas.map((banda) => {
      let minX = ancho, maxX = -1;
      for (let y = banda.y; y < banda.y + banda.alto; y++) for (let x = x0; x < x1; x++) {
        const i = (y * ancho + x) * info.channels, r = data[i], g = data[i + 1], b = data[i + 2];
        if (data[i + 3] > 200 && Math.min(r, g, b) > 10 && Math.max(r, g, b) < 125 && Math.max(r, g, b) - Math.min(r, g, b) < 32) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
      }
      if (maxX < minX) throw new Error('No se pudo medir el ancho del visor.');
      return { x: minX / ancho, y: banda.y / alto, ancho: (maxX - minX + 1) / ancho, alto: banda.alto / alto };
    });
  });
}

async function componerHoja(frames, anchoCuadro, altoCuadro, { alineacion = 'centro', nombres = [], vidrios = 0, rangoVisores = [.1, .9], dimensionesComunes = null, escalaOverride = null } = {}) {
  const metadatos = await Promise.all(frames.map((frame) => sharp(frame).metadata()));
  const maxW = dimensionesComunes?.width ?? Math.max(...metadatos.map((m) => m.width));
  const maxH = dimensionesComunes?.height ?? Math.max(...metadatos.map((m) => m.height));
  const escala = escalaOverride ?? Math.min((anchoCuadro - 8) / maxW, (altoCuadro - 8) / maxH);
  const salidaFrames = [], visoresPorCuadro = [];
  for (let i = 0; i < frames.length; i++) {
    const m = metadatos[i], w = Math.max(1, Math.round(m.width * escala)), h = Math.max(1, Math.round(m.height * escala));
    let contenido = await sharp(frames[i]).resize(w, h).png().toBuffer();
    const recorteAncho = Math.min(anchoCuadro, w), recorteAlto = Math.min(altoCuadro, h);
    if (recorteAncho !== w || recorteAlto !== h) {
      const recorteX = Math.floor((w - recorteAncho) / 2);
      const recorteY = alineacion === 'base' ? h - recorteAlto : Math.floor((h - recorteAlto) / 2);
      contenido = await sharp(contenido).extract({ left: recorteX, top: recorteY, width: recorteAncho, height: recorteAlto }).png().toBuffer();
    }
    const left = Math.round((anchoCuadro - recorteAncho) / 2), top = alineacion === 'base' ? altoCuadro - recorteAlto - 4 : Math.round((altoCuadro - recorteAlto) / 2);
    const cuadro = await sharp({ create: { width: anchoCuadro, height: altoCuadro, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: contenido, left, top }]).png().toBuffer();
    salidaFrames.push(cuadro);
    if (vidrios) {
      const medidos = await medirVidrios(cuadro, anchoCuadro, altoCuadro, vidrios, rangoVisores);
      visoresPorCuadro.push(vidrios === 1 ? { principal: medidos[0] } : { superior: medidos[0], inferior: medidos[1] });
    }
  }
  const buffer = await sharp({ create: { width: anchoCuadro * salidaFrames.length, height: altoCuadro, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(salidaFrames.map((input, i) => ({ input, left: i * anchoCuadro, top: 0 })))
    .png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
  return { buffer, visoresPorCuadro, escala };
}

async function procesarFamiliasDia2() {
  for (const familia of familias) {
    const grupo = [];
    for (const hoja of familia.hojas) {
      const archivo = path.join(origen, hoja.archivo);
      try { await fs.access(archivo); }
      catch {
        const base = `${familia.familia}_${hoja.estado}`, key = base.replaceAll('_', '-');
        console.warn(`[assets] Falta ${hoja.archivo}; ${key} queda ausente.`);
        registrarAusente(key, `sprites/${base}.png`, 'spritesheet', { width: familia.ancho * hoja.cuadros, height: familia.alto, frameWidth: familia.ancho, frameHeight: familia.alto, frameCount: hoja.cuadros });
        registrarAusente(`${key}-meta`, `sprites/${base}.json`, 'json');
        continue;
      }
      grupo.push({ hoja, frames: await cargarCuadrosDetectados(archivo, hoja.cuadros, familia.cortarGrifo) });
    }
    const todos = grupo.flatMap((item) => item.frames);
    if (!todos.length) continue;
    // Reposo define el tamaño del cuerpo. Los cuadros de falla pueden extender
    // el líquido fuera del tanque, pero no deben hacer que el equipo se encoja.
    const cuadrosReposo = grupo.find((item) => item.hoja.estado === 'reposo')?.frames || todos;
    const dimensiones = await Promise.all(cuadrosReposo.map((frame) => sharp(frame).metadata()));
    const dimensionesComunes = { width: Math.max(...dimensiones.map((m) => m.width)), height: Math.max(...dimensiones.map((m) => m.height)) };
    const escalaReposo = Math.min((familia.ancho - 8) / dimensionesComunes.width, (familia.alto - 8) / dimensionesComunes.height);
    const cajasReposo = await Promise.all(cuadrosReposo.map(medirCajaCobre));
    const altoCuerpoObjetivo = Math.max(...cajasReposo.map((caja) => caja.height)) * escalaReposo;
    for (const item of grupo) {
      const cajasEstado = await Promise.all(item.frames.map(medirCajaCobre));
      const escalaEstado = altoCuerpoObjetivo / Math.max(...cajasEstado.map((caja) => caja.height));
      const salida = await componerHoja(item.frames, familia.ancho, familia.alto, {
        alineacion: 'base', nombres: item.frames.map((_, i) => i), vidrios: familia.visores, rangoVisores: familia.rangoVisores, dimensionesComunes, escalaOverride: escalaEstado,
      });
      const base = `${familia.familia}_${item.hoja.estado}`;
      const rel = `sprites/${base}.png`, pathAbsoluta = path.join(salidaAssets, rel);
      await fs.writeFile(pathAbsoluta, salida.buffer);
      const meta = {
        archivo: rel, familia: familia.familia, estado: item.hoja.estado,
        frameWidth: familia.ancho, frameHeight: familia.alto, frameCount: item.frames.length,
        escalaComun: salida.escala, visoresPorCuadro: salida.visoresPorCuadro,
        visores: salida.visoresPorCuadro[0],
      };
      const jsonRel = `sprites/${base}.json`;
      await fs.writeFile(path.join(salidaAssets, jsonRel), `${JSON.stringify(meta, null, 2)}\n`);
      agregarEntrada({ key: base.replaceAll('_', '-'), pathRel: rel, type: 'spritesheet', width: familia.ancho * item.frames.length, height: familia.alto, frameWidth: familia.ancho, frameHeight: familia.alto, frameCount: item.frames.length, columns: item.frames.length, rows: 1 });
      agregarEntrada({ key: `${base.replaceAll('_', '-')}-meta`, pathRel: jsonRel, type: 'json' });
      console.info(`[assets] ${item.hoja.archivo} → ${rel} (${item.frames.length} cuadros de ${familia.ancho}×${familia.alto})`);
    }
  }
}

async function procesarHojaDia2({ archivo, salida, key, cuadros, tamano, tipo = 'sprite', cortarGrifo = false }) {
  const entrada = path.join(origen, archivo);
  try { await fs.access(entrada); }
  catch {
    console.warn(`[assets] Falta ${archivo}; se marca ${key} como ausente.`);
    registrarAusente(key, salida, 'spritesheet', { width: tamano * cuadros, height: tamano, frameWidth: tamano, frameHeight: tamano, frameCount: cuadros });
    registrarAusente(`${key}-meta`, salida.replace(/\.png$/i, '.json'), 'json');
    return;
  }
  const frames = await cargarCuadrosDetectados(entrada, cuadros, cortarGrifo);
  const hoja = await componerHoja(frames, tamano, tamano, { alineacion: 'centro' });
  const destino = path.join(salidaAssets, salida);
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await fs.writeFile(destino, hoja.buffer);
  const meta = { archivo: salida, frameWidth: tamano, frameHeight: tamano, frameCount: cuadros };
  const jsonRel = salida.replace(/\.png$/i, '.json');
  await fs.writeFile(path.join(salidaAssets, jsonRel), `${JSON.stringify(meta, null, 2)}\n`);
  agregarEntrada({ key, pathRel: salida, type: 'spritesheet', width: tamano * cuadros, height: tamano, frameWidth: tamano, frameHeight: tamano, frameCount: cuadros, columns: cuadros, rows: 1 });
  agregarEntrada({ key: `${key}-meta`, pathRel: jsonRel, type: 'json' });
  console.info(`[assets] ${archivo} → ${salida} (${cuadros} cuadros de ${tamano}×${tamano})`);
}

async function procesarPiezasAlambique() {
  const archivo = path.join(origen, 'alambique_partes.jpg');
  try { await fs.access(archivo); }
  catch {
    console.warn('[assets] Falta alambique_partes.jpg; se omiten sus piezas.');
    for (const nombre of ['alambique_liquido', 'chorro_entrada', 'flujo_tuberia_salida']) registrarAusente(nombre.replaceAll('_', '-'), `sprites/${nombre}.png`);
    return;
  }
  const { data, info } = await pixelesConTransparencia(archivo, true);
  const runs = intervalosColumnas(data, info, 3);
  const nombres = ['alambique_liquido', 'chorro_entrada', 'flujo_tuberia_salida'];
  for (let i = 0; i < runs.length; i++) {
    const caja = recorteContenido(data, info, runs[i].inicio, runs[i].fin + 1);
    const recorte = await sharp(data, { raw: info }).extract(caja).png().toBuffer();
    const { data: pix, info: pixInfo } = await sharp(recorte).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const limpio = await sharp(pix, { raw: pixInfo }).resize(64, 64, { fit: 'inside' }).png().toBuffer();
    const salida = `sprites/${nombres[i]}.png`;
    await fs.writeFile(path.join(salidaAssets, salida), limpio);
    agregarEntrada({ key: nombres[i].replaceAll('_', '-'), pathRel: salida });
    console.info(`[assets] alambique_partes.jpg → ${salida}`);
  }
}

async function procesarMarcasEIndicadores() {
  // La runa blanca existente se conserva como arte base; estas variantes solo
  // agregan los tres estados cromáticos declarados en el diseño del indicador.
  const archivo = path.join(origen, 'alarma_runa.png');
  try {
    await fs.access(archivo);
    const { data, info } = await pixelesConTransparencia(archivo, true);
    const caja = limitesAlfa(data, info);
    const base = await sharp(data, { raw: info }).extract(caja).png().toBuffer();
    const colores = ['#70777A', '#FFD700', '#FF1744'];
    const cuadros = await Promise.all(colores.map((color) => sharp(base).tint(color).resize(32, 32, { fit: 'inside' }).png().toBuffer()));
    const composiciones = cuadros.map((input, i) => ({ input, left: i * 32, top: 0 }));
    const buffer = await sharp({ create: { width: 96, height: 32, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(composiciones).png({ compressionLevel: 9 }).toBuffer();
    await fs.writeFile(path.join(salidaSprites, 'alarma_runa_estados.png'), buffer);
    const meta = { frameWidth: 32, frameHeight: 32, frameCount: 3, estados: ['normal', 'H', 'HH'] };
    await fs.writeFile(path.join(salidaSprites, 'alarma_runa_estados.json'), `${JSON.stringify(meta, null, 2)}\n`);
    agregarEntrada({ key: 'alarma-runa-estados', pathRel: 'sprites/alarma_runa_estados.png', type: 'spritesheet', width: 96, height: 32, frameWidth: 32, frameHeight: 32, frameCount: 3, columns: 3, rows: 1 });
    agregarEntrada({ key: 'alarma-runa-estados-meta', pathRel: 'sprites/alarma_runa_estados.json', type: 'json' });
  } catch {
    console.warn('[assets] Falta alarma_runa.png; runa con respaldo geométrico.');
    registrarAusente('alarma-runa-estados', 'sprites/alarma_runa_estados.png', 'spritesheet', { frameWidth: 32, frameHeight: 32 });
    registrarAusente('alarma-runa-estados-meta', 'sprites/alarma_runa_estados.json', 'json');
  }
}

async function procesarFondosDia2() {
  for (const [archivo, destino, quitarColor] of [
    ['fondo_lejano.png', 'fondos/fondo_lejano.png', false],
    ['fondo_medio.png', 'fondos/fondo_medio.png', false],
    ['fondo_cercano.png', 'fondos/fondo_cercano.png', true],
  ]) {
    const entrada = path.join(origen, archivo);
    try { await fs.access(entrada); }
    catch { console.warn(`[assets] Falta ${archivo}; fondo de esa capa ausente.`); registrarAusente(path.basename(destino, '.png').replaceAll('_', '-'), destino); continue; }
    const { data, info } = await pixelesConTransparencia(entrada, quitarColor);
    const salida = await sharp(data, { raw: info }).resize(1280, 720, { fit: 'fill' }).png({ compressionLevel: 9 }).toBuffer();
    await fs.writeFile(path.join(salidaAssets, destino), salida);
    agregarEntrada({ key: path.basename(destino, '.png').replaceAll('_', '-'), pathRel: destino });
  }
}

async function procesarTilesDia2() {
  const entrada = path.join(origen, 'laboratorio_tiles.png');
  try { await fs.access(entrada); }
  catch { console.warn('[assets] Falta laboratorio_tiles.png; mosaicos de respaldo ausentes.'); registrarAusente('laboratorio-tiles', 'tiles/laboratorio_tiles.png', 'spritesheet', { width: 256, height: 128, frameWidth: 32, frameHeight: 32, frameCount: 32 }); registrarAusente('laboratorio-tiles-meta', 'tiles/laboratorio_tiles.json', 'json'); return; }
  const { data, info } = await pixelesConTransparencia(entrada, true);
  const columnas = 8, filas = 4, cuadros = [];
  for (let fila = 0; fila < filas; fila++) for (let col = 0; col < columnas; col++) {
    const caja = { left: Math.floor(col * info.width / columnas), top: Math.floor(fila * info.height / filas), width: Math.floor((col + 1) * info.width / columnas) - Math.floor(col * info.width / columnas), height: Math.floor((fila + 1) * info.height / filas) - Math.floor(fila * info.height / filas) };
    const frame = await sharp(data, { raw: info }).extract(caja).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    cuadros.push(frame);
  }
  const salida = await sharp({ create: { width: 256, height: 128, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(cuadros.map((input, i) => ({ input, left: (i % columnas) * 32, top: Math.floor(i / columnas) * 32 }))).png({ compressionLevel: 9 }).toBuffer();
  await fs.writeFile(path.join(salidaTiles, 'laboratorio_tiles.png'), salida);
  const meta = { frameWidth: 32, frameHeight: 32, frameCount: 32, columnas: 8, filas: 4 };
  await fs.writeFile(path.join(salidaTiles, 'laboratorio_tiles.json'), `${JSON.stringify(meta, null, 2)}\n`);
  agregarEntrada({ key: 'laboratorio-tiles', pathRel: 'tiles/laboratorio_tiles.png', type: 'spritesheet', width: 256, height: 128, frameWidth: 32, frameHeight: 32, frameCount: 32, columns: 8, rows: 4 });
  agregarEntrada({ key: 'laboratorio-tiles-meta', pathRel: 'tiles/laboratorio_tiles.json', type: 'json' });
}

function registrarLegacy() {
  registroLegacy();
}

async function registrarHojasEquipo() {
  for (const familia of familiasEquipo) {
    const metadataPath = path.join(salidaAssets, familia.archivo);
    try {
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      for (const [estado, cuadros] of Object.entries(metadata.cuadros || {})) {
        const hoja = `sprites/${familia.familia}_${estado}.png`;
        agregarEntrada({
          key: `${familia.key}-${estado}`, pathRel: hoja, type: 'spritesheet',
          width: metadata.frameWidth * cuadros, height: metadata.frameHeight,
          frameWidth: metadata.frameWidth, frameHeight: metadata.frameHeight,
          frameCount: cuadros, columns: cuadros, rows: 1,
        });
      }
      agregarEntrada({ key: `${familia.key}-meta`, pathRel: familia.archivo, type: 'json' });
    } catch (error) {
      console.warn(`[assets] No se pudo registrar ${familia.archivo}: ${error.message}`);
      registrarAusente(`${familia.key}-meta`, familia.archivo, 'json');
    }
  }
}

async function escribirManifiesto() {
  const audio = [
    'musica_menu', 'musica_operacion', 'musica_perturbacion', 'musica_superado', 'musica_fallido',
    'sfx_interfaz_clic', 'sfx_interfaz_aceptar', 'sfx_interfaz_cancelar', 'sfx_actuador_mover', 'sfx_actuador_tope',
    'sfx_perturbacion_aviso', 'sfx_perturbacion_inicio', 'sfx_perturbacion_fin', 'sfx_resultado_superado', 'sfx_resultado_fallido',
    'sfx_modelo_en_banda', 'sfx_modelo_fuera_banda', 'sfx_modelo_cambio_referencia', 'sfx_alarma_h', 'sfx_alarma_hh', 'sfx_modelo_desborde',
  ];
  for (const nombre of audio) {
    const files = [`assets/audio/${nombre}.ogg`, `assets/audio/${nombre}.mp3`];
    const presentes = await Promise.all(files.map(async (f) => { try { await fs.access(path.join(salidaAssets, f.replace('assets/', ''))); return true; } catch { return false; } }));
    const disponible = presentes.some(Boolean);
    agregarEntrada({ key: nombre, type: 'audio', pathRel: files.find((_, i) => presentes[i]) || files[0], files, available: disponible });
    if (!disponible) console.warn(`[assets] Audio ${nombre} aún no procesado; se usará silencio.`);
  }
  for (const entrada of entradasManifiesto) {
    if (entrada.available !== undefined) continue;
    try { await fs.access(path.join(salidaAssets, entrada.path)); entrada.available = true; }
    catch { entrada.available = false; console.warn(`[assets] Recurso ${entrada.key} no generado; se usará el respaldo.`); }
  }
  await fs.writeFile(path.join(salidaAssets, 'manifest.json'), `${JSON.stringify({ version: 2, resources: entradasManifiesto }, null, 2)}\n`);
}

await Promise.all([fs.mkdir(salidaSprites, { recursive: true }), fs.mkdir(salidaFondos, { recursive: true }), fs.mkdir(salidaEfectos, { recursive: true }), fs.mkdir(salidaTiles, { recursive: true })]);
registrarLegacy();
await registrarHojasEquipo();
await procesarFamiliasDia2();
await procesarHojaDia2({ archivo: 'valvula_tira.jpg', salida: 'sprites/valvula_tira.png', key: 'valvula-tira', cuadros: 5, tamano: 64 });
await procesarPiezasAlambique();
for (const spec of [
  ['perturbacion_cucharon_aviso.jpg', 'efectos/perturbacion_cucharon_aviso.png', 'cucharon-aviso', 3],
  ['perturbacion_cucharon_activa.png', 'efectos/perturbacion_cucharon_activa.png', 'cucharon-activa', 4],
  ['perturbacion_cucharon_fin.png', 'efectos/perturbacion_cucharon_fin.png', 'cucharon-fin', 3],
  ['perturbacion_sifon_aviso.png', 'efectos/perturbacion_sifon_aviso.png', 'sifon-aviso', 3],
  ['perturbacion_sifon_activa.png', 'efectos/perturbacion_sifon_activa.png', 'sifon-activa', 4],
  ['perturbacion_sifon_fin.png', 'efectos/perturbacion_sifon_fin.png', 'sifon-fin', 3],
  ['deco_engranaje.png', 'sprites/deco_engranaje.png', 'deco-engranaje', 4],
  ['deco_frasco.png', 'sprites/deco_frasco.png', 'deco-frasco', 4],
  ['deco_vela.png', 'sprites/deco_vela.png', 'deco-vela', 4],
  ['efecto_salpicadura.png', 'efectos/efecto_salpicadura.png', 'efecto-salpicadura', 5],
  ['efecto_vapor.png', 'efectos/efecto_vapor.png', 'efecto-vapor', 6],
  ['efecto_chispa.png', 'efectos/efecto_chispa.png', 'efecto-chispa', 4],
  ['efecto_polvo.png', 'efectos/efecto_polvo.png', 'efecto-polvo', 4],
  ['efecto_aparicion.png', 'efectos/efecto_aparicion.png', 'efecto-aparicion', 5],
  ['efecto_desborde.png', 'efectos/efecto_desborde.png', 'efecto-desborde', 6],
]) await procesarHojaDia2({ archivo: spec[0], salida: spec[1], key: spec[2], cuadros: spec[3], tamano: 64 });
await procesarMarcasEIndicadores();
await procesarFondosDia2();
await procesarTilesDia2();

await escribirManifiesto();
