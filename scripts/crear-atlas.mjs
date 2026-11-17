// Agrupa los sprites pequeños de arte_fuente/atlas_piezas/ en un atlas de texturas
// (public/assets/sprites/piezas.png + piezas.json, formato JSON Hash de Phaser) para
// cargarlo con this.load.atlas('piezas', ...). Un atlas = una textura y menos cambios de
// textura por cuadro.
//
// Solo usa módulos de Node (zlib): lee PNG RGBA de 8 bits sin entrelazar, que es lo que
// guardan scripts/preparar_escenario.py y los recortes de arte_fuente/atlas_piezas/.
// Uso: npm run atlas
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync, deflateSync } from 'node:zlib';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRADA = join(RAIZ, 'arte_fuente', 'atlas_piezas');
const SALIDA = join(RAIZ, 'public', 'assets', 'sprites');
const ANCHO_ATLAS = 512;
const MARGEN = 2; // separación entre piezas para que el filtrado no mezcle bordes

const FIRMA = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function leerPng(buffer) {
  if (!buffer.subarray(0, 8).equals(FIRMA)) throw new Error('No es un PNG');
  let pos = 8, ancho = 0, alto = 0, tipo = 0, bits = 0, entrelazado = 0;
  const datos = [];
  while (pos < buffer.length) {
    const largo = buffer.readUInt32BE(pos);
    const nombre = buffer.toString('ascii', pos + 4, pos + 8);
    const cuerpo = buffer.subarray(pos + 8, pos + 8 + largo);
    if (nombre === 'IHDR') {
      ancho = cuerpo.readUInt32BE(0); alto = cuerpo.readUInt32BE(4);
      bits = cuerpo[8]; tipo = cuerpo[9]; entrelazado = cuerpo[12];
    } else if (nombre === 'IDAT') datos.push(cuerpo);
    else if (nombre === 'IEND') break;
    pos += 12 + largo;
  }
  if (bits !== 8 || (tipo !== 6 && tipo !== 2) || entrelazado) throw new Error('Se espera PNG RGB/RGBA de 8 bits sin entrelazar');
  const canales = tipo === 6 ? 4 : 3;
  const crudo = inflateSync(Buffer.concat(datos));
  const fila = ancho * canales;
  const px = Buffer.alloc(ancho * alto * 4);
  let previa = Buffer.alloc(fila);
  for (let y = 0; y < alto; y++) {
    const filtro = crudo[y * (fila + 1)];
    const linea = Buffer.from(crudo.subarray(y * (fila + 1) + 1, (y + 1) * (fila + 1)));
    for (let i = 0; i < fila; i++) {
      const a = i >= canales ? linea[i - canales] : 0, b = previa[i], c = i >= canales ? previa[i - canales] : 0;
      let p;
      if (filtro === 0) p = 0;
      else if (filtro === 1) p = a;
      else if (filtro === 2) p = b;
      else if (filtro === 3) p = (a + b) >> 1;
      else { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      linea[i] = (linea[i] + p) & 255;
    }
    for (let x = 0; x < ancho; x++) {
      const o = (y * ancho + x) * 4, s = x * canales;
      px[o] = linea[s]; px[o + 1] = linea[s + 1]; px[o + 2] = linea[s + 2]; px[o + 3] = canales === 4 ? linea[s + 3] : 255;
    }
    previa = linea;
  }
  return { ancho, alto, px };
}

const TABLA_CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = TABLA_CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function bloque(nombre, cuerpo) {
  const largo = Buffer.alloc(4); largo.writeUInt32BE(cuerpo.length);
  const tipoCuerpo = Buffer.concat([Buffer.from(nombre, 'ascii'), cuerpo]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(tipoCuerpo));
  return Buffer.concat([largo, tipoCuerpo, crc]);
}

export function escribirPng({ ancho, alto, px }) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0); ihdr.writeUInt32BE(alto, 4); ihdr[8] = 8; ihdr[9] = 6;
  const crudo = Buffer.alloc((ancho * 4 + 1) * alto);
  for (let y = 0; y < alto; y++) px.copy(crudo, y * (ancho * 4 + 1) + 1, y * ancho * 4, (y + 1) * ancho * 4);
  return Buffer.concat([FIRMA, bloque('IHDR', ihdr), bloque('IDAT', deflateSync(crudo, { level: 9 })), bloque('IEND', Buffer.alloc(0))]);
}

/** Empaquetado por estantes: piezas ordenadas de mayor a menor alto. */
export function empaquetar(piezas, anchoAtlas = ANCHO_ATLAS, margen = MARGEN) {
  const orden = [...piezas].sort((a, b) => b.alto - a.alto || a.nombre.localeCompare(b.nombre));
  let x = margen, y = margen, altoEstante = 0;
  for (const p of orden) {
    if (x + p.ancho + margen > anchoAtlas) { x = margen; y += altoEstante + margen; altoEstante = 0; }
    p.x = x; p.y = y; x += p.ancho + margen; altoEstante = Math.max(altoEstante, p.alto);
  }
  let alto = y + altoEstante + margen;
  alto = 2 ** Math.ceil(Math.log2(alto)); // potencia de 2
  return { ancho: anchoAtlas, alto, piezas: orden };
}

export function crearAtlas(entrada = ENTRADA, salida = SALIDA, nombre = 'piezas') {
  const piezas = readdirSync(entrada).filter((f) => f.endsWith('.png')).sort().map((archivo) => {
    const img = leerPng(readFileSync(join(entrada, archivo)));
    return { nombre: basename(archivo, '.png'), ancho: img.ancho, alto: img.alto, img };
  });
  const atlas = empaquetar(piezas);
  const px = Buffer.alloc(atlas.ancho * atlas.alto * 4);
  const frames = {};
  for (const p of atlas.piezas) {
    for (let y = 0; y < p.alto; y++) p.img.px.copy(px, ((p.y + y) * atlas.ancho + p.x) * 4, y * p.ancho * 4, (y + 1) * p.ancho * 4);
    frames[p.nombre] = {
      frame: { x: p.x, y: p.y, w: p.ancho, h: p.alto }, rotated: false, trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: p.ancho, h: p.alto }, sourceSize: { w: p.ancho, h: p.alto },
    };
  }
  writeFileSync(join(salida, `${nombre}.png`), escribirPng({ ancho: atlas.ancho, alto: atlas.alto, px }));
  const json = { frames, meta: { app: 'scripts/crear-atlas.mjs', image: `${nombre}.png`, format: 'RGBA8888', size: { w: atlas.ancho, h: atlas.alto }, scale: '1' } };
  writeFileSync(join(salida, `${nombre}.json`), `${JSON.stringify(json, null, 2)}\n`);
  return { ...atlas, frames };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const a = crearAtlas();
  console.log(`Atlas piezas: ${a.ancho}x${a.alto} px, ${Object.keys(a.frames).length} piezas -> public/assets/sprites/piezas.png/.json`);
}
