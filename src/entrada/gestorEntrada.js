import { EntradaGestos } from './gestos.js';
import { EntradaGamepad } from './gamepad.js';
import { EntradaTeclado } from './teclado.js';
export class GestorEntrada {
  constructor({ fuente = new URLSearchParams(location.search).get('control') || 'camara', emitir = () => {} } = {}) { this.fuente = fuente; this.eventos = new EventTarget(); this.emitir = (tipo, detalle) => { emitir(tipo, detalle); this.eventos.dispatchEvent(new CustomEvent(tipo, { detail: detalle })); }; this.camara = new EntradaGestos({ emitir: this.emitir }); this.gamepad = new EntradaGamepad({ emitir: this.emitir }); this.teclado = new EntradaTeclado({ emitir: this.emitir }); this.escalon = { der: { altura: 0, x: 0, pellizco: 0, giro: 0 }, izq: { altura: .5, pellizco: 0 }, pausa: false }; this.t = 0; }
  elegir(fuente) { if (!['camara', 'gamepad', 'teclado', 'escalon'].includes(fuente)) throw new Error('Fuente de control desconocida'); this.fuente = fuente; }
  procesarManos(frame) { return this.camara.procesar(frame); }
  actualizar(dt) { if (this.fuente === 'gamepad') return this.gamepad.actualizar(); if (this.fuente === 'teclado') return this.teclado.actualizar(dt); if (this.fuente === 'escalon') { this.t += dt; this.escalon.der.altura = this.t >= 2 ? 1 : 0; return this.escalon; } return this.camara.controles; }
  tecla(codigo, down) { this.teclado.tecla(codigo, down); }
}
