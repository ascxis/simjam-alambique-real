import { EscenaBase } from './EscenaBase.js';
import { contextoJuego } from './contexto.js';
import { leerPreferencia, guardarPreferencia } from './preferencias.js';
import { GestorEntrada } from '../entrada/gestorEntrada.js';
import { Actuador } from '../modelo/actuador.js';
import { Registro } from '../modelo/registro.js';
import { crearSistemaTanques, PARAMETROS_TANQUES, constanteTiempoTanque, gananciaTanque } from '../modelo/tanques.js';
import { cargarNiveles, evaluarNivel, obtenerPerturbacion, obtenerReferencia, obtenerTolerancia } from '../modelo/niveles.js';
import { dibujarTendencia } from '../hmi/tendencia.js';
import { dibujarBarraActuador } from '../hmi/actuadores.js';
import { crearPanelDepuracion } from '../hmi/panelDepuracion.js';
import { mostrarVistaCamaraDepuracion } from '../hmi/vistaCamara.js';
import { dibujarTanques } from '../hmi/tanques.js';
import { detenerSesionCamara } from '../vision/servicioCamara.js';
import { MAPA_CONTROL, leerSenal } from './mapaControl.js';

export class Simulacion extends EscenaBase {
  constructor() { super('Simulacion'); }
  create() {
    this.nivel = cargarNiveles().find((n) => n.id === Number(contextoJuego.nivelElegido)) || cargarNiveles()[0];
    this.gestor = contextoJuego.gestor = new GestorEntrada({ fuente: contextoJuego.fuenteElegida || undefined });
    this.gestor.elegir(contextoJuego.fuenteElegida || this.gestor.fuente);
    const h1 = this.nivel.estadoInicial[0];
    this.actuador1 = new Actuador({ velocidadMaxima: PARAMETROS_TANQUES.velocidadMaximaValvula, inicial: PARAMETROS_TANQUES.coeficienteDescarga1 * Math.sqrt(h1) / PARAMETROS_TANQUES.caudalEntradaMaximo });
    this.actuador2 = new Actuador({ velocidadMaxima: PARAMETROS_TANQUES.velocidadMaximaValvula, inicial: 1 });
    this.sistema = crearSistemaTanques(this.nivel);
    const encabezados = ['t', 'u_crudo', 'u', 'x1', 'x2', 'y', 'v2', 'q_d', 'h_sp'];
    this.registro = new Registro({ encabezados });
    this.muestras = []; this.muestrasVista = []; this.alarmas = []; this.tiempoJuego = 0; this.pausado = false; this.pausaPorManos = false; this.debug = false;
    this.crearFondo(`${this.nivel.nombre} · Operador de tanques`);
    this.add.text(36, 105, 'Tanques en cascada · A·dh/dt = caudales · válvulas con slew 0.25 s⁻¹', { fontSize: '16px', color: '#424c4f' });
    this.graf = null; this.grafValvulas = null; this.barras = []; this.render = this.add.graphics();
    this.refTexto = this.add.text(660, 132, '', { fontSize: '15px', color: '#252b2d' });
    this.alarmText = this.add.text(36, 615, '', { fontSize: '18px', color: '#252b2d', fontStyle: 'bold' });
    this.pausaTexto = this.add.text(640, 350, '', { fontSize: '28px', color: '#7c332c', backgroundColor: '#ffffffcc', padding: { x: 20, y: 12 } }).setOrigin(.5).setDepth(10);
    this.panelDepuracion = crearPanelDepuracion(this, { intercambiar: contextoJuego.camara?.intercambiar ?? (leerPreferencia('alambique.intercambiarEtiquetas', 'false') === 'true'), onIntercambiar: (value) => { guardarPreferencia('alambique.intercambiarEtiquetas', String(value)); if (contextoJuego.camara) contextoJuego.camara.intercambiar = value; } });
    this.panelDepuracion.setVisible(false);
    this.events.once('shutdown', () => { detenerSesionCamara(); this.panelDepuracion.destruir(); mostrarVistaCamaraDepuracion(false); this.graf?.destruir(); this.grafValvulas?.destruir(); });
    this.input.keyboard.on('keydown', (e) => { this.gestor.tecla(e.code, true); if (e.code === 'KeyD') this.debug = !this.debug; if (e.code === 'KeyP') this.toggleParametros(); });
    this.input.keyboard.on('keyup', (e) => this.gestor.tecla(e.code, false)); this.finKey = this.input.keyboard.addKey('F');
    this.gestor.eventos.addEventListener('pausa', () => { this.pausado = !this.pausado; this.pausaPorManos = false; });
    this.ayuda = this.add.text(36, 675, '', { fontSize: '13px', color: '#414b4e' }); this.estadoCamara = this.add.text(1080, 65, '', { fontSize: '13px', color: '#414b4e' });
    this.selectStart = null; this.selectWasLong = false; this.ultimaAlarma = {};
  }

