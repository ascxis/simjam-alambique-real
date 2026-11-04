import { Arranque } from './juego/Arranque.js';
import { Menu } from './juego/Menu.js';
import { Calibracion } from './juego/Calibracion.js';
import { Simulacion } from './juego/Simulacion.js';
import { Fin } from './juego/Fin.js';
import { Galeria } from './juego/Galeria.js';

window.addEventListener('error', (event) => {
  console.error('[ERROR JUEGO]', event.message, event.error?.stack || '');
});
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  console.error('[ERROR JUEGO]', error?.message || String(error), error?.stack || '');
});

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: 0xe7e8e8,
  dom: { createContainer: true },
  physics: { default: 'arcade', arcade: { debug: false } },
  fps: { target: 30, limit: 30 },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Arranque, Menu, Calibracion, Simulacion, Fin, Galeria]
};

new Phaser.Game(config);
