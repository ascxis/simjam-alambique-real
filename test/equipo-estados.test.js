// Máquina de estados del equipo y funciones de representación (etapas 2 y 3).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { Equipo } from '../src/juego/entidades/Equipo.js';
import { mapear, interpolarColor, UmbralHisteresis, fraccionLiquido, giroVolante, velocidadFuncionando, colorNivel } from '../src/hmi/representacion.js';
import { crearSistemaTanques } from '../src/modelo/tanques.js';

test('representación: mapeo lineal con saturación e interpolación de color', () => {
  assert.equal(mapear(1.5, 0, 3, 0, 1), 0.5);
  assert.equal(mapear(-1, 0, 3, 0, 1), 0);
  assert.equal(mapear(9, 0, 3, 0, 1), 1);
  assert.equal(interpolarColor(0x000000, 0xffffff, 0.5), 0x808080);
  assert.equal(interpolarColor(0x112233, 0x445566, 0), 0x112233);
  assert.equal(fraccionLiquido(3), 1);
  assert.ok(Math.abs(giroVolante(1) - Math.PI * 1.5) < 1e-12);
  assert.equal(velocidadFuncionando(0), 0.5);
  assert.equal(velocidadFuncionando(0.4), 2);
  assert.equal(colorNivel(2.9), 0xff1744);
});

test('histéresis: la alarma no parpadea cuando el nivel ronda 2,8 m', () => {
  const u = new UmbralHisteresis(2.8, 2.7);
  const serie = [2.75, 2.79, 2.80, 2.78, 2.81, 2.72, 2.71, 2.79, 2.69, 2.75];
  const salida = serie.map((h) => u.actualizar(h));
  assert.deepEqual(salida, [false, false, true, true, true, true, true, true, false, false]);
  assert.throws(() => new UmbralHisteresis(2.7, 2.8));
});

test('equipo: apagado -> arranque -> funcionando -> alarma -> funcionando -> falla', () => {
  const e = new Equipo({ duracionArranque: 1.5 });
  const pasos = [];
  const avanzar = (h, qin, n = 1) => { for (let i = 0; i < n; i++) pasos.push(e.actualizar(0.1, { h: [h], qin })); return e.estado; };
  assert.equal(avanzar(0, 0), 'apagado');
  assert.equal(avanzar(0.5, 0.2), 'arranque');
  assert.equal(e.velocidad(), 0.5);
  assert.equal(avanzar(0.5, 0.2, 15), 'funcionando');
  assert.equal(e.hoja(), 'funcionando');
  assert.ok(e.velocidad() > 0.5 && e.velocidad() <= 2);
  assert.equal(avanzar(2.8, 0.4), 'alarma');
  assert.equal(e.hoja(), 'alarma');
  assert.equal(avanzar(2.75, 0.4), 'alarma', 'sigue en alarma entre 2,7 y 2,8 m');
  assert.equal(avanzar(2.69, 0.4), 'funcionando');
  assert.equal(avanzar(3.0, 0.4), 'falla');
  assert.equal(avanzar(1.0, 0.1), 'falla', 'la falla queda hasta reiniciar');
  e.reiniciar();
  assert.equal(e.estado, 'apagado');
});

test('equipo: cascada usa el mayor de los dos niveles', () => {
  const e = new Equipo();
  e.actualizar(2, { h: [1.0, 1.0], qin: 0.2 });
  e.actualizar(2, { h: [1.0, 1.0], qin: 0.2 });
  assert.equal(e.actualizar(0.1, { h: [1.0, 2.85], qin: 0.2 }), 'alarma');
});

test('equipo: la máquina de estados solo lee el modelo (no cambia la solución)', () => {
  const a = crearSistemaTanques({ tanques: 1, estadoInicial: [1.5] });
  const b = crearSistemaTanques({ tanques: 1, estadoInicial: [1.5] });
  const e = new Equipo();
  for (let n = 0; n < 1200; n++) {
    a.avanzar([0.8, 1, 0], 1 / 120);
    b.avanzar([0.8, 1, 0], 1 / 120);
    e.actualizar(1 / 120, { h: b.x, qin: 0.32 });
  }
  assert.deepEqual(a.x, b.x);
});

test('hojas de estados del equipo: mismo tamaño de cuadro que el sprite del día 1', () => {
  const tamPng = (ruta) => { const b = readFileSync(ruta); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
  for (const [equipo, [w, h]] of Object.entries({ alambique_simple: [215, 300], alambique_cascada: [395, 510] })) {
    const meta = JSON.parse(readFileSync(new URL(`../public/assets/sprites/equipo/${equipo}.json`, import.meta.url), 'utf8'));
    assert.deepEqual([meta.frameWidth, meta.frameHeight], [w, h]);
    for (const [estado, cuadros] of Object.entries({ reposo: 1, funcionando: 4, falla: 4, alarma: 2 })) {
      const ruta = new URL(`../public/assets/sprites/equipo/${equipo}_${estado}.png`, import.meta.url);
      assert.ok(existsSync(ruta), `${equipo}_${estado}.png`);
      assert.deepEqual(tamPng(ruta), { w: w * cuadros, h }, `${equipo} ${estado}: ${cuadros} cuadros de ${w}x${h}`);
    }
  }
});
