import test from 'node:test';
import assert from 'node:assert/strict';
import { AVISO_PERTURBACION_MS, faseVisualPerturbacion, instantesInicioPerturbacion } from '../src/juego/perturbaciones.js';

test('llave de consumo avisa dos segundos antes y solo queda abierta en el intervalo del nivel', () => {
  const nivel = { duracion: 120, perturbacion: { tipo: 'escalon', desde: 40, hasta: 80, valor: 0.08 } };
  assert.equal(AVISO_PERTURBACION_MS, 2000);
  assert.deepEqual(instantesInicioPerturbacion(nivel), [40]);
  assert.equal(faseVisualPerturbacion(nivel, 37.99), 'cerrada');
  assert.equal(faseVisualPerturbacion(nivel, 38), 'aviso');
  assert.equal(faseVisualPerturbacion(nivel, 40.01), 'abierta');
  assert.equal(faseVisualPerturbacion(nivel, 80), 'cerrada');
});

test('intercambio senoidal avisa antes de cada cruce negativo-positivo', () => {
  const nivel = { duracion: 150, perturbacion: { tipo: 'senoidal', amplitud: 0.04, periodo: 40 } };
  assert.deepEqual(instantesInicioPerturbacion(nivel), [0, 40, 80, 120]);
  assert.equal(faseVisualPerturbacion(nivel, 38), 'aviso');
  assert.equal(faseVisualPerturbacion(nivel, 40.01), 'abierta');
  assert.equal(faseVisualPerturbacion(nivel, 65), 'cerrada');
  assert.equal(faseVisualPerturbacion(nivel, 78), 'aviso');
});
