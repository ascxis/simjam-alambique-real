import test from 'node:test';
import assert from 'node:assert/strict';
import { EntradaGamepad } from '../src/entrada/gamepad.js';
import { EntradaTeclado } from '../src/entrada/teclado.js';
import { POR_DEFECTO, asignarControl, valorControlGamepad, cargarConfig, elegirGamepad, reposoGamepad, detectarPulsacion, nombreGamepad } from '../src/entrada/configControles.js';

// En Node 24 `navigator` es de solo lectura: se redefine para simular un gamepad.
const ponerPads = (...pads) => Object.defineProperty(globalThis, 'navigator', { value: { getGamepads: () => pads }, configurable: true, writable: true });
const quitarPads = () => { delete globalThis.navigator; };
const crearPad = (extra = {}) => ({ connected: true, mapping: 'standard', id: 'Pad de prueba', buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0], ...extra });

test('gamepad: el stick mueve v1 poco a poco y al soltarlo se conserva la apertura', () => {
  const pad = crearPad(); ponerPads(pad);
  const g = new EntradaGamepad({ config: POR_DEFECTO.gamepad });
  assert.equal(g.controles.der.altura, 0.5, 'al conectar no debe mandar nada por sí solo');
  for (let i = 0; i < 30; i++) g.actualizar(1 / 30);              // stick en reposo
  assert.equal(g.controles.der.altura, 0.5, 'en reposo v1 no cambia');
  pad.axes[3] = -1;                                               // stick derecho arriba, 1 s
  for (let i = 0; i < 30; i++) g.actualizar(1 / 30);
  assert.ok(g.controles.der.altura > 0.99, `altura ${g.controles.der.altura}`);
  pad.axes[3] = 0; g.actualizar(1 / 30); g.actualizar(1 / 30);    // soltar
  assert.ok(g.controles.der.altura > 0.99, 'al soltar el stick la válvula no debe volver sola');
  pad.axes[3] = 1;                                                // abajo 0,5 s
  for (let i = 0; i < 15; i++) g.actualizar(1 / 30);
  assert.ok(Math.abs(g.controles.der.altura - 0.75) < 0.02, `altura ${g.controles.der.altura}`);
  pad.buttons[7] = { pressed: true, value: 1 };                   // RT abre v2
  for (let i = 0; i < 15; i++) g.actualizar(1 / 30);
  assert.ok(g.controles.izq.pellizco > 0.2);
  quitarPads();
});

test('gamepad: ruido pequeño del stick (zona muerta) no mueve la válvula', () => {
  const pad = crearPad({ axes: [0.05, -0.08, 0.1, -0.1] }); ponerPads(pad);
  const g = new EntradaGamepad({ config: POR_DEFECTO.gamepad });
  for (let i = 0; i < 60; i++) g.actualizar(1 / 30);
  assert.equal(g.controles.der.altura, 0.5);
  quitarPads();
});

test('gamepad: pausa y terminar emiten el evento una sola vez por pulsación', () => {
  const pad = crearPad(); ponerPads(pad);
  const eventos = [];
  const g = new EntradaGamepad({ config: POR_DEFECTO.gamepad, emitir: (n) => eventos.push(n) });
  pad.buttons[9] = { pressed: true, value: 1 }; pad.buttons[3] = { pressed: true, value: 1 };
  g.actualizar(0.03); g.actualizar(0.03);
  assert.deepEqual(eventos.sort(), ['pausa', 'terminar']);
  quitarPads();
});

test('se elige el gamepad de mapeo estándar y se ignoran dispositivos desconectados o vacíos', () => {
  const raro = crearPad({ mapping: '', id: 'Dispositivo HID raro' });
  const bueno = crearPad({ id: 'Xbox' });
  ponerPads(null, { ...crearPad(), connected: false }, raro, bueno);
  assert.equal(elegirGamepad().id, 'Xbox');
  ponerPads(null, raro);
  assert.equal(elegirGamepad().id, 'Dispositivo HID raro');
  ponerPads(null, null);
  assert.equal(elegirGamepad(), null);
  quitarPads();
});

