import { Arranque } from './juego/Arranque.js';
import { Menu } from './juego/Menu.js';
import { Calibracion } from './juego/Calibracion.js';
import { Simulacion } from './juego/Simulacion.js';
import { Fin } from './juego/Fin.js';
import { Galeria } from './juego/Galeria.js';
import { limitarFps, FPS_OBJETIVO } from './juego/rendimiento.js';

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
  // 60 FPS de objetivo; con la cámara, src/juego/rendimiento.js baja a 30 si la detección
  // promedia menos de 20 FPS. El arte no es pixel art: antialias y posiciones redondeadas.
  fps: { target: 60, limit: 60 },
  render: { antialias: true, roundPixels: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Arranque, Menu, Calibracion, Simulacion, Fin, Galeria]
};

const juego = new Phaser.Game(config);
// Phaser fija el umbral exacto de 1000/60 ms, que pierde cuadros con vsync: se aplica el margen
// de src/juego/rendimiento.js desde el arranque.
juego.events.once('ready', () => limitarFps(juego, FPS_OBJETIVO));
