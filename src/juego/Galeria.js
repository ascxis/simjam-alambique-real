// Escena Galería (tecla G en el menú): muestra todas las animaciones con su nombre y un
// deslizador por cada variable del modelo (h1, h2, v1, v2, q_d) para ver cómo cambia la
// representación en todo el rango. Solo lee valores: no crea ni modifica el modelo.
import { EscenaBase } from './EscenaBase.js';
import { Equipo } from './entidades/Equipo.js';
import { claveEquipo, listaAnimaciones } from './animaciones.js';
import { fraccionLiquido, giroVolante, colorNivel, mapear, LIMITES } from '../hmi/representacion.js';
import { fuenteInterfaz, fuenteTitulo } from '../hmi/estilo.js';

const POCION = 0x2ecc71;
const VISOR_SIMPLE = { x: 97 / 215, y: 77 / 300, w: 16 / 215, h: 124 / 300 }; // ranura medida en el sprite
const VARIABLES = [
  { clave: 'h1', etiqueta: 'h₁ (m)', min: 0, max: 3, paso: 0.01, valor: 1.5 },
  { clave: 'h2', etiqueta: 'h₂ (m)', min: 0, max: 3, paso: 0.01, valor: 1.2 },
  { clave: 'v1', etiqueta: 'v₁', min: 0, max: 1, paso: 0.01, valor: 0.6 },
  { clave: 'v2', etiqueta: 'v₂', min: 0, max: 1, paso: 0.01, valor: 0.5 },
  { clave: 'qd', etiqueta: 'q_d (m³/s)', min: -0.04, max: 0.08, paso: 0.005, valor: 0 },
];

export class Galeria extends EscenaBase {
  constructor() { super('Galeria'); }

  create() {
    this.crearFondo();
    this.valores = Object.fromEntries(VARIABLES.map((v) => [v.clave, v.valor]));
    this.equipoSimple = new Equipo();
    this.equipoCascada = new Equipo();
    this.add.text(28, 18, 'Galería de animaciones', fuenteTitulo(26));
    this.add.text(30, 54, 'Mueve cada variable del modelo en todo su rango · G o Esc: volver al menú', fuenteInterfaz(12, '#E6E8EA'));
    this.panel({ x: 20, y: 80, ancho: 620, alto: 625, radio: 10 });
    this.panel({ x: 660, y: 80, ancho: 600, alto: 625, radio: 10 });
    this.crearVistaPrevia();
    this.crearCatalogo();
    this.crearDeslizadores();
    const volver = () => this.scene.start('Menu');
    this.input.keyboard?.on('keydown-G', volver);
    this.input.keyboard?.on('keydown-ESC', volver);
    this.boton({ x: 1090, y: 22, ancho: 160, alto: 36 }, 'Volver al menú', volver);
  }

  // ---------- vista previa guiada por las variables ----------
  crearVistaPrevia() {
    this.add.text(36, 92, 'Representación guiada por el modelo', fuenteInterfaz(14, '#F2E6C9', { fontStyle: 'bold' }));
    this.liquido = this.add.graphics().setDepth(2.5); // encima del sprite: los visores de la cascada son de vidrio opaco
    this.marcas = this.add.graphics().setDepth(3);
    // Alambique simple (niveles 1 y 2)
    const s = { x: 150, y: 300, w: 172, h: 240 };
    this.cajaSimple = s;
    this.spriteSimple = this.textures.exists(claveEquipo('alambique_simple', 'reposo'))
      ? this.add.sprite(s.x, s.y, claveEquipo('alambique_simple', 'reposo'), 0).setDisplaySize(s.w, s.h).setDepth(2) : null;
    // Cascada (nivel 3)
    const fuente = this.textures.exists('alambique-cascada') ? this.textures.get('alambique-cascada').getSourceImage() : { width: 395, height: 510 };
    const alto = 360, ancho = alto * fuente.width / fuente.height;
    this.cajaCascada = { x: 470 - ancho / 2, y: 120, w: ancho, h: alto };
    this.spriteCascada = this.textures.exists(claveEquipo('alambique_cascada', 'reposo'))
      ? this.add.sprite(470, 120 + alto / 2, claveEquipo('alambique_cascada', 'reposo'), 0).setDisplaySize(ancho, alto).setDepth(2) : null;
    const visores = this.cache.json.get('alambique-cascada-visores')?.visores;
    this.visoresCascada = visores && {
      superior: this.aCaja(visores.superior), inferior: this.aCaja(visores.inferior),
    };
    // Volante de v1 y de v2 (pieza del atlas girada según la apertura)
    const conVolante = this.textures.exists('piezas') && this.textures.get('piezas').has('valvula-volante');
    this.volanteV1 = conVolante ? this.add.image(s.x, s.y - s.h / 2 - 34, 'piezas', 'valvula-volante').setDisplaySize(46, 46).setDepth(3) : null;
    this.volanteV2 = conVolante ? this.add.image(this.cajaCascada.x + .758 * ancho, 120 + .747 * alto, 'piezas', 'valvula-volante').setDisplaySize(34, 34).setDepth(3) : null;
    // Llave de consumo (q_d)
    const tubo = this.add.graphics().setDepth(1.5);
    tubo.fillStyle(0x8c4a26, 1).fillRect(s.x - 4, s.y - s.h / 2 - 34, 8, 36);
    this.llave = this.textures.exists('llave-consumo-cerrada') ? this.add.sprite(s.x - s.w / 2 - 6, s.y + 40, 'llave-consumo-cerrada', 0).setDisplaySize(72, 90).setDepth(3) : null;
    this.chorro = this.add.graphics().setDepth(2.5);
    this.textoEstado = this.add.text(36, 478, '', fuenteInterfaz(12, '#E6E8EA', { lineSpacing: 3 })).setDepth(4);
  }

