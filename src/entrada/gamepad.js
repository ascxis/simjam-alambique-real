import { crearManoControl, actualizarCrudos } from './controles.js';
import { cargarConfig, valorControlGamepad, elegirGamepad } from './configControles.js';

// Gamepad: los sticks y gatillos mueven las válvulas poco a poco (como una perilla),
// no fijan su posición, así soltar el stick mantiene la apertura. Los botones se pueden reasignar
// desde el menú (Configurar controles).
const TASA = 0.5; // 1/s a stick completo
export class EntradaGamepad {
  constructor({ emitir = () => {}, config = cargarConfig().gamepad } = {}) {
    this.emitir = emitir; this.config = config; this.botones = {};
    this.controles = { der: crearManoControl(), izq: crearManoControl(), pausa: false };
  }
  actualizar(dt = 0) {
    const gp = elegirGamepad(); if (!gp) return this.controles;
    const c = this.config, paso = TASA * Math.max(0, Math.min(dt, 0.1));
    const val = (id) => valorControlGamepad(c[id], gp);
    const mover = (mano, campo, mas, menos) => {
      const delta = (val(mas) - val(menos)) * paso;
      if (delta) mano[campo] = Math.max(0, Math.min(1, mano[campo] + delta));
    };
    mover(this.controles.der, 'altura', 'subirV1', 'bajarV1');
    mover(this.controles.izq, 'pellizco', 'abrirV2', 'cerrarV2');
    const axis = (v) => Math.abs(v) < .12 ? 0 : v;
    this.controles.der.x = axis(gp.axes?.[2] || 0); this.controles.der.giro = this.controles.der.x;
    const emit = (n, on) => { if (on && !this.botones[n]) this.emitir(n, {}); this.botones[n] = on; };
    emit('puno', !!gp.buttons?.[0]?.pressed);
    emit('pausa', valorControlGamepad(c.pausa, gp) > 0.5);
    emit('terminar', valorControlGamepad(c.terminar, gp) > 0.5);
    const d = (gp.buttons || []).slice(12, 16).reduce((n, b) => n + Number(!!b?.pressed), 0);
    if (d !== this.controles.der.dedos) { this.controles.der.dedos = d; this.emitir('dedos', { mano: 'der', valor: d }); }
    actualizarCrudos(this.controles.der); actualizarCrudos(this.controles.izq);
    return this.controles;
  }
  selectPulsado() { return Boolean(elegirGamepad()?.buttons?.[8]?.pressed); }
}
