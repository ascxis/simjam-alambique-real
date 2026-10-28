import test from 'node:test';
import assert from 'node:assert/strict';
import { rk4, euler } from '../src/modelo/integrador.js';
import { Actuador } from '../src/modelo/actuador.js';
import { GestorEntrada } from '../src/entrada/gestorEntrada.js';
import { Registro } from '../src/modelo/registro.js';
import { crearSistemaTanques } from '../src/modelo/tanques.js';
import { readFileSync } from 'node:fs';

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
test('la fuente escalón entrega controles completos y cambia der.altura a los 2 s', () => {
  const entrada = new GestorEntrada({ fuente: 'escalon' });
  const antes = entrada.actualizar(1);
  assert.equal(antes.der.altura, 0);
  for (const mano of [antes.der, antes.izq]) {
    assert.deepEqual(Object.keys(mano).sort(), ['altura', 'dedos', 'giro', 'medidaCruda', 'pellizco', 'presente', 'puno', 'u_crudo', 'x'].sort());
    for (const campo of ['altura', 'x', 'pellizco', 'giro']) {
      assert.ok(Number.isFinite(mano[campo]));
      assert.ok(Number.isFinite(mano.u_crudo[campo]));
      assert.ok(Number.isFinite(mano.medidaCruda[campo]));
    }
  }
  assert.equal(typeof antes.pausa, 'boolean');
  const despues = entrada.actualizar(1);
  assert.equal(despues.der.altura, 1);
  assert.equal(despues.der.u_crudo.altura, 1);
});
test('el registro exporta CSV con coma, punto decimal y encabezados exactos', () => {
  const registro = new Registro({ frecuencia: 30, encabezados: ['t', 'u_crudo', 'u', 'x1', 'y'] });
  registro.agregar(1 / 30, { t: 2.5, u_crudo: 1, u: 0.75, x: [0.25], y: 0.25 });
  assert.equal(registro.csv(), 't,u_crudo,u,x1,y\n2.5,1,0.75,0.25,0.25');
});
test('el modelo de tanque coincide con el escalón Vensim en t=2 s', () => {
  const csv = readFileSync(new URL('../docs/vensim_escalon.csv', import.meta.url), 'utf8').trim().split(/\r?\n/);
  const objetivo = Number(csv.find((fila) => fila.startsWith('2;'))?.split(';')[1]);
  assert.ok(Number.isFinite(objetivo), 'la referencia Vensim contiene el dato t=2 s');
  const nivel = { tanques: 1, estadoInicial: [0.5] };
  const sistema = crearSistemaTanques(nivel);
  for (let i = 0; i < 240; i++) sistema.avanzar([0, 1, 0], 1 / 120);
  assert.ok(Math.abs(sistema.t - 2) < 1e-12);
  assert.ok(Math.abs(sistema.x[0] - objetivo) < 1e-3, `modelo=${sistema.x[0]}, Vensim=${objetivo}`);
});
