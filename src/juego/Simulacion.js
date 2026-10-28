import { EscenaBase } from './EscenaBase.js';
import { contextoJuego } from './contexto.js';
import { leerPreferencia, guardarPreferencia } from './preferencias.js';
import { GestorEntrada } from '../entrada/gestorEntrada.js';
import { SistemaContinuo } from '../modelo/sistema.js';
import { Actuador } from '../modelo/actuador.js';
import { Registro } from '../modelo/registro.js';
import { dibujarTendencia } from '../hmi/tendencia.js';
import { dibujarBarraActuador } from '../hmi/actuadores.js';
import { crearPanelDepuracion } from '../hmi/panelDepuracion.js';
import { mostrarVistaCamaraDepuracion } from '../hmi/vistaCamara.js';
import { detenerSesionCamara } from '../vision/servicioCamara.js';
import { MAPA_CONTROL, leerSenal } from './mapaControl.js';

const NEUTRO = 0x64777d;

export class Simulacion extends EscenaBase {
  constructor() { super('Simulacion'); }
  create() {
    this.crearFondo('Operación · planta de prueba'); this.add.text(1030, 32, 'HMI · 30 s', { fontSize: '15px', color: '#515b5e' });
    this.gestor = contextoJuego.gestor = new GestorEntrada({ fuente: contextoJuego.fuenteElegida || undefined });
    this.gestor.elegir(contextoJuego.fuenteElegida || this.gestor.fuente);
    this.actuador = new Actuador({ velocidadMaxima: Infinity });
    this.sistema = new SistemaContinuo({ f: ([x], [u], t, p) => [(p.K * u - x) / p.tau], g: (x) => x, p: { K: 1, tau: 5 }, x0: [0] });
    this.registro = new Registro({ encabezados: ['t', 'u_crudo', 'u', ...this.sistema.x.map((_, i) => `x${i + 1}`), 'y'] });
    this.muestras = []; this.muestrasVista = []; this.tiempoJuego = 0; this.pausado = false; this.debug = false; this.panel = null;
    this.tank = this.add.graphics(); this.add.text(92, 135, 'Tanque', { fontSize: '18px', color: '#252b2d' }); this.add.text(690, 132, 'Tendencia de proceso', { fontSize: '17px', color: '#252b2d' });
    this.panelDepuracion = crearPanelDepuracion(this, {
      intercambiar: contextoJuego.camara?.intercambiar ?? (leerPreferencia('alambique.intercambiarEtiquetas', 'false') === 'true'),
      onIntercambiar: (value) => { guardarPreferencia('alambique.intercambiarEtiquetas', String(value)); if (contextoJuego.camara) contextoJuego.camara.intercambiar = value; }
    });
    this.events.on('shutdown', () => { detenerSesionCamara(); this.panelDepuracion.destruir(); mostrarVistaCamaraDepuracion(false); });
    this.input.keyboard.on('keydown', (e) => { this.gestor.tecla(e.code, true); if (e.code === 'KeyP') this.toggleParametros(); if (e.code === 'KeyD') this.debug = !this.debug; });
    this.input.keyboard.on('keyup', (e) => this.gestor.tecla(e.code, false)); this.finKey = this.input.keyboard.addKey('F');
    this.gestor.eventos.addEventListener('pausa', () => { this.pausado = !this.pausado; this.pausaPorManos = false; });
    this.ayuda = this.add.text(36, 675, '', { fontSize: '14px', color: '#414b4e' }); this.estadoCamara = this.add.text(1000, 68, '', { fontSize: '14px', color: '#414b4e' });
    this.cartas = []; this.selectStart = null; this.selectWasLong = false;
  }

  toggleParametros() {
    if (this.panel) { this.panel.destruir(); this.panel = null; return; }
    this.panel = { destruir: () => this.panelElems.forEach((e) => e.destroy()) };
    const bg = this.add.rectangle(640, 360, 520, 300, 0xe1e3e3).setStrokeStyle(2, NEUTRO);
    const title = this.add.text(430, 230, 'Parámetros (P cierra) · clic para aumentar', { fontSize: '18px', color: '#252b2d' });
    const k = this.add.text(430, 290, `K: ${this.sistema.p.K}   [+]`, { fontSize: '20px', color: '#252b2d' }).setInteractive();
    const tau = this.add.text(430, 340, `τ: ${this.sistema.p.tau} s   [+]`, { fontSize: '20px', color: '#252b2d' }).setInteractive();
    k.on('pointerdown', () => { this.sistema.p.K += .1; k.setText(`K: ${this.sistema.p.K.toFixed(1)}   [+]`); });
    tau.on('pointerdown', () => { this.sistema.p.tau += .5; tau.setText(`τ: ${this.sistema.p.tau.toFixed(1)} s   [+]`); });
    this.panelElems = [bg, title, k, tau]; this.panel.destruir = () => this.panelElems.forEach((e) => e.destroy());
  }

