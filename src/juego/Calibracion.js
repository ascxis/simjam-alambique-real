import { EscenaBase } from './EscenaBase.js';
import { contextoJuego } from './contexto.js';
import { LAYOUT } from '../hmi/layout.js';
import { fuenteInterfaz, fuenteTitulo } from '../hmi/estilo.js';

export class Calibracion extends EscenaBase {
  constructor() { super('Calibracion'); }
  create() {
    this.crearFondo();
    const C = LAYOUT.calibracion;
    this.panel(C.panel);
    this.add.text(C.panel.x + 60, C.panel.y + 35, 'Calibración de las manos', fuenteTitulo(30));
    const pasos = [
      { canal: 'altura', lado: 'min', instruccion: 'Mano abajo' }, { canal: 'altura', lado: 'max', instruccion: 'Mano arriba' },
      { canal: 'pellizco', lado: 'min', instruccion: 'Pellizco cerrado' }, { canal: 'pellizco', lado: 'max', instruccion: 'Pellizco abierto' },
      { canal: 'giro', lado: 'min', instruccion: 'Giro a la izquierda' }, { canal: 'giro', lado: 'max', instruccion: 'Giro a la derecha' }
    ];
    const tareas = ['der', 'izq'].flatMap((mano) => pasos.map((paso) => ({ ...paso, mano })));
    let indice = 0, segundo = 3, acumulados = [];
    const texto = this.add.text(C.texto.x, C.texto.y, '', fuenteInterfaz(23, '#E6E8EA')).setWordWrapWidth(C.texto.ancho);
    const mostrar = () => {
      if (indice >= tareas.length) { contextoJuego.gestor.camara.guardarCalibracion(); texto.setText('Calibración de ambas manos guardada.'); this.time.delayedCall(1200, () => this.scene.start('Menu')); return; }
      const tarea = tareas[indice]; segundo = 3; acumulados = [];
      texto.setText(`Mano ${tarea.mano === 'der' ? 'derecha' : 'izquierda'} · ${tarea.instruccion}\nMantén la posición: ${segundo} s`);
      this.time.addEvent({ delay: 1000, repeat: 2, callback: () => {
        const estado = contextoJuego.gestor.camara.controles[tarea.mano], valorCrudo = estado.medidaCruda?.[tarea.canal];
        if (estado.presente && Number.isFinite(valorCrudo)) acumulados.push(valorCrudo);
        segundo -= 1;
        texto.setText(`Mano ${tarea.mano === 'der' ? 'derecha' : 'izquierda'} · ${tarea.instruccion}\nMantén la posición: ${segundo} s${estado.presente ? '' : ' · muestra la mano dentro de la zona'}`);
        if (segundo === 0) {
          if (acumulados.length) { const valor = acumulados.reduce((a, b) => a + b, 0) / acumulados.length; const cal = contextoJuego.gestor.camara.calibracion[tarea.mano] ||= {}; cal[tarea.canal] ||= {}; cal[tarea.canal][tarea.lado] = valor; indice += 1; }
          else texto.setText(`No detecté la mano ${tarea.mano === 'der' ? 'derecha' : 'izquierda'} dentro de la zona. Repetimos este paso.`);
          this.time.delayedCall(250, mostrar);
        }
      } });
    };
    mostrar(); this.boton(C.boton, 'Omitir calibración', () => this.scene.start('Menu'));
  }
}
