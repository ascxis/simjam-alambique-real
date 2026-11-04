import test from 'node:test';
import assert from 'node:assert/strict';
import { ResorteVisual } from '../src/juego/efectos/resorteVisual.js';

test('resorte visual integrado con RK4 responde al impulso y se amortigua', () => {
  const resorte = new ResorteVisual({ zeta: 0.3, frecuenciaHz: 12 });
  resorte.impulsar(1);
  assert.ok(resorte.actualizar(1 / 120) > 0);
  for (let i = 0; i < 60; i++) resorte.actualizar(1 / 120);
  assert.ok(Math.abs(resorte.desplazamiento()) < .03);
  assert.ok(Number.isFinite(resorte.velocidad()));
});
