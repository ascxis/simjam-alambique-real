import { Arranque } from './juego/Arranque.js';
import { Menu } from './juego/Menu.js';
import { Calibracion } from './juego/Calibracion.js';
import { Simulacion } from './juego/Simulacion.js';
import { Fin } from './juego/Fin.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: 0xe7e8e8,
  dom: { createContainer: true },
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Arranque, Menu, Calibracion, Simulacion, Fin]
};

new Phaser.Game(config);
