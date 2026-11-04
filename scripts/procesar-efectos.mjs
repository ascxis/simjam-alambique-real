import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const raiz = process.cwd();
const entrada = path.join(raiz, 'arte_fuente/originales');
const salida = path.join(raiz, 'public/assets/efectos');
const cuadrosPorHoja = {
  efecto_salpicadura: 5,
  efecto_vapor: 6,
  efecto_chispa: 4,
  efecto_polvo: 4,
  efecto_aparicion: 5,
  efecto_desborde: 6,
};
const lado = 64;

await fs.mkdir(salida, { recursive: true });
for (const [nombre, cantidad] of Object.entries(cuadrosPorHoja)) {
  const ruta = path.join(entrada, `${nombre}.png`);
  try {
    const { data, info } = await sharp(ruta).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const anchoCuadro = Math.floor(info.width / cantidad);
    const frames = [];
    for (let frame = 0; frame < cantidad; frame++) {
      const left = frame * anchoCuadro;
      const width = frame === cantidad - 1 ? info.width - left : anchoCuadro;
      const recorte = await sharp(data, { raw: info }).extract({ left, top: 0, width, height: info.height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let i = 0; i < recorte.data.length; i += recorte.info.channels) {
        const r = recorte.data[i], g = recorte.data[i + 1], b = recorte.data[i + 2];
        if (r > 45 && b > 45 && g < 135 && Math.min(r, b) - g > 20) {
          recorte.data[i] = 0; recorte.data[i + 1] = 0; recorte.data[i + 2] = 0; recorte.data[i + 3] = 0;
        }
      }
      const alpha = await sharp(recorte.data, { raw: recorte.info }).extractChannel(3).raw().toBuffer({ resolveWithObject: true });
      let minX = width, minY = info.height, maxX = -1, maxY = -1;
      for (let y = 0; y < info.height; y++) for (let x = 0; x < width; x++) {
        if (alpha.data[y * width + x] > 8) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
      }
      if (maxX < 0) {
        frames.push(Buffer.alloc(lado * lado * 4));
        continue;
      }
      const cropped = await sharp(recorte.data, { raw: recorte.info }).extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
        .resize(lado - 8, lado - 8, { fit: 'inside', withoutEnlargement: false }).png().toBuffer();
      const meta = await sharp(cropped).metadata();
      const canvas = await sharp({ create: { width: lado, height: lado, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: cropped, left: Math.floor((lado - meta.width) / 2), top: Math.floor((lado - meta.height) / 2) }]).png({ compressionLevel: 9 }).toBuffer();
      frames.push(canvas);
    }
    const sheet = await sharp({ create: { width: cantidad * lado, height: lado, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(frames.map((input, i) => ({ input, left: i * lado, top: 0 }))).png({ compressionLevel: 9 }).toBuffer();
    await fs.writeFile(path.join(salida, `${nombre}.png`), sheet);
    await fs.writeFile(path.join(salida, `${nombre}.json`), `${JSON.stringify({ frameWidth: lado, frameHeight: lado, cuadros: cantidad }, null, 2)}\n`);
    console.info(`[efectos] ${nombre}: ${cantidad} cuadros 64×64 (${(sheet.length / 1024).toFixed(1)} KiB)`);
  } catch (error) {
    if (error.code === 'ENOENT') console.warn(`[efectos] Falta ${nombre}.png; el juego usará partículas de Graphics.`);
    else throw error;
  }
}
