import test from 'node:test';
import assert from 'node:assert/strict';
import { fuenteInicial, contextoJuego } from '../src/juego/contexto.js';

test('al abrir el juego por primera vez la fuente por defecto es la cámara', () => {
  assert.equal(contextoJuego.fuenteElegida, null);
  assert.equal(fuenteInicial(null, contextoJuego.fuenteElegida), 'camara');
});

test('el parámetro ?control= de la URL manda solo antes de haber elegido algo', () => {
  assert.equal(fuenteInicial('teclado', null), 'teclado');
  assert.equal(fuenteInicial('escalon', null), 'escalon');
  assert.equal(fuenteInicial('cualquier-cosa', null), 'camara', 'valor inválido en la URL');
});

test('al volver al menú se recuerda la última fuente usada (gamepad o teclado)', () => {
  assert.equal(fuenteInicial(null, 'gamepad'), 'gamepad');
  assert.equal(fuenteInicial(null, 'teclado'), 'teclado');
  assert.equal(fuenteInicial('camara', 'teclado'), 'teclado', 'lo elegido en el menú gana sobre la URL');
});

test('si se vuelve a elegir cámara, también se recuerda', () => {
  assert.equal(fuenteInicial('teclado', 'camara'), 'camara');
});

test('un valor recordado inválido se ignora y cae a la URL o a la cámara', () => {
  assert.equal(fuenteInicial(null, 'joystick'), 'camara');
  assert.equal(fuenteInicial('gamepad', 'joystick'), 'gamepad');
});