  aCaja(f) { const c = this.cajaCascada; return { x: c.x + f.x * c.w, y: c.y + f.y * c.h, w: f.ancho * c.w, h: f.alto * c.h }; }

  dibujarLiquido(visor, h, dentro = false) {
    const frac = fraccionLiquido(h), y = visor.y + visor.h * (1 - frac);
    this.liquido.fillStyle(dentro ? 0x00e676 : POCION, .98).fillRect(visor.x, y, visor.w, visor.y + visor.h - y);
    // franjas de H y HH en el visor
    for (const [lim, color] of [[LIMITES.H, 0xffd700], [LIMITES.HH, 0xff1744]]) {
      const yl = visor.y + visor.h * (1 - lim / LIMITES.hMax);
      this.marcas.lineStyle(2, color, .9).lineBetween(visor.x - 4, yl, visor.x + visor.w + 4, yl);
    }
    this.marcas.fillStyle(colorNivel(h), 1).fillCircle(visor.x + visor.w + 12, y, 4);
  }

  aplicarEquipo(sprite, equipo, maquina, h, qin, dt) {
    maquina.actualizar(dt, { h, qin });
    if (!sprite) return;
    const clave = claveEquipo(equipo, maquina.hoja());
    if (this.anims.exists(clave) && sprite.anims.currentAnim?.key !== clave) sprite.play(clave);
    sprite.anims.timeScale = maquina.velocidad();
  }

  // ---------- catálogo de animaciones ----------
  crearCatalogo() {
    this.add.text(676, 92, 'Animaciones registradas', fuenteInterfaz(14, '#F2E6C9', { fontStyle: 'bold' }));
    const lista = listaAnimaciones(this);
    const columnas = 6, celdaW = 96, celdaH = 150, x0 = 676, y0 = 118;
    lista.forEach(([clave, nombre], i) => {
      const cx = x0 + (i % columnas) * celdaW + celdaW / 2, cy = y0 + Math.floor(i / columnas) * celdaH;
      const marco = this.add.graphics();
      marco.fillStyle(0x1c2026, .75).fillRoundedRect(cx - celdaW / 2 + 3, cy, celdaW - 6, celdaH - 8, 6);
      marco.lineStyle(1, 0xb85a24, .6).strokeRoundedRect(cx - celdaW / 2 + 3, cy, celdaW - 6, celdaH - 8, 6);
      const sprite = this.add.sprite(cx, cy + 58, undefined).play(clave);
      const escala = Math.min(80 / sprite.width, 96 / sprite.height);
      sprite.setScale(escala);
      if (clave.startsWith('efecto-desborde')) sprite.on('animationcomplete', () => this.time.delayedCall(400, () => sprite.play(clave)));
      this.add.text(cx, cy + 112, nombre, fuenteInterfaz(10, '#E6E8EA', { align: 'center', wordWrap: { width: celdaW - 10 } })).setOrigin(.5, 0);
    });
    this.add.text(676, 118 + 3 * celdaH + 4, `${lista.length} animaciones · cuadros del mismo tamaño en cada hoja`, fuenteInterfaz(11, '#E6E8EA'));
  }

