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
import { dibujarTanques, posicionEscalaTanque, posicionAyudaCascada, posicionSpriteTanque, posicionSpritesValvulas } from '../hmi/tanques.js';
import { MAPA_CONTROL, leerSenal, leerSenalSiPresente } from './mapaControl.js';

export class Simulacion extends EscenaBase {
  constructor() { super('Simulacion'); }
  create() {
    this.terminado = false;
    this.ultimoVista = 0;
    this.tiempoAnteriorRegistro = 0;
    this.noManosDesde = null;
    this.paramPanel = null;
    this.graf = null;
    this.grafValvulas = null;
    this.barras = [];
    this.tiempoEnBandaSeguido = 0;
    this.tiempoEnBandaAcumulado = 0;
    this.ultimoTiempoMuestra = 0;
    this.ultimoHmi = -Infinity;
    this.ultimoDebug = -Infinity;
    this.selectStart = null;
    this.selectWasLong = false;
    this.ultimaAlarma = {};
    this.tiempoJuego = 0;
    this.nivel = cargarNiveles().find((n) => n.id === Number(contextoJuego.nivelElegido)) || cargarNiveles()[0];
    this.gestor = contextoJuego.gestor = new GestorEntrada({ fuente: contextoJuego.fuenteElegida || undefined });
    this.gestor.elegir(contextoJuego.fuenteElegida || this.gestor.fuente);
    const h1 = this.nivel.estadoInicial[0];
    this.actuador1 = new Actuador({ velocidadMaxima: PARAMETROS_TANQUES.velocidadMaximaValvula, inicial: PARAMETROS_TANQUES.coeficienteDescarga1 * Math.sqrt(h1) / PARAMETROS_TANQUES.caudalEntradaMaximo });
    this.actuador2 = new Actuador({ velocidadMaxima: PARAMETROS_TANQUES.velocidadMaximaValvula, inicial: 1 });
    this.sistema = crearSistemaTanques(this.nivel);
    const encabezados = ['t', 'u_crudo', 'u', 'x1', 'x2', 'y', 'v2', 'q_d', 'h_sp'];
    this.registro = new Registro({ encabezados });
    this.muestras = []; this.muestrasVista = []; this.alarmas = []; this.pausado = false; this.pausaPorManos = false; this.debug = false;
    this.ultimoUpdateReal = performance.now();
    this.ultimoTiempoMuestra = 0;
    this.crearFondo(`${this.nivel.nombre} · Operador de tanques`);
    this.add.text(36, 105, 'Tanques en cascada · A·dh/dt = caudales · válvulas con slew 0.25 s⁻¹', { fontSize: '16px', color: '#424c4f' });
    this.render = this.add.graphics().setDepth(-1);
    this.conSprites = this.textures.exists('alambique');
    this.spritesTanques = [];
    this.spritesValvulas = [];
    for (let i = 0; i < this.nivel.tanques; i++) {
      if (this.conSprites) {
        const p = posicionSpriteTanque(i, this.nivel.tanques);
        this.spritesTanques.push(this.add.image(p.x, p.y, 'alambique').setDisplaySize(p.ancho, p.alto).setDepth(-.5));
      }
    }
    this.conSpritesValvula = this.textures.exists('valvula-cuerpo') && this.textures.exists('valvula-volante');
    if (this.conSpritesValvula) {
      const puntos = posicionSpritesValvulas(this.nivel.tanques);
      for (const [clave, punto] of [['v1', puntos.v1], ['v2', puntos.v2]]) {
        if (!punto || (clave === 'v2' && this.nivel.tanques !== 2)) continue;
        const cuerpo = this.add.image(punto.x, punto.y, 'valvula-cuerpo').setDisplaySize(46, 46);
        const volante = this.add.sprite(punto.x, punto.y, 'valvula-volante').setDisplaySize(25, 25).play('valvula-en-servicio');
        this.spritesValvulas.push({ clave, cuerpo, volante });
      }
    }
    this.renderOverlay = this.add.graphics().setDepth(2);
    this.placaAlarma = this.textures.exists('alarma-placa') ? this.add.image(615, 125, 'alarma-placa').setDisplaySize(35, 35).setDepth(3) : null;
    this.runaAlarma = this.textures.exists('alarma-runa') ? this.add.sprite(615, 125, 'alarma-runa').setDisplaySize(25, 25).setDepth(4).play('runa-alerta') : null;
    this.etiquetasEscala = [];
    for (let tanque = 0; tanque < this.nivel.tanques; tanque++) {
      for (let metro = 0; metro <= 3; metro++) {
        const p = posicionEscalaTanque(tanque, metro, this.nivel.tanques);
        this.etiquetasEscala.push(this.add.text(p.x, p.y, String(metro), { fontSize: '12px', color: '#4c5a5e' }).setOrigin(1, 0));
      }
      const p = posicionEscalaTanque(tanque, 3, this.nivel.tanques);
      this.etiquetasEscala.push(this.add.text(p.x - 2, p.y - 18, 'm', { fontSize: '10px', color: '#4c5a5e' }).setOrigin(1, 0));
    }
    this.refTexto = this.add.text(660, 132, '', { fontSize: '15px', color: '#252b2d' });
    if (this.nivel.tanques === 2) {
      const ayuda = posicionAyudaCascada();
      this.ayudaCascada = this.add.text(ayuda.x, ayuda.y, 'Mano derecha: válvula de entrada v1\nPellizco izquierdo abierto = v2 abierta (sale líquido del alambique 2)', { fontSize: '12px', color: '#414b4e', lineSpacing: 2 });
      this.add.text(247, 376, 'q₁₂ = c₁√h₁', { fontSize: '11px', color: '#414b4e' });
    }
    this.alarmText = this.add.text(36, this.nivel.tanques === 2 ? 635 : 615, '', { fontSize: '18px', color: '#252b2d', fontStyle: 'bold' });
    this.criterioTexto = this.add.text(660, 615, '', { fontSize: '15px', color: '#252b2d', fontStyle: 'bold' });
    this.pausaTexto = this.add.text(640, 350, '', { fontSize: '28px', color: '#7c332c', backgroundColor: '#ffffffcc', padding: { x: 20, y: 12 } }).setOrigin(.5).setDepth(10);
    this.panelDepuracion = crearPanelDepuracion(this, { intercambiar: contextoJuego.camara?.intercambiar ?? (leerPreferencia('alambique.intercambiarEtiquetas', 'false') === 'true'), onIntercambiar: (value) => { guardarPreferencia('alambique.intercambiarEtiquetas', String(value)); if (contextoJuego.camara) contextoJuego.camara.intercambiar = value; } });
    this.panelDepuracion.setVisible(false);
    document.activeElement?.blur?.();
    if (this.game.canvas) { this.game.canvas.setAttribute('tabindex', '0'); this.game.canvas.focus({ preventScroll: true }); }
    this.documentKeyDown = (e) => {
      if (!this.sys.isActive()) return;
      if (['KeyF', 'KeyP', 'KeyD', 'Enter'].includes(e.code)) e.preventDefault();
      if (e.code === 'KeyF' || e.key?.toLowerCase() === 'f') {
        console.info('[DIAG] tecla F', { terminado: this.terminado, sysIsActive: this.sys.isActive(), tiempoJuego: this.tiempoJuego });
        this.terminar(false); return;
      }
      if (e.code === 'Enter') {
        if (!e.repeat) { this.pausado = !this.pausado; this.pausaPorManos = false; }
        return;
      }
      this.gestor.tecla(e.code, true);
      if (!e.repeat && e.code === 'KeyD') this.debug = !this.debug;
      if (!e.repeat && e.code === 'KeyP') this.toggleParametros();
    };
    this.documentKeyUp = (e) => { if (this.sys.isActive() && e.code !== 'Enter') this.gestor.tecla(e.code, false); };
    document.addEventListener('keydown', this.documentKeyDown, true);
    document.addEventListener('keyup', this.documentKeyUp, true);
    this.events.once('shutdown', () => {
      console.info('[DIAG] Simulacion shutdown');
      const limpiar = (accion) => { try { accion(); } catch (error) { console.error('[ERROR JUEGO] limpieza Simulacion', error); } };
      limpiar(() => document.removeEventListener('keydown', this.documentKeyDown, true));
      limpiar(() => document.removeEventListener('keyup', this.documentKeyUp, true));
      limpiar(() => this.panelDepuracion.destruir());
      limpiar(() => mostrarVistaCamaraDepuracion(false));
      limpiar(() => this.graf?.destruir());
      limpiar(() => this.grafValvulas?.destruir());
      this.barras.forEach((barra) => limpiar(() => barra.destruir()));
      this.paramPanel?.forEach((elemento) => limpiar(() => elemento.destroy()));
      limpiar(() => this.render.destroy());
      limpiar(() => this.renderOverlay.destroy());
      this.etiquetasEscala.forEach((texto) => limpiar(() => texto.destroy()));
    });
    this.gestor.eventos.addEventListener('pausa', () => { this.pausado = !this.pausado; this.pausaPorManos = false; });
    this.ayuda = this.add.text(36, 675, '', { fontSize: '13px', color: '#414b4e' }); this.estadoCamara = this.add.text(1080, 65, '', { fontSize: '13px', color: '#414b4e' });
    this.botonTerminar = this.boton(1090, 660, 'Terminar', () => {
      console.info('[DIAG] botón Terminar', { terminado: this.terminado, sysIsActive: this.sys.isActive(), tiempoJuego: this.tiempoJuego });
      this.terminar(false);
    }).setDepth(20);
    const controlesIniciales = this.gestor.actualizar(0) ?? {};
    const x0 = [...this.sistema.x], y0 = this.nivel.tanques === 2 ? x0[1] : x0[0];
    const v10 = this.actuador1.salida(), v20 = this.actuador2.salida();
    const ref0 = obtenerReferencia(this.nivel, 0), banda0 = obtenerTolerancia(this.nivel, 0), qd0 = obtenerPerturbacion(this.nivel, 0);
    const muestraInicial = { t: 0, u_crudo: leerSenal(controlesIniciales, MAPA_CONTROL.v1, 'u_crudo', v10), u: v10, x: x0, y: y0, v2: v20, q_d: qd0, h_sp: ref0, referencia: ref0, tolerancia: banda0, banda_inf: ref0 - banda0, banda_sup: ref0 + banda0 };
    this.muestras.push(muestraInicial);
    this.muestrasVista.push(muestraInicial);
    this.registro.filas.push([0, muestraInicial.u_crudo, v10, x0[0], x0[1] ?? '', y0, v20, qd0, ref0]);
  }

