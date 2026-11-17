// Botón "Siguiente nivel" de la pantalla final: 1 → 2 → 3 y el 3 no tiene siguiente.
import test from 'node:test';
import assert from 'node:assert/strict';
import { siguienteNivel } from '../src/juego/niveles/progresion.js';
import { cargarNiveles } from '../src/modelo/niveles.js';

test('progresión: del 1 va al 2, del 2 al 3 y el 3 (último) no tiene siguiente', () => {
  const ids = cargarNiveles().map((n) => n.id);
  assert.deepEqual(ids, [1, 2, 3], 'niveles.json tiene los niveles 1, 2 y 3');
  assert.equal(siguienteNivel(1, ids), 2);
  assert.equal(siguienteNivel(2, ids), 3);
  assert.equal(siguienteNivel(3, ids), null);
  assert.equal(siguienteNivel('2', ids), 3, 'acepta el id como texto (valor de un <select>)');
  assert.equal(siguienteNivel(9, ids), null, 'un id que no existe no tiene siguiente');
});