  update(_, deltaMs) {
    const dt = Math.min(deltaMs / 1000, .1), c = this.gestor.actualizar(dt) ?? {}, camara = contextoJuego.camara;
    if (camara?.activo && this.gestor.fuente === 'camara') {
      const hayManos = Boolean(c?.der?.presente || c?.izq?.presente);
      if (hayManos) { this.noManosDesde = null; if (this.pausaPorManos) { this.pausado = false; this.pausaPorManos = false; } }
      else { this.noManosDesde ??= performance.now(); if (performance.now() - this.noManosDesde > 3000) { this.pausado = true; this.pausaPorManos = true; } }
    }
    if (!this.pausado) {
      const mando1 = leerSenal(c, MAPA_CONTROL.v1, null, this.actuador1.salida());
      const crudo = leerSenal(c, MAPA_CONTROL.v1, 'u_crudo', mando1);
      const mando2 = this.nivel.tanques === 2 ? leerSenal(c, MAPA_CONTROL.v2, null, this.actuador2.salida()) : 1;
      const v1 = this.actuador1.avanzar(mando1, dt), v2 = this.actuador2.avanzar(mando2, dt);
      const qd = obtenerPerturbacion(this.nivel, this.sistema.t), ref = obtenerReferencia(this.nivel, this.sistema.t);
      this.sistema.avanzar([v1, v2, qd], dt); this.tiempoJuego = this.sistema.t;
      const hs = [...this.sistema.x], y = this.nivel.tanques === 2 ? hs[1] : hs[0];
      const referenciaActual = obtenerReferencia(this.nivel, this.tiempoJuego), toleranciaActual = obtenerTolerancia(this.nivel, this.tiempoJuego);
      const muestra = { t: this.tiempoJuego, u_crudo: crudo, u: v1, x: hs, y, v2, q_d: qd, h_sp: referenciaActual, referencia: ref, tolerancia: toleranciaActual, banda_inf: referenciaActual - toleranciaActual, banda_sup: referenciaActual + toleranciaActual };
      this.muestras.push(muestra);
      this.registro.reloj += dt;
      if (this.registro.reloj + 1e-9 >= this.registro.periodo) { this.registro.reloj %= this.registro.periodo; this.registro.filas.push([muestra.t, muestra.u_crudo, muestra.u, hs[0], hs[1] ?? '', y, v2, qd, muestra.h_sp]); }
      if (this.tiempoJuego - (this.ultimoVista || 0) >= 1 / 30) { this.muestrasVista.push(muestra); this.ultimoVista = this.tiempoJuego; }
      this.registrarAlarmas(hs);
      const desborde = hs.some((h) => h >= PARAMETROS_TANQUES.alturaMaxima);
      if (desborde || this.tiempoJuego >= this.nivel.duracion) { this.terminar(desborde); return; }
    }
    this.pausaTexto.setText(this.pausado ? (this.pausaPorManos ? 'Muestra las manos' : 'PAUSA · Enter para reanudar') : '');
    dibujarTanques(this.render, this.sistema.x, this.nivel.tanques, { alarmas: this.ultimaAlarma });
    const hs = this.sistema.x, yActual = this.nivel.tanques === 2 ? hs[1] : hs[0], referencia = obtenerReferencia(this.nivel, this.tiempoJuego), banda = obtenerTolerancia(this.nivel, this.tiempoJuego);
    this.refTexto.setText(`h${this.nivel.tanques === 2 ? '2' : '1'} ${yActual.toFixed(2)} m · referencia ${referencia.toFixed(2)} ±${banda.toFixed(2)} m · qd ${obtenerPerturbacion(this.nivel, this.tiempoJuego).toFixed(3)} m³/s`);
    const alarmasActivas = hs.map((h, i) => h >= 2.8 ? `HH${i + 1}` : h >= 2.4 ? `H${i + 1}` : '').filter(Boolean);
    this.alarmText.setText(alarmasActivas.length ? `ALARMA ${alarmasActivas.join(' · ')}` : ''); this.alarmText.setColor(alarmasActivas.some((a) => a.startsWith('HH')) ? '#d52222' : '#c57a00');
    this.graf?.destruir(); this.grafValvulas?.destruir(); this.barras.forEach((b) => b.destruir()); this.barras = [];
    const seriesAltura = [{ clave: 'x', indice: 0, nombre: 'h1', color: 0x325f68 }, ...(this.nivel.tanques === 2 ? [{ clave: 'x', indice: 1, nombre: 'h2', color: 0x4b7a56 }] : [])];
    this.graf = dibujarTendencia(this, { x: 660, y: 164, ancho: 570, alto: 225, muestras: this.muestrasVista, min: 0, max: 3, unidad: 'm', titulo: 'Niveles y banda de tolerancia', clave: 'y', referencia, banda, series: seriesAltura, alarma: alarmasActivas.length > 0 });
    this.grafValvulas = dibujarTendencia(this, { x: 660, y: 405, ancho: 570, alto: 165, muestras: this.muestrasVista, min: 0, max: 1, unidad: 'apertura', titulo: 'Válvulas v1 / v2', series: [{ clave: 'u', nombre: 'v1', color: 0x425e67 }, ...(this.nivel.tanques === 2 ? [{ clave: 'v2', nombre: 'v2', color: 0x875a3e }] : [])] });
    this.barras.push(dibujarBarraActuador(this, 680, 584, 'Válvula entrada v1', this.actuador1.salida(), hs[0], 'm'));
    if (this.nivel.tanques === 2) this.barras.push(dibujarBarraActuador(this, 950, 584, 'Válvula salida v2', this.actuador2.salida(), hs[1], 'm'));
    const sinManos = camara?.activo && this.gestor.fuente === 'camara' && this.noManosDesde && performance.now() - this.noManosDesde > 3000;
    this.estadoCamara.setText(this.gestor.fuente === 'camara' ? (camara?.activo ? 'CÁMARA ACTIVA' : 'CÁMARA INACTIVA') : '');
    this.ayuda.setText(`${sinManos ? 'Muestra las manos · ' : ''}${this.pausado ? 'PAUSADO' : `Tiempo ${this.tiempoJuego.toFixed(1)} / ${this.nivel.duracion} s`} · ${this.gestor.fuente} · P linealización · D depuración · F terminar`);
    mostrarVistaCamaraDepuracion(this.debug); this.panelDepuracion.setVisible(this.debug);
    const selectPressed = this.gestor.selectPulsado();
    if (selectPressed) { this.selectStart ??= performance.now(); if (!this.selectWasLong && performance.now() - this.selectStart >= 700) { this.debug = !this.debug; this.selectWasLong = true; } }
    else { this.selectStart = null; this.selectWasLong = false; }
    if (this.debug) { const dep = this.gestor.camara.depuracion(); this.panelDepuracion.actualizar({ fps: camara?.fps, fpsCamara: camara?.fpsCamara, alfa: dep.alfa, Ts: dep.Ts, tau: dep.tau, controles: c, x: hs }); }
    if (Phaser.Input.Keyboard.JustDown(this.finKey)) this.terminar(false);
  }

