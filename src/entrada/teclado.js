import { crearManoControl, actualizarCrudos } from './controles.js';

const mano = () => crearManoControl();
export class EntradaTeclado {
  constructor({ emitir = () => {} } = {}) { this.emitir = emitir; this.controles = { der: mano(), izq: mano(), pausa: false }; this.teclas = new Set(); this.punos = false; this.ultimaPausa = false; }
  tecla(codigo, activa) { activa ? this.teclas.add(codigo) : this.teclas.delete(codigo); if (codigo === 'Space' && activa && !this.punos) this.emitir('puno', {}); if (codigo === 'Space' && !activa && this.punos) this.emitir('puno_fin', {}); if (codigo === 'Space') this.punos = activa; }
  actualizar(dt) {
    const tasa = .5 * Math.max(0, dt), held = (...ks) => ks.some((k) => this.teclas.has(k));
    const ajustar = (obj, campo, mas, menos) => obj[campo] = Math.max(campo === 'x' || campo === 'giro' ? -1 : 0, Math.min(1, obj[campo] + (held(mas) ? tasa : 0) - (held(menos) ? tasa : 0)));
    ajustar(this.controles.izq, 'altura', 'KeyW', 'KeyS'); ajustar(this.controles.der, 'altura', 'ArrowUp', 'ArrowDown'); ajustar(this.controles.der, 'x', 'ArrowRight', 'ArrowLeft'); this.controles.der.giro = this.controles.der.x;
    ajustar(this.controles.izq, 'pellizco', 'KeyE', 'KeyQ'); ajustar(this.controles.der, 'pellizco', 'KeyC', 'KeyZ');
    if (this.teclas.has('Enter') && !this.ultimaPausa) { this.emitir('pausa', {}); this.ultimaPausa = true; } if (!this.teclas.has('Enter')) this.ultimaPausa = false;
    for (let i = 1; i <= 5; i++) if (this.teclas.has(`Digit${i}`)) { const m = this.controles.der; if (m.dedos !== i) { m.dedos = i; this.emitir('dedos', { mano: 'der', valor: i }); } }
    actualizarCrudos(this.controles.der); actualizarCrudos(this.controles.izq);
    return this.controles;
  }
}
