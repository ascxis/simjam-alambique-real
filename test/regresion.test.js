import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { crearSistemaTanques } from '../src/modelo/tanques.js';

const lineaBaseTexto = readFileSync(new URL('../docs/linea_base_escalon.csv', import.meta.url), 'utf8').trim();
const filasLineaBase = lineaBaseTexto.split(/\r?\n/);
const columnasLineaBase = filasLineaBase[0].split(',');
const indice = Object.fromEntries(columnasLineaBase.map((nombre, i) => [nombre, i]));
const lineaBase = filasLineaBase.slice(1).map((fila) => {
  const c = fila.split(',');
  return { t: Number(c[indice.t]), u: Number(c[indice.u]), h: Number(c[indice.x1]) };
});

function interpolarCruce(muestras, objetivo) {
  for (let i = 1; i < muestras.length; i++) {
    const anterior = muestras[i - 1], actual = muestras[i];
    if (anterior.h <= objetivo && actual.h >= objetivo) {
      const fraccion = (objetivo - anterior.h) / (actual.h - anterior.h);
      return anterior.t + fraccion * (actual.t - anterior.t);
    }
  }
  return null;
}

function metricasRespuesta(muestras, nivelInicial, nivelFinal) {
  const amplitud = nivelFinal - nivelInicial;
  const t10 = interpolarCruce(muestras, nivelInicial + 0.1 * amplitud);
  const t90 = interpolarCruce(muestras, nivelInicial + 0.9 * amplitud);
  assert.notEqual(t10, null, 'la respuesta cruza 10 %');
  assert.notEqual(t90, null, 'la respuesta cruza 90 %');
  const pico = Math.max(...muestras.map((m) => m.h));
  return {
    valorFinal: muestras.at(-1).h,
    tiempoSubida: t90 - t10,
    sobreimpulso: Math.max(0, (pico - nivelFinal) / amplitud * 100),
  };
}

test('regresión del escalón: conserva la respuesta del modelo frente a la línea base', () => {
  // Parámetros y prueba de operación de docs/modelo.md: A=1, c1=0.2,
  // qin,max=0.4, h1(0)=1.5 m; v1 pasa de 0.612372 a 0.622372 en t=2 s.
  const paso = 1 / 120;
  const inicial = lineaBase[0].h;
  const sistema = crearSistemaTanques({ tanques: 1, estadoInicial: [inicial] });
  const simuladas = [{ t: 0, h: inicial }];
  const pasos = Math.round(lineaBase.at(-1).t / paso);
  for (let n = 0; n < pasos; n++) {
    const t = n * paso;
    const v1 = t < 2 ? 0.612372 : 0.622372;
    sistema.avanzar([v1, 1, 0], paso);
    simuladas.push({ t: (n + 1) * paso, h: sistema.x[0] });
  }

  const base = metricasRespuesta(lineaBase, lineaBase[0].h, lineaBase.at(-1).h);
  const modelo = metricasRespuesta(simuladas, lineaBase[0].h, lineaBase.at(-1).h);
  const errorFinalPct = Math.abs(modelo.valorFinal - base.valorFinal) / Math.abs(base.valorFinal) * 100;
  const diferenciaSubidaPct = Math.abs(modelo.tiempoSubida - base.tiempoSubida) / base.tiempoSubida * 100;

  assert.ok(errorFinalPct < 0.5, `diferencia de valor final ${errorFinalPct.toFixed(4)} %`);
  assert.ok(diferenciaSubidaPct < 2, `diferencia del tiempo 10–90 % ${diferenciaSubidaPct.toFixed(4)} %`);
  assert.ok(Math.abs(modelo.sobreimpulso - base.sobreimpulso) < 1, `diferencia de sobreimpulso ${Math.abs(modelo.sobreimpulso - base.sobreimpulso).toFixed(4)} puntos porcentuales`);
});

test('los niveles siguen iguales a la versión estable antes del día 2', () => {
  const commit = 'c168db4';
  const nivelesActuales = JSON.parse(readFileSync(new URL('../src/modelo/niveles.json', import.meta.url), 'utf8'));
  const nivelesBase = JSON.parse(execFileSync('git', ['show', `${commit}:src/modelo/niveles.json`], { encoding: 'utf8' }));
  assert.deepEqual(nivelesActuales, nivelesBase, `src/modelo/niveles.json difiere del commit ${commit}`);
});
