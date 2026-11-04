import { EscenaBase } from './EscenaBase.js';
import { LAYOUT } from '../hmi/layout.js';
import { fuenteInterfaz, fuenteTitulo } from '../hmi/estilo.js';

const ESTADOS = ['reposo', 'funcionando', 'falla', 'alarma'];
const FAMILIAS = [
  { id: 'alambique-simple', y: 118, alto: 150, ancho: 102 },
  { id: 'alambique-cascada', y: 375, alto: 150, ancho: 102 },
];
const RANGOS = {
  h1: { min: 0, max: 3, step: .01, inicial: 1.5, unidad: 'm' },
  h2: { min: 0, max: 3, step: .01, inicial: 1.2, unidad: 'm' },
  v1: { min: 0, max: 1, step: .01, inicial: .612372, unidad: '%' },
  v2: { min: 0, max: 1, step: .01, inicial: 1, unidad: '%' },
  q_d: { min: -.04, max: .08, step: .001, inicial: 0, unidad: 'm³/s' },
};

export class Galeria extends EscenaBase {
  constructor() { super('Galeria'); }

  create() {
    this.crearFondo();
    const header = { x: 20, y: 20, ancho: 1240, alto: 58, radio: 10 };
    this.panel(header);
    this.add.text(44, 34, 'Galería de equipo y animaciones', fuenteTitulo(25));
    this.boton({ x: 1080, y: 29, ancho: 150, alto: 38 }, 'Volver al menú', () => this.scene.start('Menu'));

    this.previews = [];
    for (const familia of FAMILIAS) {
      ESTADOS.forEach((estado, i) => {
        const x = 24 + i * 178, y = familia.y, key = `${familia.id}-${estado}`;
        this.panel({ x, y, ancho: 166, alto: 225, radio: 9 }, { profundidad: 0 });
        this.add.text(x + 9, y + 8, key, fuenteInterfaz(10, '#F2E6C9', { fontStyle: 'bold' })).setWordWrapWidth(148);
        const textura = this.textures.exists(key) ? key : familia.id === 'alambique-simple' ? 'alambique' : 'alambique-cascada';
        if (this.textures.exists(textura)) {
          const sprite = this.add.sprite(x + 83, y + 191, textura, 0).setOrigin(.5, 1)
            .setDisplaySize(familia.ancho, familia.alto).setDepth(2);
          if (this.anims.exists(key)) sprite.play(key);
          const datos = this.cache.json.get(`${key}-meta`);
          const vidrio = familia.id === 'alambique-simple'
            ? datos?.visores?.principal
            : datos?.visores;
          const caja = { x: x + 83 - familia.ancho / 2, y: y + 191 - familia.alto, w: familia.ancho, h: familia.alto };
          const overlay = this.add.graphics().setDepth(3);
          this.previews.push({ familia: familia.id, estado, sprite, overlay, caja, vidrio });
        }
      });
    }

    const panelX = 760, panelY = 100, panelW = 500, panelH = 540;
    this.panel({ x: panelX, y: panelY, ancho: panelW, alto: panelH, radio: 10 });
    this.add.text(panelX + 24, panelY + 18, 'Variables del modelo', fuenteTitulo(20));
    this.add.text(panelX + 24, panelY + 52, 'Arrastra los controles para recorrer el rango completo.', fuenteInterfaz(13));

    this.valores = Object.fromEntries(Object.entries(RANGOS).map(([key, rango]) => [key, rango.inicial]));
    const ruedaY = 205;
    this.ruedasGaleria = {};
    for (const [key, x] of [['v1', panelX + 125], ['v2', panelX + 365]]) {
      if (this.textures.exists('valvula-volante')) {
        this.ruedasGaleria[key] = this.add.image(x, ruedaY, 'valvula-volante').setDisplaySize(54, 54).setDepth(3);
      }
      this.add.text(x, ruedaY + 37, `${key} · válvula`, fuenteInterfaz(12)).setOrigin(.5, 0);
    }

    const controles = document.createElement('div');
    controles.style.cssText = 'box-sizing:border-box;width:440px;padding:12px 16px;background:rgba(28,32,38,.96);border:1px solid #B85A24;border-radius:8px;color:#E6E8EA;font:13px Segoe UI,Arial,sans-serif;';
    controles.innerHTML = Object.entries(RANGOS).map(([key, rango]) => `
      <label style="display:grid;grid-template-columns:45px 1fr 100px;align-items:center;gap:10px;margin:7px 0">
        <span>${key}</span>
        <input data-variable="${key}" type="range" min="${rango.min}" max="${rango.max}" step="${rango.step}" value="${rango.inicial}" style="width:100%;accent-color:#B85A24">
        <output data-valor="${key}" style="text-align:right"></output>
      </label>`).join('');
    this.domControles = this.add.dom(panelX + panelW / 2, panelY + 330, controles);
    controles.querySelectorAll('input[type=range]').forEach((input) => input.addEventListener('input', () => {
      const key = input.dataset.variable;
      this.valores[key] = Number(input.value);
      this.actualizarRepresentacion();
    }));
    this.events.once('shutdown', () => this.domControles?.destroy());

    this.textoQd = this.add.text(panelX + 35, panelY + 458, '', fuenteInterfaz(14, '#E6E8EA', { fontStyle: 'bold' }));
    this.flujoQd = this.add.graphics().setDepth(4);
    this.add.text(panelX + 35, panelY + 493, 'q_d aplicado al tanque', fuenteInterfaz(11));
    this.actualizarRepresentacion();
  }

