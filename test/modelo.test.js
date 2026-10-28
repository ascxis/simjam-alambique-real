import test from 'node:test';
import assert from 'node:assert/strict';
import { rk4, euler } from '../src/modelo/integrador.js';
import { Actuador } from '../src/modelo/actuador.js';

const simular = (integrador, f, x0, h, total) => { let x = x0, t = 0; while (t < total - h / 2) { x = integrador(f, x, 1, t, h); t += h; } return x[0]; };
test('RK4 reproduce sistema de primer orden K=2, tau=0.5 con escalón', () => {
  const f = ([y], u) => [(2 * u - y) / .5]; const exacta = 2 * (1 - Math.exp(-1 / .5));
  const errorRK4 = Math.abs(simular(rk4, f, [0], 1 / 120, 1) - exacta); const errorEuler = Math.abs(simular(euler, f, [0], 1 / 120, 1) - exacta);
  assert.ok(errorRK4 < 1e-4, `error RK4 = ${errorRK4}`); console.log(`Primer orden: error RK4=${errorRK4}, Euler=${errorEuler}`);
});
test('RK4 reproduce sistema de segundo orden zeta=0.3, wn=4 con escalón', () => {
  const f = ([y, v]) => [v, 16 * (1 - y) - 2 * .3 * 4 * v];
  const exacta = (t) => { const wd = 4 * Math.sqrt(1 - .3 ** 2); return 1 - Math.exp(-1.2 * t) * (Math.cos(wd * t) + 1.2 / wd * Math.sin(wd * t)); };
  let x = [0, 0], max = 0, h = 1 / 120;
  for (let i = 0; i <= 1200; i++) { const t = i * h; max = Math.max(max, Math.abs(x[0] - exacta(t))); x = rk4(f, x, 1, t, h); }
  assert.ok(max < 1e-4, `error máximo RK4 = ${max}`); console.log(`Segundo orden: error máximo RK4=${max}`);
});
test('Actuador respeta saturación y velocidad máxima', () => {
  const a = new Actuador({ minimo: 0, maximo: 1, velocidadMaxima: .25 });
  assert.equal(a.avanzar(3, 1), .25); assert.equal(a.avanzar(3, 1), .5); assert.equal(a.avanzar(-2, 10), 0);
});