test('sin gamepad conectado no falla ni cambia nada', () => {
  ponerPads(null);
  const g = new EntradaGamepad({ config: POR_DEFECTO.gamepad });
  assert.doesNotThrow(() => g.actualizar(1 / 30));
  assert.equal(g.controles.der.altura, 0.5);
  quitarPads();
});

test('controles reasignados: un eje no estándar (p. ej. eje 5 con reposo en -1) controla v1', () => {
  const pad = crearPad({ axes: [0, 0, 0, 0, 0, -1] }); ponerPads(pad);
  const cfg = { ...POR_DEFECTO.gamepad, subirV1: { tipo: 'eje', indice: 5, dir: 1, base: -1 }, bajarV1: { tipo: 'boton', indice: 4 } };
  const g = new EntradaGamepad({ config: cfg });
  for (let i = 0; i < 30; i++) g.actualizar(1 / 30);
  assert.equal(g.controles.der.altura, 0.5, 'en reposo (eje en -1) no sube');
  pad.axes[5] = 1;                                   // recorre de -1 a 1
  for (let i = 0; i < 30; i++) g.actualizar(1 / 30);
  assert.ok(g.controles.der.altura > 0.99);
  quitarPads();
});

test('teclado: respeta las teclas configuradas y la tecla por defecto deja de funcionar', () => {
  const t = new EntradaTeclado({ config: { ...POR_DEFECTO.teclado, subirV1: 'KeyU', bajarV1: 'KeyJ' } });
  t.tecla('ArrowUp', true); t.actualizar(1);
  assert.equal(t.controles.der.altura, 0.5);
  t.tecla('ArrowUp', false); t.tecla('KeyU', true); t.actualizar(0.5);
  assert.ok(Math.abs(t.controles.der.altura - 0.75) < 1e-9);
  t.tecla('KeyU', false); t.tecla('KeyJ', true); t.actualizar(0.5);
  assert.ok(Math.abs(t.controles.der.altura - 0.5) < 1e-9);
});

test('asignarControl intercambia cuando otra acción ya usaba ese control', () => {
  const cfg = cargarConfig();
  assert.equal(asignarControl(cfg, 'teclado', 'subirV1', 'KeyE'), 'abrirV2');
  assert.equal(cfg.teclado.subirV1, 'KeyE'); assert.equal(cfg.teclado.abrirV2, 'ArrowUp');
});

test('valorControlGamepad: eje con zona muerta y botón analógico', () => {
  const gp = { axes: [0, 0, 0, -0.1], buttons: [{ value: 0.5, pressed: false }] };
  assert.equal(valorControlGamepad({ tipo: 'eje', indice: 3, dir: -1, base: 0 }, gp), 0);
  gp.axes[3] = -1; assert.equal(valorControlGamepad({ tipo: 'eje', indice: 3, dir: -1, base: 0 }, gp), 1);
  assert.equal(valorControlGamepad({ tipo: 'boton', indice: 0 }, gp), 0.5);
});

test('teclado y gamepad: el mando puede arrancar en la apertura real de la válvula (no en 0,5)', () => {
  const t = new EntradaTeclado({ config: POR_DEFECTO.teclado });
  t.controles.der.altura = 0.354;
  t.actualizar(1);                       // sin teclas pulsadas no debe moverse
  assert.equal(t.controles.der.altura, 0.354);
});

// Control genérico cuya cruceta es UN solo eje (eje 9): reposo 3,2857; arriba -1; abajo 0,143; izquierda 0,714; derecha -0,428.
const crearPadCrucetaEje = () => crearPad({ mapping: '', axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2857] });