  update(time, deltaMs) {
    try {
      this.actualizarCuadro(time, deltaMs);
    } catch (error) {
      console.error('[ERROR JUEGO] update', error);
    }
  }

  actualizarCuadro(_, deltaMs) {
    const ahoraReal = performance.now();
    const dt = Math.max(0, (ahoraReal - this.ultimoUpdateReal) / 1000);
    this.ultimoUpdateReal = ahoraReal;
    const c = this.gestor.actualizar(dt) ?? {}, camara = contextoJuego.camara;
    if (camara?.activo && this.gestor.fuente === 'camara') {
      const hayManos = Boolean(c?.der?.presente || c?.izq?.presente);
      if (hayManos) { this.noManosDesde = null; if (this.pausaPorManos) { this.pausado = false; this.pausaPorManos = false; } }
      else { this.noManosDesde ??= performance.now(); if (performance.now() - this.noManosDesde > 3000) { this.pausado = true; this.pausaPorManos = true; } }
    }
    if (!this.pausado) {
      const conservaAusente = this.gestor.fuente === 'camara';
      const mando1 = leerSenalSiPresente(c, MAPA_CONTROL.v1, null, this.actuador1.salida(), conservaAusente);
      const crudo = leerSenalSiPresente(c, MAPA_CONTROL.v1, 'u_crudo', mando1, conservaAusente);
      const mando2 = this.nivel.tanques === 2
        ? leerSenalSiPresente(c, MAPA_CONTROL.v2, null, this.actuador2.salida(), conservaAusente)
        : 1;
      let restante = dt, v1 = this.actuador1.salida(), v2 = this.actuador2.salida();
      while (restante > 1e-9) {
        const paso = Math.min(restante, .1);
        v1 = this.actuador1.avanzar(mando1, paso); v2 = this.actuador2.avanzar(mando2, paso);
        const qdPaso = obtenerPerturbacion(this.nivel, this.sistema.t);
        this.sistema.avanzar([v1, v2, qdPaso], paso);
        restante -= paso;
      }
      this.tiempoJuego = this.sistema.t;
      const qd = obtenerPerturbacion(this.nivel, this.tiempoJuego), ref = obtenerReferencia(this.nivel, this.tiempoJuego);
      const hs = [...this.sistema.x], y = this.nivel.tanques === 2 ? hs[1] : hs[0];
      const referenciaActual = obtenerReferencia(this.nivel, this.tiempoJuego), toleranciaActual = obtenerTolerancia(this.nivel, this.tiempoJuego);
      const dtMuestra = this.ultimoTiempoMuestra === null ? 0 : Math.max(0, this.tiempoJuego - this.ultimoTiempoMuestra);
      this.ultimoTiempoMuestra = this.tiempoJuego;
      const muestra = { t: this.tiempoJuego, u_crudo: crudo, u: v1, x: hs, y, v2, q_d: qd, h_sp: referenciaActual, referencia: ref, tolerancia: toleranciaActual, banda_inf: referenciaActual - toleranciaActual, banda_sup: referenciaActual + toleranciaActual };
      this.muestras.push(muestra);
      const dentro = Math.abs(y - referenciaActual) <= toleranciaActual;
      this.tiempoEnBandaAcumulado += dentro ? dtMuestra : 0;
      this.tiempoEnBandaSeguido = dentro ? this.tiempoEnBandaSeguido + dtMuestra : 0;
      this.registro.reloj += Math.max(0, this.tiempoJuego - (this.tiempoAnteriorRegistro ?? 0));
      this.tiempoAnteriorRegistro = this.tiempoJuego;
      if (this.registro.reloj + 1e-9 >= this.registro.periodo) { this.registro.reloj %= this.registro.periodo; this.registro.filas.push([muestra.t, muestra.u_crudo, muestra.u, hs[0], hs[1] ?? '', y, v2, qd, muestra.h_sp]); }
      if (this.tiempoJuego - (this.ultimoVista || 0) >= 1 / 30) { this.muestrasVista.push(muestra); this.ultimoVista = this.tiempoJuego; }
      this.registrarAlarmas(hs);
      const desborde = hs.some((h) => h >= PARAMETROS_TANQUES.alturaMaxima);
      if (desborde) { this.terminar(true); return; }
      if (this.tiempoJuego >= this.nivel.duracion) { this.terminar(false); return; }
      if (this.nivel.criterio.tipo === 'consecutivo' && this.tiempoEnBandaSeguido >= this.nivel.criterio.segundos) { this.terminar(false); return; }
    }
    mostrarVistaCamaraDepuracion(this.debug); this.panelDepuracion.setVisible(this.debug);
    const selectPressed = this.gestor.selectPulsado();
    if (selectPressed) { this.selectStart ??= performance.now(); if (!this.selectWasLong && performance.now() - this.selectStart >= 700) { this.debug = !this.debug; this.selectWasLong = true; } }
    else { this.selectStart = null; this.selectWasLong = false; }
    const ahoraHmi = performance.now();
    if (ahoraHmi - this.ultimoHmi >= 100) { this.actualizarHmi(camara, ahoraHmi); this.ultimoHmi = ahoraHmi; }
    if (this.debug && ahoraHmi - this.ultimoDebug >= 200) {
      const dep = this.gestor.camara.depuracion();
      const fpsJuego = this.game.loop.actualFps || (dt > 0 ? 1 / dt : 0);
      const alertaFPS = camara?.activo && camara.fps < 15 ? ' · detección lenta: más luz, cerrar pestañas o bajar resolución' : '';
      this.panelDepuracion.actualizar({ fps: camara?.fps, fpsCamara: camara?.fpsCamara, fpsJuego, alertaFPS, alfa: dep.alfa, Ts: dep.Ts, tau: dep.tau, controles: c, x: this.sistema.x });
      this.ultimoDebug = ahoraHmi;
    }
  }