  actualizarRepresentacion() {
    const dom = this.domControles?.node;
    if (dom) for (const [key, rango] of Object.entries(RANGOS)) {
      const output = dom.querySelector(`[data-valor="${key}"]`);
      const valor = this.valores[key];
      output.value = key.startsWith('v') ? `${Math.round(valor * 100)} %` : `${valor.toFixed(key === 'q_d' ? 3 : 2)} ${rango.unidad}`;
      output.textContent = output.value;
    }
    for (const key of ['v1', 'v2']) this.ruedasGaleria[key]?.setRotation(this.valores[key] * Math.PI * 1.5);

    for (const preview of this.previews) {
      preview.overlay.clear();
      if (preview.estado === 'funcionando' && preview.sprite.anims.currentAnim) {
        preview.sprite.anims.timeScale = .5 + 1.5 * this.valores.v1;
      }
      if (!preview.vidrio) continue;
      const pintar = (meta, altura, referencia = null) => {
        if (!meta) return;
        const { caja, overlay: g } = preview;
        const x = caja.x + meta.x * caja.w, y = caja.y + meta.y * caja.h;
        const ancho = meta.ancho * caja.w, alto = meta.alto * caja.h;
        const nivel = y + alto * (1 - Math.max(0, Math.min(3, altura)) / 3);
        g.fillStyle(0x2ecc71, .97).fillRect(x + 1, nivel, Math.max(1, ancho - 2), y + alto - nivel);
        for (const h of [2.4, 2.8]) {
          const ym = y + alto * (1 - h / 3);
          g.lineStyle(1, h > 2.5 ? 0xff1744 : 0xffd700, .95).lineBetween(x + ancho - 5, ym, x + ancho, ym);
        }
        if (Number.isFinite(referencia)) {
          const yr = y + alto * (1 - referencia / 3);
          g.lineStyle(1, 0xc9a227, 1).lineBetween(x, yr, x + ancho, yr);
        }
      };
      if (preview.familia === 'alambique-simple') pintar(preview.vidrio, this.valores.h1, 1.5);
      else {
        pintar(preview.vidrio.superior, this.valores.h1);
        pintar(preview.vidrio.inferior, this.valores.h2, 1.2);
      }
    }
    const proporcion = Math.abs(this.valores.q_d) / .08;
    this.textoQd.setText(`q_d = ${this.valores.q_d.toFixed(3)} m³/s`);
    this.flujoQd.clear();
    this.flujoQd.fillStyle(0xb85a24, 1).fillRoundedRect(975, 608, 220, 8, 4);
    this.flujoQd.fillStyle(0x2ecc71, .95).fillRoundedRect(975, 608, Math.max(3, 220 * proporcion), 8, 4);
  }
}