test('cruceta como eje único: arriba y abajo se configuran como controles DISTINTOS', () => {
  const pad = crearPadCrucetaEje();
  const reposo = reposoGamepad(pad);
  const cfg = cargarConfig();
  pad.axes[9] = -1;                       // se pulsa ↑ para "subir"
  const arriba = detectarPulsacion(pad, reposo);
  assert.equal(arriba.discreto, true);
  assert.equal(asignarControl(cfg, 'gamepad', 'subirV1', arriba), null);
  pad.axes[9] = 3.2857;                   // suelta
  pad.axes[9] = 0.143;                    // se pulsa ↓ para "bajar"
  const abajo = detectarPulsacion(pad, reposo);
  assert.equal(abajo.discreto, true);
  assert.equal(asignarControl(cfg, 'gamepad', 'bajarV1', abajo), null, 'no debe intercambiar: son controles distintos');
  assert.notDeepEqual(cfg.gamepad.subirV1, cfg.gamepad.bajarV1);
  assert.match(nombreGamepad(cfg.gamepad.subirV1), /↑/); assert.match(nombreGamepad(cfg.gamepad.bajarV1), /↓/);
  // lectura: cada dirección activa SOLO su acción
  pad.axes[9] = -1;     assert.equal(valorControlGamepad(cfg.gamepad.subirV1, pad), 1); assert.equal(valorControlGamepad(cfg.gamepad.bajarV1, pad), 0);
  pad.axes[9] = 0.143;  assert.equal(valorControlGamepad(cfg.gamepad.subirV1, pad), 0); assert.equal(valorControlGamepad(cfg.gamepad.bajarV1, pad), 1);
  pad.axes[9] = 3.2857; assert.equal(valorControlGamepad(cfg.gamepad.subirV1, pad), 0); assert.equal(valorControlGamepad(cfg.gamepad.bajarV1, pad), 0);
});

test('cruceta como eje único: ↑ sube v1, ↓ la baja y soltar la conserva', () => {
  const pad = crearPadCrucetaEje(); ponerPads(pad);
  const reposo = reposoGamepad(pad); const cfg = cargarConfig();
  pad.axes[9] = -1; asignarControl(cfg, 'gamepad', 'subirV1', detectarPulsacion(pad, reposo));
  pad.axes[9] = 0.143; asignarControl(cfg, 'gamepad', 'bajarV1', detectarPulsacion(pad, reposo));
  pad.axes[9] = 3.2857;
  const g = new EntradaGamepad({ config: cfg.gamepad });
  g.controles.der.altura = 0.5;
  for (let i = 0; i < 15; i++) g.actualizar(1 / 30);
  assert.equal(g.controles.der.altura, 0.5, 'en reposo no se mueve');
  pad.axes[9] = -1; for (let i = 0; i < 15; i++) g.actualizar(1 / 30);     // ↑ 0,5 s
  assert.ok(Math.abs(g.controles.der.altura - 0.75) < 0.02, `tras ↑: ${g.controles.der.altura}`);
  pad.axes[9] = 3.2857; for (let i = 0; i < 15; i++) g.actualizar(1 / 30);  // soltar
  assert.ok(Math.abs(g.controles.der.altura - 0.75) < 0.02, 'al soltar se conserva');
  pad.axes[9] = 0.143; for (let i = 0; i < 30; i++) g.actualizar(1 / 30);   // ↓ 1 s
  assert.ok(Math.abs(g.controles.der.altura - 0.25) < 0.02, `tras ↓: ${g.controles.der.altura}`);
  quitarPads();
});

test('cruceta como botones 12/13 (mapeo estándar): ↑ y ↓ también quedan distintos', () => {
  const pad = crearPad(); const reposo = reposoGamepad(pad); const cfg = cargarConfig();
  pad.buttons[12] = { pressed: true, value: 1 }; const arriba = detectarPulsacion(pad, reposo); asignarControl(cfg, 'gamepad', 'subirV1', arriba);
  pad.buttons[12] = { pressed: false, value: 0 }; reposo.botones = reposoGamepad(pad).botones;
  pad.buttons[13] = { pressed: true, value: 1 }; const abajo = detectarPulsacion(pad, reposo); asignarControl(cfg, 'gamepad', 'bajarV1', abajo);
  assert.deepEqual([arriba.indice, abajo.indice], [12, 13]);
});

test('stick analógico: se sigue configurando por dirección (arriba y abajo distintos)', () => {
  const pad = crearPad({ axes: [0, 0, 0, 0] }); const reposo = reposoGamepad(pad);
  pad.axes[3] = -1; const arriba = detectarPulsacion(pad, reposo);
  pad.axes[3] = 1; const abajo = detectarPulsacion(pad, reposo);
  assert.deepEqual([arriba.dir, abajo.dir], [-1, 1]);
});
