import { EscenaBase } from './EscenaBase.js';
import { contextoJuego } from './contexto.js';
import { LAYOUT } from '../hmi/layout.js';
import { fuenteInterfaz, fuenteTitulo } from '../hmi/estilo.js';

export class Arranque extends EscenaBase {
  constructor() { super('Arranque'); }
  preload() {
    this.cameras.main.setBackgroundColor('#1C2026');
    const A = LAYOUT.arranque;
    this.panel(A.panel);
    this.add.text(A.titulo.x, A.titulo.y, 'Preparando el laboratorio…', fuenteTitulo(26));
    this.add.rectangle(A.barra.x + A.barra.ancho / 2, A.barra.y, A.barra.ancho, A.barra.alto, 0x3a3d40).setStrokeStyle(1, 0xb85a24);
    this.barraCarga = this.add.rectangle(A.barra.x, A.barra.y + A.barra.alto / 2, 0, A.barra.alto - 4, 0xb85a24).setOrigin(0, .5);
    this.textoProgreso = this.add.text(A.barra.x, A.barra.y + 24, '', fuenteInterfaz(14, '#E6E8EA'));
    this.recursoActual = 'Lista de recursos';
    this.recursosAusentes = contextoJuego.recursosAusentes ||= new Set();
    this.recursosAusentes.clear();

    const actualizarProgreso = (valor = 0) => {
      this.barraCarga.setSize((A.barra.ancho - 4) * valor, A.barra.alto - 4);
      this.textoProgreso.setText(`${Math.round(valor * 100)} % · ${this.recursoActual}`);
    };
    this.load.on('progress', actualizarProgreso);
    this.load.on('fileprogress', (archivo) => {
      this.recursoActual = archivo?.key || archivo?.url || 'Cargando recurso';
      actualizarProgreso(this.load.progress);
    });
    this.load.on('loaderror', (archivo) => {
      const clave = archivo?.key || archivo?.src || 'recurso desconocido';
      this.recursosAusentes.add(clave);
      console.warn(`[assets] No se pudo cargar ${clave}; se usará el respaldo visual o silencio.`);
    });
    this.load.once('filecomplete-json-assets-manifest', () => {
      this.encolarRecursos(this.cache.json.get('assets-manifest'));
    });
    this.load.once('complete', () => {
      this.recursoActual = 'Recursos listos';
      actualizarProgreso(1);
    });
    this.load.json('assets-manifest', 'assets/manifest.json');
  }

  encolarRecursos(manifiesto) {
    const recursos = manifiesto?.resources;
    if (!Array.isArray(recursos)) {
      console.warn('[assets] Manifiesto ausente o inválido; las escenas usarán sus respaldos.');
      return;
    }
    for (const recurso of recursos) {
      if (!recurso.available) {
        contextoJuego.recursosAusentes.add(recurso.key);
        console.warn(`[assets] ${recurso.key} no está disponible; se usará el respaldo visual o silencio.`);
        continue;
      }
      const ruta = `assets/${recurso.path}`;
      if (recurso.type === 'spritesheet') {
        this.load.spritesheet(recurso.key, ruta, { frameWidth: recurso.frameWidth, frameHeight: recurso.frameHeight });
      } else if (recurso.type === 'json') {
        this.load.json(recurso.key, ruta);
      } else if (recurso.type === 'audio') {
        this.load.audio(recurso.key, recurso.files || [ruta]);
      } else {
        this.load.image(recurso.key, ruta);
      }
    }
  }
  create() {
    // El volante sigue la salida del actuador; la animación provee el estado activo
    // del sprite y la escena aplica su giro a partir del modelo.
    this.anims.create({ key: 'valvula-en-servicio', frames: [{ key: 'valvula-volante', frame: '__BASE' }], frameRate: 1, repeat: -1 });
    this.anims.create({ key: 'runa-alerta', frames: [{ key: 'alarma-runa', frame: '__BASE' }], frameRate: 1, repeat: -1 });
    this.scene.start('Menu');
  }
}
