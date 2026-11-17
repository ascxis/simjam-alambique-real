// Pantalla de inicio y franja de perturbación: textos coherentes con niveles.json.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { instruccionesNivel, estadoPerturbacion, banda, nombreTecla } from '../src/juego/niveles/instrucciones.js';
import { obtenerPerturbacion } from '../src/modelo/niveles.js';
import { faseVisualPerturbacion } from '../src/juego/perturbaciones.js';

const niveles = JSON.parse(readFileSync(new URL('../src/modelo/niveles.json', import.meta.url), 'utf8'));
const [n1, n2, n3] = niveles;

test('instrucciones: objetivo y banda salen de niveles.json', () => {
  assert.deepEqual(banda(n1).map((v) => +v.toFixed(2)), [1.35, 1.65]);
  assert.deepEqual(banda(n3).map((v) => +v.toFixed(2)), [1.14, 1.26]);
  const i1 = instruccionesNivel(n1, { fuente: 'teclado', teclas: { subirV1: 'ArrowUp', bajarV1: 'ArrowDown' } });
  assert.match(i1.objetivo, /1,50 m/); assert.match(i1.objetivo, /30 segundos seguidos/);
  assert.match(i1.perturbacion, /Sin perturbación/);
  assert.equal(i1.controles.length, 1);
  const i3 = instruccionesNivel(n3, { fuente: 'camara' });
  assert.match(i3.objetivo, /alambique 2/); assert.match(i3.objetivo, /0,80 m/);
  assert.equal(i3.controles.length, 2);
  assert.match(instruccionesNivel(n2).avisos, /2,8 m/);
  assert.equal(nombreTecla('KeyE'), 'E');
});

test('franja: dice cuándo se abre la llave y hacia dónde va el intercambio', () => {
  const e = (nivel, t) => estadoPerturbacion(nivel, t, obtenerPerturbacion(nivel, t), faseVisualPerturbacion(nivel, t));
  assert.equal(estadoPerturbacion(n1, 10, 0, 'cerrada'), null);
  assert.equal(e(n2, 10).tono, 'calma');
  assert.equal(e(n2, 39).tono, 'aviso');
  assert.equal(e(n2, 50).sentido, 1);
  assert.equal(e(n2, 90).sentido, 0);
  assert.equal(e(n3, 10).sentido, 1, 'q_d > 0 saca poción del alambique 2');
  assert.equal(e(n3, 30).sentido, -1, 'q_d < 0 la devuelve');
});
