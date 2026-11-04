import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { convertirVisorSimple, convertirVisoresCascada } from '../src/hmi/tanques.js';

const json = async (nombre) => JSON.parse(await readFile(new URL(`../public/assets/sprites/${nombre}`, import.meta.url), 'utf8'));
const rectValido = (r) => r && r.x >= 0 && r.y >= 0 && r.w > 0 && r.h > 0 && r.x + r.w <= 1 && r.y + r.h <= 1;
const puntoValido = (p) => Array.isArray(p) && p.length === 2 && p.every((n) => Number.isFinite(n) && n >= 0 && n <= 1);

test('los metadatos nuevos ubican puntos y visores dentro de los cuadros del equipo', async () => {
  const simple = await json('alambique_simple.json');
  const cascada = await json('alambique_cascada.json');
  const manifiesto = await json('../manifest.json').catch(() => null);
  assert.ok(manifiesto?.resources);
  for (const [nombre, meta, estadoNecesario] of [
    ['alambique_simple', simple, ['reposo', 'funcionando', 'alarma', 'falla']],
    ['alambique_cascada', cascada, ['reposo', 'funcionando', 'alarma', 'falla']],
  ]) {
    assert.ok(meta.frameWidth > 0 && meta.frameHeight > 0);
    assert.ok(meta.puntos && puntoValido(meta.puntos.entrada) && puntoValido(meta.puntos.salida) && puntoValido(meta.puntos.base));
    assert.ok(rectValido(meta.puntos.visor1));
    if (nombre === 'alambique_cascada') {
      assert.ok(rectValido(meta.puntos.visor2));
      assert.ok(rectValido(meta.puntos.q12));
    }
    for (const estado of estadoNecesario) {
      const cuenta = meta.cuadros[estado];
      assert.ok(Number.isInteger(cuenta) && cuenta > 0, `cuadros.${estado} debe ser entero positivo`);
      const clave = `${nombre.replace('_', '-')}-${estado}`;
      const recurso = manifiesto.resources.find((r) => r.key === clave);
      assert.ok(recurso?.available, `el manifiesto debe cargar ${clave}`);
      assert.equal(recurso.frameWidth, meta.frameWidth);
      assert.equal(recurso.frameHeight, meta.frameHeight);
      assert.equal(recurso.frameCount, cuenta);
      const archivo = fileURLToPath(new URL(`../public/assets/sprites/${nombre}_${estado}.png`, import.meta.url));
      const info = await sharp(archivo).metadata();
      assert.equal(info.width, meta.frameWidth * cuenta);
      assert.equal(info.height, meta.frameHeight);
    }
  }

  const cajaSimple = { x: 100, y: 80, w: 150, h: 300 };
  const visorSimple = convertirVisorSimple(cajaSimple, simple);
  assert.equal(visorSimple.x, cajaSimple.x + simple.puntos.visor1.x * cajaSimple.w);
  assert.equal(visorSimple.y, cajaSimple.y + simple.puntos.visor1.y * cajaSimple.h);
  const cajaCascada = { x: 120, y: 40, w: 190, h: 475 };
  const visores = convertirVisoresCascada(cajaCascada, cascada);
  assert.equal(visores.superior.x, cajaCascada.x + cascada.puntos.visor1.x * cajaCascada.w);
  assert.equal(visores.inferior.y, cajaCascada.y + cascada.puntos.visor2.y * cajaCascada.h);
});
