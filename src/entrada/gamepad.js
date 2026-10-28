export class EntradaGamepad {
  constructor({ emitir = () => {} } = {}) { this.emitir = emitir; this.controles = { der: { altura: .5, x: 0, giro: 0, pellizco: 0 }, izq: { altura: .5, x: 0, giro: 0, pellizco: 0 }, pausa: false }; this.botones = {}; }
  actualizar() {
    const gp = navigator.getGamepads?.().find(Boolean); if (!gp) return this.controles;
    const axis = (v) => Math.abs(v) < .12 ? 0 : v;
    this.controles.izq.altura = (1 - axis(gp.axes[1] || 0)) / 2; this.controles.der.altura = (1 - axis(gp.axes[3] || 0)) / 2;
    this.controles.der.x = axis(gp.axes[2] || 0); this.controles.der.giro = this.controles.der.x;
    this.controles.izq.pellizco = gp.buttons[6]?.value || 0; this.controles.der.pellizco = gp.buttons[7]?.value || 0;
    const emit = (n, on) => { if (on && !this.botones[n]) this.emitir(n, {}); this.botones[n] = on; };
    emit('puno', !!gp.buttons[0]?.pressed); emit('pausa', !!gp.buttons[9]?.pressed);
    const d = gp.buttons.slice(12, 16).reduce((n, b) => n + Number(!!b?.pressed), 0); if (d !== this.controles.der.dedos) { this.controles.der.dedos = d; this.emitir('dedos', { mano: 'der', valor: d }); }
    return this.controles;
  }
}
