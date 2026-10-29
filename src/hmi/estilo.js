import { LAYOUT } from './layout.js';

const HEX = (valor) => `#${valor.toString(16).padStart(6, '0')}`;

export function fuenteInterfaz(size = 16, color = LAYOUT.colores.texto, extras = {}) {
  return {
    fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: `${size}px`, color,
    ...extras,
  };
}

export function fuenteTitulo(size = 28, extras = {}) {
  return {
    fontFamily: 'Georgia, serif', fontSize: `${size}px`, color: LAYOUT.colores.titulo,
    fontStyle: 'bold', shadow: { offsetX: 2, offsetY: 2, color: '#050608', blur: 3, fill: true }, ...extras,
  };
}

export function dibujarPanel(scene, rect, { fondo = LAYOUT.colores.fondo, alpha = .85, borde = LAYOUT.colores.borde, radio = 10, profundidad = 0 } = {}) {
  const g = scene.add.graphics().setDepth(profundidad);
  g.fillStyle(fondo, alpha).fillRoundedRect(rect.x, rect.y, rect.ancho, rect.alto, radio);
  g.lineStyle(1, borde, 1).strokeRoundedRect(rect.x, rect.y, rect.ancho, rect.alto, radio);
  return g;
}

export function crearBoton(scene, rect, etiqueta, callback, { fondo = LAYOUT.colores.cobre, texto = LAYOUT.colores.titulo, tamano = 17 } = {}) {
  const contenedor = scene.add.container(rect.x, rect.y);
  contenedor.setSize(rect.ancho, rect.alto);
  const g = scene.add.graphics();
  const pintar = (color) => {
    g.clear();
    g.fillStyle(color, 1).fillRoundedRect(0, 0, rect.ancho, rect.alto, 9);
    g.lineStyle(1, 0x1a1b1d, 1).strokeRoundedRect(0, 0, rect.ancho, rect.alto, 9);
  };
  pintar(fondo);
  const label = scene.add.text(rect.ancho / 2, rect.alto / 2, etiqueta, fuenteInterfaz(tamano, texto, { fontStyle: 'bold' })).setOrigin(.5);
  const hitArea = scene.add.zone(0, 0, rect.ancho, rect.alto).setOrigin(0, 0)
    .setInteractive(new Phaser.Geom.Rectangle(0, 0, rect.ancho, rect.alto), Phaser.Geom.Rectangle.Contains);
  hitArea.input.useHandCursor = true;
  contenedor.add([g, label, hitArea]);
  hitArea.on('pointerover', () => pintar(0xd47a3f));
  hitArea.on('pointerout', () => pintar(fondo));
  hitArea.on('pointerdown', callback);
  return contenedor;
}

export function textoConSombra(texto) {
  return texto.setShadow(2, 2, '#050608', 3, true, true);
}

export function colorTextoAlarma(color) { return HEX(color); }
