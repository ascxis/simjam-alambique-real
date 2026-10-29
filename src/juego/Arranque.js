import { EscenaBase } from './EscenaBase.js';
import { LAYOUT } from '../hmi/layout.js';
import { fuenteTitulo } from '../hmi/estilo.js';

export class Arranque extends EscenaBase {
  constructor() { super('Arranque'); }
  preload() {
    this.cameras.main.setBackgroundColor('#1C2026');
    const A = LAYOUT.arranque;
    this.panel(A.panel);
    this.add.text(A.titulo.x, A.titulo.y, 'Preparando el laboratorio…', fuenteTitulo(26));
    this.add.rectangle(A.barra.x + A.barra.ancho / 2, A.barra.y, A.barra.ancho, A.barra.alto, 0x3a3d40).setStrokeStyle(1, 0xb85a24);
    this.barraCarga = this.add.rectangle(A.barra.x, A.barra.y + A.barra.alto / 2, 0, A.barra.alto - 4, 0xb85a24).setOrigin(0, .5);
    this.load.on('progress', (valor) => this.barraCarga.setSize((A.barra.ancho - 4) * valor, A.barra.alto - 4));

    this.load.image('alambique', 'assets/sprites/alambique_cuerpo_vacio.png');
    this.load.image('liquido-referencia', 'assets/sprites/alambique_columna_liquido.png');
    this.load.image('valvula-cuerpo', 'assets/sprites/valvula_cuerpo_estatico.png');
    this.load.image('valvula-volante', 'assets/sprites/valvula_volante_aislado.png');
    this.load.image('alarma-placa', 'assets/sprites/alarma_placa.png');
    this.load.image('alarma-runa', 'assets/sprites/alarma_runa.png');
    this.load.image('fondo-laboratorio', 'assets/fondos/fondo_laboratorio.png');
    this.load.spritesheet('baldosas', 'assets/sprites/baldosas_laboratorio.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('interfaz', 'assets/sprites/interfaz_iconos.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('logotipo', 'assets/sprites/logotipo_titulo.png');
    this.load.image('panel-final', 'assets/sprites/pantalla_post_partida.png');
  }
  create() {
    // El volante sigue la salida del actuador; la animación provee el estado activo
    // del sprite y la escena aplica su giro a partir del modelo.
    this.anims.create({ key: 'valvula-en-servicio', frames: [{ key: 'valvula-volante', frame: '__BASE' }], frameRate: 1, repeat: -1 });
    this.anims.create({ key: 'runa-alerta', frames: [{ key: 'alarma-runa', frame: '__BASE' }], frameRate: 1, repeat: -1 });
    this.scene.start('Menu');
  }
}
