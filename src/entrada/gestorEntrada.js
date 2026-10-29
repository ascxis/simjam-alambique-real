import { EntradaGestos } from './gestos.js';
import { EntradaGamepad } from './gamepad.js';
import { EntradaTeclado } from './teclado.js';

const CAMPOS_CONTINUOS = ['altura', 'x', 'pellizco', 'giro'];
function completarMano(mano) {
  mano ||= {};
  for (const campo of CAMPOS_CONTINUOS) mano[campo] = Number.isFinite(mano[campo]) ? mano[campo] : (campo === 'altura' ? 0.5 : 0);
  mano.puno = Boolean(mano.puno); mano.dedos = Number.isFinite(mano.dedos) ? mano.dedos : 0; mano.presente = Boolean(mano.presente);
  mano.u_crudo = mano.u_crudo && typeof mano.u_crudo === 'object' ? mano.u_crudo : {};
  mano.medidaCruda = mano.medidaCruda && typeof mano.medidaCruda === 'object' ? mano.medidaCruda : {};
  for (const campo of CAMPOS_CONTINUOS) {
    if (!Number.isFinite(mano.u_crudo[campo])) mano.u_crudo[campo] = mano[campo];
    if (!Number.isFinite(mano.medidaCruda[campo])) mano.medidaCruda[campo] = mano.u_crudo[campo];
  }
  return mano;
}
function completarControles(controles) {
  controles ||= {};
  controles.der = completarMano(controles.der); controles.izq = completarMano(controles.izq);
  controles.pausa = Boolean(controles.pausa);
  return controles;
}
function actualizarCrudosDesdeSalidas(controles) {
  for (const mano of [controles.der, controles.izq]) for (const campo of CAMPOS_CONTINUOS) {
    mano.u_crudo[campo] = mano[campo]; mano.medidaCruda[campo] = mano[campo];
  }
  return controles;
}

export class GestorEntrada {
  constructor({ fuente = new URLSearchParams(globalThis.location?.search || '').get('control') || 'camara', emitir = () => {} } = {}) { this.fuente = fuente; this.eventos = new EventTarget(); this.emitir = (tipo, detalle) => { emitir(tipo, detalle); this.eventos.dispatchEvent(new CustomEvent(tipo, { detail: detalle })); }; this.camara = new EntradaGestos({ emitir: this.emitir }); this.gamepad = new EntradaGamepad({ emitir: this.emitir }); this.teclado = new EntradaTeclado({ emitir: this.emitir }); this.escalon = completarControles({ der: { altura: 0, x: 0, pellizco: 0, giro: 0 }, izq: { altura: .5, pellizco: 0, giro: 0, x: 0 } }); this.t = 0; }
  elegir(fuente) { if (!['camara', 'gamepad', 'teclado', 'escalon'].includes(fuente)) throw new Error('Fuente de control desconocida'); this.fuente = fuente; }
  procesarManos(frame) { return completarControles(this.camara.procesar(frame)); }
  actualizar(dt) {
    let controles;
    if (this.fuente === 'gamepad') controles = this.gamepad.actualizar();
    else if (this.fuente === 'teclado') controles = this.teclado.actualizar(dt);
    else if (this.fuente === 'escalon') { this.t += dt; this.escalon.der.altura = this.t >= 2 ? 0.622372 : 0.612372; controles = this.escalon; }
    else controles = this.camara.controles;
    controles = completarControles(controles);
    return this.fuente === 'camara' ? controles : actualizarCrudosDesdeSalidas(controles);
  }
  selectPulsado() { return this.gamepad.selectPulsado(); }
  tecla(codigo, down) { this.teclado.tecla(codigo, down); }
}
