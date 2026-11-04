import test from 'node:test';
import assert from 'node:assert/strict';
import { Equipo } from '../src/juego/entidades/Equipo.js';

function equipoDePrueba() {
  const sprite = {
    anims: { currentAnim: null, timeScale: 1 },
    play(key) { this.animacion = key; this.anims.currentAnim = { key }; return this; },
    setTexture(key) { this.textura = key; return this; },
  };
  const scene = { anims: { exists: () => true }, textures: { exists: () => true } };
  return { equipo: new Equipo(scene, sprite), sprite };
}

test('Equipo aplica estados de operación, histéresis HH y fallo latched', () => {
  const { equipo, sprite } = equipoDePrueba();
  assert.equal(equipo.actualizar({ alturas: [1], qIn: .2, dt: 0 }), 'arranque');
  equipo.actualizar({ alturas: [1], qIn: .2, dt: .4 });
  assert.equal(equipo.actualizar({ alturas: [1], qIn: .2, dt: .4 }), 'funcionando');
  assert.equal(sprite.animacion, 'alambique-simple-funcionando');
  assert.equal(sprite.anims.timeScale, 1.25);
  assert.equal(equipo.actualizar({ alturas: [2.8], qIn: .2, dt: .1 }), 'alarma');
  assert.equal(equipo.actualizar({ alturas: [2.75], qIn: .2, dt: .1 }), 'alarma');
  assert.equal(equipo.actualizar({ alturas: [2.69], qIn: .2, dt: .1 }), 'funcionando');
  assert.equal(equipo.actualizar({ alturas: [3], qIn: .2, dt: .1 }), 'falla');
  assert.equal(equipo.actualizar({ alturas: [1], qIn: .2, dt: .1 }), 'falla');
});

test('Equipo de cascada usa la mayor altura para alarma y desborde', () => {
  const sprite = { anims: { currentAnim: null }, play(key) { this.animacion = key; this.anims.currentAnim = { key }; } };
  const scene = { anims: { exists: () => true }, textures: { exists: () => true } };
  const equipo = new Equipo(scene, sprite, { familia: 'alambique-cascada' });
  assert.equal(equipo.actualizar({ alturas: [1, 2.85], qIn: .2, dt: .1 }), 'alarma');
  assert.equal(equipo.actualizar({ alturas: [1, 3], qIn: .2, dt: .1 }), 'falla');
});
