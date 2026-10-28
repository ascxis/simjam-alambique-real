const PAL = { fondo: 0xe7e8e8, tinta: '#252b2d' };

export class EscenaBase extends Phaser.Scene {
  constructor(key) { super(key); }
  crearFondo(titulo) {
    this.cameras.main.setBackgroundColor(PAL.fondo);
    this.add.text(36, 26, 'ALAMBIQUE REAL  /  EL ARTE DE LA ALQUIMIA', { fontSize: '17px', color: '#515b5e' });
    this.add.text(36, 62, titulo, { fontSize: '30px', color: PAL.tinta, fontStyle: 'bold' });
  }
  boton(x, y, texto, callback) {
    const b = this.add.text(x, y, texto, { fontSize: '18px', color: '#f7f8f8', backgroundColor: '#52666d', padding: { x: 14, y: 9 } }).setInteractive({ useHandCursor: true });
    b.on('pointerdown', callback);
    return b;
  }
}