  registrarAlarmas(hs) {
    hs.forEach((h, i) => {
      const estado = h >= 2.8 ? 'HH' : h >= 2.4 ? 'H' : null;
      if (estado && this.ultimaAlarma[i] !== estado) this.alarmas.push({ t: this.tiempoJuego, tanque: i + 1, tipo: estado, altura: h });
      this.ultimaAlarma[i] = estado;
    });
  }

  toggleParametros() {
    if (this.paramPanel) { this.paramPanel.forEach((e) => e.destroy()); this.paramPanel = null; return; }
    const h0 = this.nivel.tanques === 2 ? this.sistema.x[1] : this.sistema.x[0];
    const tau = constanteTiempoTanque(h0), K = gananciaTanque(h0);
    const bg = this.add.rectangle(640, 345, 500, 190, 0xe2e3e3, .97).setStrokeStyle(2, 0x64777d).setDepth(8);
    const texto = this.add.text(420, 278, `Linealización local del tanque ${this.nivel.tanques === 2 ? 2 : 1}\nA·dh/dt = qin − c√h\nh₀ = ${h0.toFixed(3)} m · τ = 2A√h₀/c = ${tau.toFixed(3)} s\nK = 2√h₀/c = ${K.toFixed(3)} · d(qsalida)/dh`, { fontSize: '17px', color: '#252b2d', lineSpacing: 8 }).setDepth(9);
    this.paramPanel = [bg, texto];
  }
  terminar(desborde) {
    if (this.terminado) return; this.terminado = true;
    const evaluacion = evaluarNivel(this.nivel, this.muestras, this.alarmas);
    const resultado = { ...evaluacion, superado: evaluacion.superado && !desborde };
    this.scene.start('Fin', { nivel: this.nivel, muestras: this.muestras, registro: this.registro, alarmas: this.alarmas, desborde, resultado, parametros: { ...this.sistema.p }, tauTeorico: constanteTiempoTanque(this.nivel.referencia), KTeorica: gananciaTanque(this.nivel.referencia) });
  }
}
