import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { convertirVisorSimple, convertirVisoresCascada } from '../src/hmi/tanques.js';

const json = async (nombre) => JSON.parse(await readFile(new URL(`../public/assets/sprites/${nombre}`, import.meta.url), 'utf8'));

test('metadata de visor existe para alambique simple y cascada', async () => {
  const simple = await json('alambique_simple_reposo.json');
  const cascada = await json('alambique_cascada_reposo.json');
  assert.ok(simple.visores?.principal, 'el alambique simple debe incluir las fracciones del visor');
  assert.ok(cascada.visores?.superior && cascada.visores?.inferior, 'la cascada debe incluir ambos visores');

  const cajaSimple = { x: 100, y: 80, w: 215, h: 300 };
  const visorSimple = convertirVisorSimple(cajaSimple, simple.visores.principal);
  assert.ok(visorSimple.x >= cajaSimple.x && visorSimple.x + visorSimple.w <= cajaSimple.x + cajaSimple.w);
  assert.ok(visorSimple.y >= cajaSimple.y && visorSimple.y + visorSimple.h <= cajaSimple.y + cajaSimple.h);
  assert.equal(visorSimple.y, cajaSimple.y + simple.visores.principal.y * cajaSimple.h);

  const cajaCascada = { x: 120, y: 40, w: 300, h: 510 };
  const visoresCascada = convertirVisoresCascada(cajaCascada, cascada);
  for (const key of ['superior', 'inferior']) {
    const visor = visoresCascada[key], relativo = cascada.visores[key];
    assert.ok(visor.x >= cajaCascada.x && visor.x + visor.w <= cajaCascada.x + cajaCascada.w);
    assert.ok(visor.y >= cajaCascada.y && visor.y + visor.h <= cajaCascada.y + cajaCascada.h);
    assert.equal(visor.y, cajaCascada.y + relativo.y * cajaCascada.h);
  }

  for (const [familia, visores] of [['alambique_simple', ['principal']], ['alambique_cascada', ['superior', 'inferior']]]) {
    for (const estado of ['reposo', 'funcionando', 'falla', 'alarma']) {
      const hoja = await json(`${familia}_${estado}.json`);
      for (const visor of visores) {
        const fraccion = hoja.visores?.[visor];
        assert.ok(fraccion, `${familia} ${estado} incluye metadata de ${visor}`);
        assert.ok(fraccion.x >= 0 && fraccion.y >= 0 && fraccion.ancho > 0 && fraccion.alto > 0);
        assert.ok(fraccion.x + fraccion.ancho <= 1 && fraccion.y + fraccion.alto <= 1);
      }
    }
  }
});