  actualizarHmi(camara) {
    const hs = this.sistema.x, yActual = this.nivel.tanques === 2 ? hs[1] : hs[0];
    const referencia = obtenerReferencia(this.nivel, this.tiempoJuego), banda = obtenerTolerancia(this.nivel, this.tiempoJuego);
    this.pausaTexto.setText(this.pausado ? (this.pausaPorManos ? 'Muestra las manos' : 'PAUSA · Enter para reanudar') : '');
    this.pausaTexto.setVisible(this.pausado);
    dibujarTanques(this.render, hs, this.nivel.tanques, {
      tanqueControlado: this.nivel.tanques === 2 ? 1 : 0,
      referencia,
      tolerancia: banda,
      dentroBanda: Math.abs(yActual - referencia) <= banda,
      aperturaV2: this.actuador2.salida(),
      aperturaV1: this.actuador1.salida(),
      overlay: this.renderOverlay,
      conSprites: this.conSprites,
    });
    this.refTexto.setText(`h${this.nivel.tanques === 2 ? '2' : '1'} ${yActual.toFixed(2)} m · referencia ${referencia.toFixed(2)} ±${banda.toFixed(2)} m · qd ${obtenerPerturbacion(this.nivel, this.tiempoJuego).toFixed(3)} m³/s`);
    const alarmasActivas = hs.map((h, i) => h >= 2.8 ? `HH${i + 1}` : h >= 2.4 ? `H${i + 1}` : '').filter(Boolean);
    this.alarmText.setText(alarmasActivas.length ? `ALARMA ${alarmasActivas.join(' · ')}` : '');
    this.alarmText.setColor(alarmasActivas.some((a) => a.startsWith('HH')) ? '#d52222' : '#c57a00');
    if (this.runaAlarma) {
      const hh = hs.some((h) => h >= 2.8), high = hs.some((h) => h >= 2.4);
      this.runaAlarma.setTint(hh ? 0xff1744 : high ? 0xffd700 : 0x70777a);
      this.runaAlarma.setAlpha(high ? 1 : .55);
    }
    for (const valve of this.spritesValvulas || []) {
      valve.volante.setRotation((valve.clave === 'v1' ? this.actuador1.salida() : this.actuador2.salida()) * Math.PI * 2);
    }
    const criterio = this.nivel.criterio;
    if (criterio.tipo === 'consecutivo') {
      const progreso = Math.min(criterio.segundos, this.tiempoEnBandaSeguido);
      this.criterioTexto.setText(`En banda: ${progreso.toFixed(1).replace('.', ',')} / ${criterio.segundos} s seguidos`);
    } else {
      const porcentaje = this.tiempoJuego > 0 ? this.tiempoEnBandaAcumulado / this.tiempoJuego * 100 : 0;
      this.criterioTexto.setText(`En banda: ${porcentaje.toFixed(0)} % del tiempo (meta ${criterio.porcentaje} %)`);
    }
    const sinManos = camara?.activo && this.gestor.fuente === 'camara' && this.noManosDesde && performance.now() - this.noManosDesde > 3000;
    this.estadoCamara.setText(this.gestor.fuente === 'camara' ? (camara?.activo ? 'CÁMARA ACTIVA' : 'CÁMARA INACTIVA') : '');
    this.ayuda.setText(`${sinManos ? 'Muestra las manos · ' : ''}${this.pausado ? 'PAUSADO' : `Tiempo ${this.tiempoJuego.toFixed(1)} / ${this.nivel.duracion} s`} · ${this.gestor.fuente} · P linealización · D depuración · F terminar`);
    const seriesAltura = [{ clave: 'x', indice: 0, nombre: 'h1', color: 0x325f68 }, ...(this.nivel.tanques === 2 ? [{ clave: 'x', indice: 1, nombre: 'h2', color: 0x4b7a56 }] : [])];
    const opcionesNiveles = { x: 660, y: 164, ancho: 570, alto: 225, muestras: this.muestrasVista, min: 0, max: 3, unidad: 'm', titulo: 'Niveles y banda de tolerancia', clave: 'y', series: [...seriesAltura, { clave: 'h_sp', nombre: 'referencia', color: 0x75643d }], bandaInferiorClave: 'banda_inf', bandaSuperiorClave: 'banda_sup', alarma: alarmasActivas.length > 0, ejeTiempo: true };
    const opcionesValvulas = { x: 660, y: 405, ancho: 570, alto: 150, muestras: this.muestrasVista, min: 0, max: 1, unidad: 'apertura', titulo: 'Válvulas v1 / v2', ejeTiempo: true, series: [{ clave: 'u', nombre: 'v1', color: 0x425e67 }, ...(this.nivel.tanques === 2 ? [{ clave: 'v2', nombre: 'v2', color: 0x875a3e }] : [])] };
    if (!this.graf) this.graf = dibujarTendencia(this, opcionesNiveles); else this.graf.actualizar(opcionesNiveles);
    if (!this.grafValvulas) this.grafValvulas = dibujarTendencia(this, opcionesValvulas); else this.grafValvulas.actualizar(opcionesValvulas);
    if (!this.barras[0]) this.barras[0] = dibujarBarraActuador(this, 680, 584, 'v1 entrada', this.actuador1.salida(), hs[0], 'm', 'h1');
    else this.barras[0].actualizar(this.actuador1.salida(), hs[0]);
    if (this.nivel.tanques === 2) {
      if (!this.barras[1]) this.barras[1] = dibujarBarraActuador(this, 970, 584, 'v2 salida', this.actuador2.salida(), hs[1], 'm', 'h2');
      else this.barras[1].actualizar(this.actuador2.salida(), hs[1]);
    }
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
    if (this.terminado) { console.info('[DIAG] terminar ignorado: ya terminado'); return; }
    this.terminado = true;
    console.info('terminar: inicio');
    const evaluacion = evaluarNivel(this.nivel, this.muestras, this.alarmas);
    const evaluacionCompleta = this.nivel.criterio.tipo === 'consecutivo' || this.tiempoJuego >= this.nivel.duracion;
    const resultado = this.nivel.criterio.tipo === 'consecutivo'
      ? {
          ...evaluacion,
          valor: Math.max(evaluacion.valor, this.tiempoEnBandaSeguido),
          texto: `${Math.max(evaluacion.valor, this.tiempoEnBandaSeguido).toFixed(1)} s / ${this.nivel.criterio.segundos} s`,
          superado: this.tiempoEnBandaSeguido >= this.nivel.criterio.segundos && !desborde,
        }
      : { ...evaluacion, superado: evaluacion.superado && evaluacionCompleta && !desborde };
    const datosFin = { nivel: this.nivel, muestras: this.muestras, registro: this.registro, alarmas: this.alarmas, desborde, resultado, parametros: { ...this.sistema.p }, tauTeorico: constanteTiempoTanque(this.nivel.referencia), KTeorica: gananciaTanque(this.nivel.referencia) };
    console.info('terminar: cambio de escena');
    this.scene.start('Fin', datosFin);
    setTimeout(() => {
      console.info('[DIAG] escenas activas', this.game.scene.getScenes(true).map((escena) => escena.scene.key));
    }, 1000);
  }
}
