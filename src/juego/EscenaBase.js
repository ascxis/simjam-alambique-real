const PAL = { fondo: 0xe7e8e8, tinta: '#252b2d' };

export class EscenaBase extends Phaser.Scene {
  constructor(key) { super(key); }
  crearFondo(titulo) {
    this.cameras.main.setBackgroundColor(PAL.fondo);
    if (this.textures.exists('fondo-laboratorio')) {
      this.fondoParallax = this.add.tileSprite(640, 360, 1280, 720, 'fondo-laboratorio')
        .setAlpha(.18).setScrollFactor(.12).setDepth(-1000);
    }
    if (this.textures.exists('baldosas')) {
      this.pisoBaldosas = this.add.tileSprite(640, 705, 1280, 30, 'baldosas', 0)
        .setTileScale(.5).setAlpha(.45).setScrollFactor(.3).setDepth(-999);
    }
    this.add.text(36, 26, 'ALAMBIQUE REAL  /  EL ARTE DE LA ALQUIMIA', { fontSize: '17px', color: '#515b5e' });
    this.add.text(36, 62, titulo, { fontSize: '30px', color: PAL.tinta, fontStyle: 'bold' });
  }
  boton(x, y, texto, callback) {
    const b = this.add.text(x, y, texto, { fontSize: '18px', color: '#f7f8f8', backgroundColor: '#52666d', padding: { x: 14, y: 9 } }).setInteractive({ useHandCursor: true });
    b.on('pointerdown', callback);
    return b;
  }
}