  update(_, deltaMs) {
    const dt = Math.min(deltaMs / 1000, .1), c = this.gestor.actualizar(dt) ?? {}, camara = contextoJuego.camara;
    if (camara?.activo && this.gestor.fuente === 'camara') {
      const hayManos = Boolean(c?.der?.presente || c?.izq?.presente);
      if (hayManos) { this.noManosDesde = null; if (this.pausaPorManos) { this.pausado = false; this.pausaPorManos = false; } }
      else { this.noManosDesde ??= performance.now(); if (performance.now() - this.noManosDesde > 3000) { this.pausado = true; this.pausaPorManos = true; } }
    }
    if (!this.pausado && !this.panel) {
      const altura = leerSenal(c, MAPA_CONTROL.actuadorU, null, .5), uCrudo = leerSenal(c, MAPA_CONTROL.actuadorU, 'u_crudo', altura);
      const u = this.actuador.avanzar(altura, dt), y = this.sistema.avanzar([u], dt)[0]; this.tiempoJuego = this.sistema.t;
      const muestra = { t: this.tiempoJuego, u_crudo: uCrudo, u, x: [...this.sistema.x], y };
      this.muestras.push(muestra); this.registro.agregar(dt, muestra);
      if (this.tiempoJuego - (this.ultimoVista || 0) >= 1 / 30) { this.muestrasVista.push(muestra); this.ultimoVista = this.tiempoJuego; }
    }
    this.tank.clear(); this.tank.fillStyle(0xcbd0d1).fillRoundedRect(130, 190, 190, 390, 18);
    this.tank.fillStyle(0x71858b).fillRoundedRect(143, 203 + (1 - Math.max(0, Math.min(1, this.sistema.x[0]))) * 360, 164, Math.max(0, Math.min(1, this.sistema.x[0])) * 360, 8);
    this.tank.lineStyle(3, NEUTRO).strokeRoundedRect(130, 190, 190, 390, 18);
    this.children.list.filter((o) => o.getData?.('dynamic')).forEach((o) => o.destroy());
    const val = this.add.text(135, 595, `y = ${this.sistema.x[0].toFixed(3)} u`, { fontSize: '17px', color: '#252b2d' }); val.setData('dynamic', true);
    this.cartas.forEach((carta) => carta.destruir());
    this.cartas = [dibujarTendencia(this, { x: 690, y: 170, ancho: 525, alto: 330, muestras: this.muestrasVista, min: 0, max: 1, unidad: 'u', titulo: 'y(t) · nivel normalizado' }), dibujarBarraActuador(this, 690, 545, 'Apertura actuador', this.actuador.salida(), this.sistema.x[0])];
    const sinManos = camara?.activo && this.gestor.fuente === 'camara' && this.noManosDesde && performance.now() - this.noManosDesde > 3000;
    this.estadoCamara.setText(this.gestor.fuente === 'camara' ? (camara?.activo ? 'CÁMARA ACTIVA' : 'CÁMARA INACTIVA') : '');
    const label = this.add.text(36, 640, `${sinManos ? 'Muestra las manos · ' : ''}${this.pausado ? 'PAUSADO · Enter para reanudar' : `Tiempo ${this.tiempoJuego.toFixed(1)} s`}    Control: ${this.gestor.fuente}    P parámetros · D depuración · F fin`, { fontSize: '15px', color: this.pausado ? '#7c5144' : '#424c4f' }); label.setData('dynamic', true);
    mostrarVistaCamaraDepuracion(this.debug); this.panelDepuracion.setVisible(this.debug);
    const alertaFPS = camara?.activo && camara.fps < 15 ? ' · Detección lenta: mejora la luz, cierra pestañas o baja resolución' : '';
    if (this.debug) {
      const depuracion = this.gestor.camara.depuracion();
      this.panelDepuracion.actualizar({ fps: camara?.fps, fpsCamara: camara?.fpsCamara, alertaFPS, alfa: depuracion.alfa, Ts: depuracion.Ts, tau: depuracion.tau, controles: c, x: this.sistema.x });
    }
    if (this.debug && camara?.activo && camara.fps < 15) this.ayuda.setText(`Aviso: detección ${camara.fps.toFixed(1)} FPS (menos de 15). Mejora la iluminación, cierra pestañas o baja la resolución.`);
    else this.ayuda.setText(this.debug ? `Depuración activa · FPS ${camara?.fps?.toFixed(1) ?? '—'} · x(t)=[${this.sistema.x.map((v) => v.toFixed(2)).join(', ')}]` : `Sistema continuo: τ dy/dt + y = K u · use F para terminar.${alertaFPS}`);
    const selectPressed = this.gestor.selectPulsado();
    if (selectPressed) { this.selectStart ??= performance.now(); if (!this.selectWasLong && performance.now() - this.selectStart >= 700) { this.debug = !this.debug; this.selectWasLong = true; } }
    else { this.selectStart = null; this.selectWasLong = false; }
    if (Phaser.Input.Keyboard.JustDown(this.finKey)) this.scene.start('Fin', { muestras: this.muestras, registro: this.registro, p: this.sistema.p });
  }
}