  // ---------- deslizadores (DOM) ----------
  crearDeslizadores() {
    // Phaser fija display:block en el nodo raíz del DOMElement: la cuadrícula va en un hijo.
    const raiz = document.createElement('div');
    const caja = document.createElement('div');
    raiz.append(caja);
    caja.style.cssText = 'display:grid;grid-template-columns:96px 1fr 54px;gap:4px 8px;align-items:center;width:580px;color:#E6E8EA;font:13px Segoe UI,Arial,sans-serif';
    for (const v of VARIABLES) {
      const etiqueta = document.createElement('span'); etiqueta.textContent = v.etiqueta;
      const slider = document.createElement('input');
      Object.assign(slider, { type: 'range', min: v.min, max: v.max, step: v.paso, value: v.valor });
      slider.style.cssText = 'accent-color:#B85A24;width:100%';
      slider.dataset.variable = v.clave;
      const valor = document.createElement('span'); valor.textContent = Number(v.valor).toFixed(v.paso < 0.01 ? 3 : 2);
      slider.addEventListener('input', () => { this.valores[v.clave] = Number(slider.value); valor.textContent = Number(slider.value).toFixed(v.paso < 0.01 ? 3 : 2); });
      caja.append(etiqueta, slider, valor);
    }
    this.domDeslizadores = this.add.dom(330, 640, raiz);
    this.events.once('shutdown', () => this.domDeslizadores?.destroy());
  }

  update(_, deltaMs) {
    const dt = Math.min(.1, (deltaMs || 16) / 1000);
    const { h1, h2, v1, v2, qd } = this.valores;
    this.liquido.clear(); this.marcas.clear(); this.chorro.clear();
    const s = this.cajaSimple;
    const visor = { x: s.x - s.w / 2 + VISOR_SIMPLE.x * s.w, y: s.y - s.h / 2 + VISOR_SIMPLE.y * s.h, w: VISOR_SIMPLE.w * s.w, h: VISOR_SIMPLE.h * s.h };
    this.dibujarLiquido(visor, h1);
    if (this.visoresCascada) { this.dibujarLiquido(this.visoresCascada.superior, h1); this.dibujarLiquido(this.visoresCascada.inferior, h2); }
    this.aplicarEquipo(this.spriteSimple, 'alambique_simple', this.equipoSimple, [h1], .4 * v1, dt);
    this.aplicarEquipo(this.spriteCascada, 'alambique_cascada', this.equipoCascada, [h1, h2], .4 * v1, dt);
    this.volanteV1?.setRotation(giroVolante(v1));
    this.volanteV2?.setRotation(giroVolante(v2));
    if (this.llave) {
      const abierta = Math.abs(qd) > 1e-4;
      const clave = abierta ? 'llave-consumo-abierta' : 'llave-consumo-cerrada';
      if (this.llave.texture.key !== clave && this.textures.exists(clave)) this.llave.setTexture(clave, 0);
      if (abierta) {
        const grosor = mapear(Math.abs(qd), 0, .08, 2, 8);
        this.chorro.lineStyle(grosor, POCION, .85).lineBetween(this.llave.x - 24, this.llave.y + 28, this.llave.x - 24, this.llave.y + 72);
      }
    }
    this.textoEstado.setText([
      `Equipo simple: ${this.equipoSimple.estado} · velocidad ×${this.equipoSimple.velocidad().toFixed(2)} (q_in = 0,4·v₁ = ${(0.4 * v1).toFixed(3)} m³/s)`,
      `Cascada: ${this.equipoCascada.estado} · alarma HH entra en 2,8 m y sale en 2,7 m · falla (desborde) en 3,0 m`,
      `Volantes: v₁ ${(v1 * 100).toFixed(0)} % → ${(giroVolante(v1) * 180 / Math.PI).toFixed(0)}° · v₂ ${(v2 * 100).toFixed(0)} % → ${(giroVolante(v2) * 180 / Math.PI).toFixed(0)}°`,
      `Consumo q_d = ${qd.toFixed(3)} m³/s → chorro de la llave ${Math.abs(qd) > 1e-4 ? 'abierto' : 'cerrado'}`,
      'La falla queda fija hasta reiniciar: vuelve a abrir la Galería para salir de ella.',
    ].join('\n'));
  }
}
