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
    const tareas = [
      { mano: 'der', canal: 'altura', lado: 'min', instruccion: 'Mano derecha abajo' },
      { mano: 'der', canal: 'altura', lado: 'max', instruccion: 'Mano derecha arriba' },
      { mano: 'izq', canal: 'pellizco', lado: 'min', instruccion: 'Pellizco izquierdo cerrado' },
      { mano: 'izq', canal: 'pellizco', lado: 'max', instruccion: 'Pellizco izquierdo abierto' },
    ];
    this.tareas = tareas;
    this.indiceTarea = 0;
    this.fase = 'preparacion';
    this.tiempoFase = 0;
    this.muestras = [];
    const texto = this.add.text(C.texto.x, C.texto.y, '', fuenteInterfaz(23, '#E6E8EA')).setWordWrapWidth(C.texto.ancho);
    this.textoCalibracion = texto;
    this.iniciarPaso();
    this.boton(C.boton, 'Omitir calibración', () => this.scene.start('Menu'));
  }

  iniciarPaso() {
    if (this.indiceTarea >= this.tareas.length) {
      contextoJuego.gestor.camara.guardarCalibracion();
      this.textoCalibracion.setText('Calibración de ambas manos guardada.');
      this.time.delayedCall(1200, () => this.scene.start('Menu'));
      return;
    }
    this.fase = 'preparacion';
    this.tiempoFase = 0;
    this.muestras = [];
    this.actualizarTextoPaso();
  }

  actualizarTextoPaso(sinMano = false) {
    const tarea = this.tareas[this.indiceTarea];
    if (!tarea) return;
    const mano = tarea.mano === 'der' ? 'derecha' : 'izquierda';
    if (this.fase === 'preparacion') {
      const restante = Math.max(0, 1.5 - this.tiempoFase);
      this.textoCalibracion.setText(`Mano ${mano} · ${tarea.instruccion}\nPrepárate… ${restante.toFixed(1)} s`);
    } else {
      const restante = Math.max(0, 2 - this.tiempoFase);
      this.textoCalibracion.setText(`Mano ${mano} · ${tarea.instruccion}\nMidiendo: ${restante.toFixed(1)} s · ${this.muestras.length} muestras${sinMano ? ' · muestra la mano dentro de la zona' : ''}`);
    }
  }

  update(_, deltaMs) {
    if (!this.sys.isActive() || !this.tareas || this.indiceTarea >= this.tareas.length) return;
    if (this.fase === 'espera') return;
    this.tiempoFase += Math.max(0, deltaMs) / 1000;
    if (this.fase === 'preparacion') {
      if (this.tiempoFase >= 1.5) {
        this.fase = 'medicion';
        this.tiempoFase = 0;
        this.muestras = [];
      }
      this.actualizarTextoPaso();
      return;
    }

    const tarea = this.tareas[this.indiceTarea];
    const estado = contextoJuego.gestor?.camara?.controles?.[tarea.mano];
    const valor = estado?.medidaCruda?.[tarea.canal];
    const muestraValida = Boolean(estado?.presente && Number.isFinite(valor));
    if (muestraValida) this.muestras.push(valor);
    if (this.tiempoFase < 2) {
      this.actualizarTextoPaso(!muestraValida);
      return;
    }

    if (this.muestras.length < 15) {
      this.repetirPaso(`Solo hubo ${this.muestras.length} muestras válidas; se necesitan 15.`);
      return;
    }
    const percentil = percentilLineal(this.muestras, tarea.lado === 'min' ? .1 : .9);
    const calibracion = contextoJuego.gestor.camara.calibracion;
    const canal = calibracion[tarea.mano] ||= {};
    const rangoAnterior = canal[tarea.canal] || {};
    const extremoOpuesto = tarea.lado === 'min' ? rangoAnterior.max : rangoAnterior.min;
    const rango = tarea.lado === 'min' ? extremoOpuesto - percentil : percentil - extremoOpuesto;
    if (Number.isFinite(extremoOpuesto) && Math.abs(rango) < .30) {
      this.repetirPaso(`Rango ${tarea.canal} menor que 0,30; mueve más la mano y repite.`);
      return;
    }
    canal[tarea.canal] = { ...rangoAnterior, [tarea.lado]: percentil };
    contextoJuego.gestor.camara.guardarCalibracion();
    this.indiceTarea += 1;
    this.iniciarPaso();
  }

  repetirPaso(mensaje) {
    const tarea = this.tareas[this.indiceTarea];
    const mano = tarea.mano === 'der' ? 'derecha' : 'izquierda';
    this.fase = 'espera';
    this.textoCalibracion.setText(`Mano ${mano} · ${mensaje}\nRepetimos el paso.`);
    this.time.delayedCall(900, () => {
      if (!this.sys.isActive()) return;
      this.iniciarPaso();
    });
  }
}

function percentilLineal(muestras, p) {
  const ordenadas = [...muestras].sort((a, b) => a - b);
  const posicion = (ordenadas.length - 1) * p;
  const inferior = Math.floor(posicion), superior = Math.ceil(posicion);
  const fraccion = posicion - inferior;
  return ordenadas[inferior] * (1 - fraccion) + ordenadas[superior] * fraccion;
}
