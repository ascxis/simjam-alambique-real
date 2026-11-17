import { EscenaBase } from './EscenaBase.js';
import { LAYOUT } from '../hmi/layout.js';
import { fuenteTitulo } from '../hmi/estilo.js';
import { cargarHojasEquipo, registrarAnimaciones, EFECTOS } from './animaciones.js';
import { CAPAS_FONDO } from './niveles/escenario.js';

export class Arranque extends EscenaBase {
  constructor() { super('Arranque'); }
  preload() {
    this.cameras.main.setBackgroundColor('#1C2026');
    const A = LAYOUT.arranque;
    this.panel(A.panel);
    this.textoCarga = this.add.text(A.titulo.x, A.titulo.y, 'Preparando el laboratorio…', fuenteTitulo(26));
    this.add.rectangle(A.barra.x + A.barra.ancho / 2, A.barra.y, A.barra.ancho, A.barra.alto, 0x3a3d40).setStrokeStyle(1, 0xb85a24);
    this.barraCarga = this.add.rectangle(A.barra.x, A.barra.y + A.barra.alto / 2, 0, A.barra.alto - 4, 0xb85a24).setOrigin(0, .5);
    this.load.on('progress', (valor) => this.barraCarga.setSize((A.barra.ancho - 4) * valor, A.barra.alto - 4));
    this.load.on('fileprogress', (archivo) => this.textoCarga.setText(`Cargando: ${archivo?.key || 'recurso'}…`));
    this.load.on('loaderror', (archivo) => console.warn(`[AVISO JUEGO] Recurso ausente: ${archivo?.key || archivo?.src || 'desconocido'}. Se usará la representación de respaldo.`));

    const nombresAudio = [
      'musica_menu', 'musica_operacion', 'musica_perturbacion', 'musica_superado', 'musica_fallido',
      'sfx_interfaz_clic', 'sfx_interfaz_aceptar', 'sfx_interfaz_cancelar', 'sfx_actuador_mover', 'sfx_actuador_tope',
      'sfx_perturbacion_aviso', 'sfx_perturbacion_inicio', 'sfx_perturbacion_fin', 'sfx_resultado_superado', 'sfx_resultado_fallido',
      'sfx_modelo_en_banda', 'sfx_modelo_fuera_banda', 'sfx_modelo_cambio_referencia', 'sfx_alarma_h', 'sfx_alarma_hh', 'sfx_modelo_desborde',
    ];
    for (const nombre of nombresAudio) this.load.audio(nombre, [`assets/audio/${nombre}.ogg`, `assets/audio/${nombre}.mp3`]);

    this.load.image('alambique', 'assets/sprites/alambique_cuerpo_vacio.png');
    this.load.image('liquido-referencia', 'assets/sprites/columna_liquido.png');
    this.load.image('alambique-cascada', 'assets/sprites/alambique_cascada.png');
    this.load.json('alambique-cascada-visores', 'assets/sprites/alambique_cascada.json');
    this.load.image('mesa-laboratorio', 'assets/sprites/mesa_laboratorio.png');
    // Sprites pequeños agrupados en un atlas (npm run atlas): válvula, alarma, caldero y decoraciones.
    this.load.atlas('piezas', 'assets/sprites/piezas.png', 'assets/sprites/piezas.json');
    cargarHojasEquipo(this);
    this.load.image('baldosas-laboratorio', 'assets/tiles/laboratorio_tiles.png');
    // Fondo en tres capas fijas (lejana, media y cercana): src/juego/niveles/escenario.js.
    for (const capa of Object.values(CAPAS_FONDO)) this.load.image(capa.clave, capa.archivo);
    this.load.spritesheet('interfaz', 'assets/sprites/interfaz_iconos.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('logotipo', 'assets/sprites/logotipo_titulo.png');
    this.load.image('panel-final', 'assets/sprites/pantalla_post_partida.png');
    for (const estado of ['cerrada', 'aviso', 'abierta']) {
      this.load.spritesheet(`llave-consumo-${estado}`, `assets/sprites/llave_consumo_${estado}.png`, { frameWidth: 144, frameHeight: 180 });
    }
    this.load.json('llave-consumo-puntos', 'assets/sprites/llave_consumo.json');
    for (const nombre of Object.keys(EFECTOS)) {
      this.load.spritesheet(`efecto-${nombre}`, `assets/efectos/efecto_${nombre}.png`, { frameWidth: 64, frameHeight: 64 });
      this.load.json(`efecto-${nombre}-meta`, `assets/efectos/efecto_${nombre}.json`);
    }
  }
  create() {
    registrarAnimaciones(this);
    this.scene.start('Menu');
  }
}
