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
import { dibujarTanques, posicionEscalaTanque, posicionSpriteTanque, posicionSpritesValvulas } from '../hmi/tanques.js';
import { MAPA_CONTROL, leerSenal, leerSenalSiPresente } from './mapaControl.js';
import { LAYOUT } from '../hmi/layout.js';
import { fuenteInterfaz, fuenteTitulo } from '../hmi/estilo.js';
import { dibujarProgreso } from '../hmi/actuadores.js';

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
    this.crearFondo();
    const L = LAYOUT.simulacion;
    this.panel(L.barraSuperior, { radio: 0, profundidad: -850 });
    this.add.text(L.titulo.x, L.titulo.y, this.nivel.nombre, fuenteTitulo(27)).setDepth(5);
    this.panel(L.hmi, { profundidad: -5 });
    this.panel(L.footer, { profundidad: -5 });
    this.hmiX = L.hmiInterior.x;
    this.hmiAncho = L.hmiInterior.ancho;
    if (this.textures.exists('baldosas')) this.piso = this.add.tileSprite(L.piso.x + L.piso.ancho / 2, L.piso.y + L.piso.alto / 2, L.piso.ancho, L.piso.alto, 'baldosas', 0).setDepth(-10);
    else this.add.rectangle(L.piso.x + L.piso.ancho / 2, L.piso.y + L.piso.alto / 2, L.piso.ancho, L.piso.alto, 0x34383b).setDepth(-10);
    this.render = this.add.graphics().setDepth(-1);
    this.renderTuberias = this.add.graphics().setDepth(-.55);
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
        const cuerpo = this.add.image(punto.x, punto.y, 'valvula-cuerpo').setDisplaySize(L.valvulaSprite.cuerpo, L.valvulaSprite.cuerpo);
        const volante = this.add.sprite(punto.x, punto.y, 'valvula-volante').setDisplaySize(L.valvulaSprite.volante, L.valvulaSprite.volante).play('valvula-en-servicio');
        this.spritesValvulas.push({ clave, cuerpo, volante });
      }
    }
    this.renderOverlay = this.add.graphics().setDepth(2);
    if (this.nivel.tanques === 2) {
      const s = L.soporte;
      if (this.textures.exists('baldosas')) this.add.tileSprite(s.x + s.ancho / 2, s.y + (s.baseY - s.y) / 2, s.ancho, s.baseY - s.y, 'baldosas', 0).setDepth(-.65);
      const bordePedestal = this.add.graphics().setDepth(-.6);
      bordePedestal.lineStyle(L.bordePedestal.ancho, LAYOUT.colores.oscuro, 1).strokeRect(s.x, s.y, s.ancho, s.baseY - s.y);
      bordePedestal.lineStyle(L.bordePedestal.ancho, LAYOUT.colores.oscuro, 1).lineBetween(s.x - L.bordePedestal.voladizo, s.baseY, s.x + s.ancho + L.bordePedestal.voladizo, s.baseY);
    }
    this.placasAlarmas = [];
    this.runasAlarmas = [];
    if (this.textures.exists('alarma-placa') && this.textures.exists('alarma-runa')) {
      for (const p of posicionSpritesValvulas(this.nivel.tanques).alarmas) {
        this.placasAlarmas.push(this.add.image(p.x, p.y, 'alarma-placa').setDisplaySize(L.alarmaSolo.tamano, L.alarmaSolo.tamano).setDepth(3));
        this.runasAlarmas.push(this.add.sprite(p.x, p.y, 'alarma-runa').setDisplaySize(L.alarmaSolo.tamano, L.alarmaSolo.tamano).setDepth(4).play('runa-alerta'));
      }
    }
    this.etiquetasEscala = [];
    for (let tanque = 0; tanque < this.nivel.tanques; tanque++) {
      const extremoSuperior = posicionEscalaTanque(tanque, 3, this.nivel.tanques, this.conSprites);
      const extremoInferior = posicionEscalaTanque(tanque, 0, this.nivel.tanques, this.conSprites);
      const escalaPanel = L.escalaTanque;
      this.panel({
        x: extremoSuperior.x - escalaPanel.margenX,
        y: extremoSuperior.y - escalaPanel.margenSuperior,
        ancho: escalaPanel.ancho,
        alto: extremoInferior.y - extremoSuperior.y + escalaPanel.margenSuperior + escalaPanel.margenInferior,
      }, { profundidad: 1, radio: 5, alpha: .82 });
      for (let metro = 0; metro <= 3; metro++) {
        const p = posicionEscalaTanque(tanque, metro, this.nivel.tanques, this.conSprites);
        this.etiquetasEscala.push(this.add.text(p.x, p.y, String(metro), fuenteInterfaz(11)).setOrigin(0, 0).setDepth(5));
      }
      const p = posicionEscalaTanque(tanque, 3, this.nivel.tanques, this.conSprites);
      this.etiquetasEscala.push(this.add.text(p.x, p.y - 18, 'm', fuenteInterfaz(10)).setOrigin(0, 0).setDepth(5));
    }
    for (let i = 0; i < this.nivel.tanques; i++) {
      const r = this.nivel.tanques === 2 ? (i === 0 ? L.etiqueta1Cascada : L.etiqueta2Cascada) : L.etiquetaSolo;
      const a = this.nivel.tanques === 2 ? (i === 0 ? L.alarma1Cascada : L.alarma2Cascada) : L.alarmaSolo;
      this.panel(r, { profundidad: 1, radio: 8 });
      const plate = this.placasAlarmas[i], rune = this.runasAlarmas[i];
      if (plate) plate.setPosition(a.x + a.tamano / 2, a.y + a.tamano / 2);
      if (rune) rune.setPosition(a.x + a.tamano / 2, a.y + a.tamano / 2);
      this.add.text(r.x + (a.x - r.x) + a.tamano + 9, r.y + 9, '', fuenteInterfaz(this.nivel.tanques === 2 ? 13 : 12, '#E6E8EA', { fontStyle: 'bold' })).setDepth(5).setName(`etiqueta-tanque-${i}`);
    }
    this.refTexto = this.add.text(L.estado.x, L.estado.y, '', fuenteInterfaz(15, '#E6E8EA', { fontStyle: 'bold' }));
    if (this.nivel.tanques === 2) {
      this.ayudaCascada = null;
      const q = L.tuberiaQ12.etiqueta;
      this.panel(q, { profundidad: 1, radio: 5 });
      this.add.text(q.x + 5, q.y + 5, 'q12 = c1·√h1', fuenteInterfaz(10, '#E6E8EA', { fontStyle: 'bold' })).setDepth(5);
    }
    this.alarmText = this.add.text(L.estado.x, L.estado.y + 27, '', fuenteInterfaz(13, '#E6E8EA', { fontStyle: 'bold' }));
    this.criterioTexto = this.add.text(L.criterio.x + 10, L.criterio.y + 2, '', fuenteInterfaz(14, '#E6E8EA', { fontStyle: 'bold' }));
    this.progresoCriterio = dibujarProgreso(this, { x: L.criterio.x + 10, y: L.criterio.y + L.criterio.progresoOffsetY, ancho: L.criterio.ancho - 20, alto: 12 }, 0);
    this.pausaPanel = this.panel(L.pausa.panel, { profundidad: 9 });
    this.pausaPanel.setVisible(false);
    this.pausaTexto = this.add.text(L.pausa.centroX, L.pausa.centroY, '', fuenteTitulo(26)).setOrigin(.5).setDepth(10);
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
      limpiar(() => this.renderTuberias.destroy());
      limpiar(() => this.renderOverlay.destroy());
      this.etiquetasEscala.forEach((texto) => limpiar(() => texto.destroy()));
    });
    this.gestor.eventos.addEventListener('pausa', () => { this.pausado = !this.pausado; this.pausaPorManos = false; });
      const ayudaLayout = this.nivel.tanques === 2 ? L.ayudaCascada : L.ayudaSimple;
    this.ayuda = this.add.text(ayudaLayout.x, L.ayuda.y, '', fuenteInterfaz(13)).setDepth(5);
    this.ayuda.setWordWrapWidth(ayudaLayout.ancho);
    this.tiempoTexto = this.add.text(L.tiempo.x, L.tiempo.y, '', fuenteInterfaz(14, '#E6E8EA', { fontStyle: 'bold' })).setDepth(5);
    this.relojIcono = this.textures.exists('interfaz') ? this.add.image(L.reloj.x, L.reloj.y, 'interfaz', 6).setDisplaySize(L.reloj.tamano, L.reloj.tamano).setDepth(5) : null;
    this.estadoCamara = this.add.text(L.estadoCamara.x, L.estadoCamara.y, '', fuenteInterfaz(14, '#E6E8EA', { fontStyle: 'bold' })).setOrigin(1, .5).setDepth(5);
    this.botonTerminar = this.boton(L.terminar, 'Terminar', () => {
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
    const L = LAYOUT.simulacion;
    const referencia = obtenerReferencia(this.nivel, this.tiempoJuego), banda = obtenerTolerancia(this.nivel, this.tiempoJuego);
    this.pausaTexto.setText(this.pausado ? (this.pausaPorManos ? 'Muestra las manos' : 'PAUSA · Enter para reanudar') : '');
    this.pausaTexto.setVisible(this.pausado);
    this.pausaPanel.setVisible(this.pausado);
    dibujarTanques(this.render, hs, this.nivel.tanques, {
      tanqueControlado: this.nivel.tanques === 2 ? 1 : 0,
      referencia,
      tolerancia: banda,
      dentroBanda: Math.abs(yActual - referencia) <= banda,
      aperturaV2: this.actuador2.salida(),
      aperturaV1: this.actuador1.salida(),
      overlay: this.renderOverlay,
      tuberias: this.renderTuberias,
      conSprites: this.conSprites,
      conSpritesValvula: this.conSpritesValvula,
    });
    const alturaEtiqueta = this.nivel.tanques === 2 ? 'h2' : 'h1';
    const textoRef = this.nivel.tanques === 2
      ? `${alturaEtiqueta} ${yActual.toFixed(2)} m · ref ${referencia.toFixed(2)} ±${banda.toFixed(2)} m · qd ${obtenerPerturbacion(this.nivel, this.tiempoJuego).toFixed(2)}`
      : `${alturaEtiqueta} ${yActual.toFixed(2)} m · referencia ${referencia.toFixed(2)} ±${banda.toFixed(2)} m · qd ${obtenerPerturbacion(this.nivel, this.tiempoJuego).toFixed(3)} m³/s`;
    this.refTexto.setText(textoRef);
    hs.forEach((h, i) => this.children.getByName(`etiqueta-tanque-${i}`)?.setText(`Alambique ${i + 1} · h${i + 1} ${h.toFixed(2)} m`));
    const alarmasActivas = hs.map((h, i) => h >= 2.8 ? `HH${i + 1}` : h >= 2.4 ? `H${i + 1}` : '').filter(Boolean);
    this.alarmText.setText(alarmasActivas.length ? `ALARMA ${alarmasActivas.join(' · ')}` : '');
    this.alarmText.setColor(alarmasActivas.some((a) => a.startsWith('HH')) ? '#FF1744' : '#FFD700');
    (this.runasAlarmas || []).forEach((runa, i) => {
      const h = hs[i] ?? 0;
      const colorRuna = h >= 2.8 ? 0xff1744 : h >= 2.4 ? 0xffd700 : 0x70777a;
      runa.setTint(colorRuna).setAlpha(h >= 2.4 ? 1 : .8);
    });
    for (const valve of this.spritesValvulas || []) {
      valve.volante.setRotation((valve.clave === 'v1' ? this.actuador1.salida() : this.actuador2.salida()) * Math.PI * 1.5);
    }
    const criterio = this.nivel.criterio;
    let valorProgreso = 0;
    if (criterio.tipo === 'consecutivo') {
      const progreso = Math.min(criterio.segundos, this.tiempoEnBandaSeguido);
      valorProgreso = progreso / criterio.segundos;
      this.criterioTexto.setText(`En banda: ${progreso.toFixed(1).replace('.', ',')} / ${criterio.segundos} s seguidos`);
    } else {
      const porcentaje = this.tiempoJuego > 0 ? this.tiempoEnBandaAcumulado / this.tiempoJuego * 100 : 0;
      valorProgreso = porcentaje / criterio.porcentaje;
      this.criterioTexto.setText(`En banda: ${porcentaje.toFixed(0)} % del tiempo (meta ${criterio.porcentaje} %)`);
    }
    this.progresoCriterio.actualizar(Math.min(1, valorProgreso));
    this.estadoCamara.setText(this.gestor.fuente === 'camara' ? (camara?.activo ? 'CÁMARA ACTIVA' : 'CÁMARA INACTIVA') : this.gestor.fuente.toUpperCase());
    this.ayuda.setText(this.nivel.tanques === 2
      ? 'Mano derecha → v1 entrada · Pellizco izquierdo abierto → v2 abierta'
      : `${this.gestor.fuente} · P parámetros\nD depuración · F terminar`);
    this.tiempoTexto.setText(`${this.pausado ? 'PAUSADO' : `Tiempo ${this.tiempoJuego.toFixed(1)} / ${this.nivel.duracion} s`}`);
    const seriesAltura = [{ clave: 'x', indice: 0, nombre: 'h1', color: 0xe6e8ea }, ...(this.nivel.tanques === 2 ? [{ clave: 'x', indice: 1, nombre: 'h2', color: 0x2ecc71 }] : [])];
    const opcionesNiveles = { ...L.tendenciaNiveles, muestras: this.muestrasVista, min: 0, max: 3, unidad: 'm', titulo: 'Niveles y banda', clave: 'y', series: [...seriesAltura, { clave: 'h_sp', nombre: 'referencia', color: 0xc9a227 }], bandaInferiorClave: 'banda_inf', bandaSuperiorClave: 'banda_sup', alarma: alarmasActivas.length > 0, ejeTiempo: true };
    const opcionesValvulas = { ...L.tendenciaValvulas, muestras: this.muestrasVista, min: 0, max: 1, unidad: '', titulo: 'Válvulas v1 / v2', tituloEjeY: 'apertura', formatoTickY: (v) => Number(v.toFixed(2)).toString(), ejeTiempo: true, series: [{ clave: 'u', nombre: 'v1', color: 0xe6e8ea }, ...(this.nivel.tanques === 2 ? [{ clave: 'v2', nombre: 'v2', color: 0x2ecc71 }] : [])] };
    if (!this.graf) this.graf = dibujarTendencia(this, opcionesNiveles); else this.graf.actualizar(opcionesNiveles);
    if (!this.grafValvulas) this.grafValvulas = dibujarTendencia(this, opcionesValvulas); else this.grafValvulas.actualizar(opcionesValvulas);
    const xV1 = L.barraV1.x;
    const xV2 = L.barraV2.x;
    if (!this.barras[0]) this.barras[0] = dibujarBarraActuador(this, xV1, L.barraV1.y, 'v1 entrada', this.actuador1.salida(), hs[0], 'm', 'h1', L.barraV1.ancho);
    else this.barras[0].actualizar(this.actuador1.salida(), hs[0]);
    if (this.nivel.tanques === 2) {
      if (!this.barras[1]) this.barras[1] = dibujarBarraActuador(this, xV2, L.barraV2.y, 'v2 salida', this.actuador2.salida(), hs[1], 'm', 'h2', L.barraV2.ancho);
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
    const ui = LAYOUT.simulacion.parametros;
    const bg = this.panel(ui.panel, { profundidad: 8 });
    const texto = this.add.text(ui.texto.x, ui.texto.y, `Linealización local del tanque ${this.nivel.tanques === 2 ? 2 : 1}\nA·dh/dt = qin − c√h\nh₀ = ${h0.toFixed(3)} m · τ = 2A√h₀/c = ${tau.toFixed(3)} s\nK = 2√h₀/c = ${K.toFixed(3)} · d(qsalida)/dh`, fuenteInterfaz(17, '#E6E8EA', { lineSpacing: 8 })).setDepth(9);
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
