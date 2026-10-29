import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const raiz = process.cwd();
const origen = path.join(raiz, 'public/assets/originales');
const salidaSprites = path.join(raiz, 'public/assets/sprites');
const salidaFondos = path.join(raiz, 'public/assets/fondos');

// Medidas y distribución tomadas de docs/recursos.md.
const recursos = [
  { archivo: 'alambique_cuerpo_vacio.png', destino: 'sprites/alambique_cuerpo_vacio.png', ancho: 215, alto: 300 },
  { archivo: 'alambique_columna_liquido.jpg', destino: 'sprites/alambique_cascada.png', recorteFraccion: [.063, .115, .433, .972], altoObjetivo: 510, visores: {
    superior: [.213, .253, .227, .447], inferior: [.213, .661, .227, .853],
  } },
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
