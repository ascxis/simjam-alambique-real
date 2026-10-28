import { EscenaBase } from './EscenaBase.js';

export class Arranque extends EscenaBase {
  constructor() { super('Arranque'); }
  create() {
    this.crearFondo('Preparando el laboratorio');
    this.add.rectangle(640, 370, 500, 22, 0xc4c8c9);
    const bar = this.add.rectangle(390, 370, 0, 16, 0x64777d).setOrigin(0, .5);
    this.tweens.add({ targets: bar, width: 490, duration: 650, onComplete: () => this.scene.start('Menu') });
  }
}
