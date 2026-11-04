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
import { dibujarTanquesFijos, dibujarNivelesTanques, dibujarTuberia, dibujarLiquidosCascada, convertirVisoresCascada, obtenerVisorTanque, posicionEscalaTanque, posicionSpriteTanque, posicionSpritesValvulas } from '../hmi/tanques.js';
import { MAPA_CONTROL, leerSenalSiPresente } from './mapaControl.js';
import { LAYOUT } from '../hmi/layout.js';
import { fuenteInterfaz, fuenteTitulo } from '../hmi/estilo.js';
import { dibujarProgreso } from '../hmi/actuadores.js';
import { faseVisualPerturbacion, instantesInicioPerturbacion } from './perturbaciones.js';
import { ResorteVisual } from './efectos/resorteVisual.js';
import { obtenerGestorAudio } from './audio.js';

function dibujarCanalConFlujo(g, puntos, caudal, tiempo, config, anchoTubo) {
  g.clear();
  if (!(caudal > 0)) return;
  const anchoCanal = anchoTubo * config.anchoRelativo;
  const segmentos = [];
  let longitudTotal = 0;
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1], b = puntos[i];
    const longitud = Math.hypot(b.x - a.x, b.y - a.y);
    segmentos.push({ a, b, longitud, inicio: longitudTotal });
    longitudTotal += longitud;
    g.lineStyle(anchoCanal, 0x2ecc71, .95).lineBetween(a.x, a.y, b.x, b.y);
  }
  if (!longitudTotal) return;
  const separacion = config.separacionTrazos;
  const fase = (tiempo * caudal * config.pixelesPorCaudal) % separacion;
  for (const segmento of segmentos) {
    for (let inicio = fase - segmento.inicio; inicio < segmento.longitud; inicio += separacion) {
      const desde = Math.max(0, inicio), hasta = Math.min(segmento.longitud, inicio + config.largoTrazo);
      if (hasta <= desde) continue;
      const fraccionA = desde / segmento.longitud, fraccionB = hasta / segmento.longitud;
      const x1 = segmento.a.x + (segmento.b.x - segmento.a.x) * fraccionA;
      const y1 = segmento.a.y + (segmento.b.y - segmento.a.y) * fraccionA;
      const x2 = segmento.a.x + (segmento.b.x - segmento.a.x) * fraccionB;
      const y2 = segmento.a.y + (segmento.b.y - segmento.a.y) * fraccionB;
      g.lineStyle(Math.max(1.5, anchoCanal * .65), 0x00e676, 1).lineBetween(x1, y1, x2, y2);
    }
  }
}

const PARAMETROS_NOMINALES = Object.freeze({ area: 1, coeficienteDescarga1: 0.2, coeficienteDescarga2: 0.2 });
const OPCIONES_PARAMETROS = Object.freeze({
  area: [0.8, 1, 1.2],
  coeficienteDescarga1: [0.16, 0.2, 0.24],
  coeficienteDescarga2: [0.16, 0.2, 0.24],
});

function normalizarParametros(valor = {}) {
  const escoger = (clave) => {
    const opciones = OPCIONES_PARAMETROS[clave], solicitado = Number(valor[clave]);
    return opciones.includes(solicitado) ? solicitado : PARAMETROS_NOMINALES[clave];
  };
  return { area: escoger('area'), coeficienteDescarga1: escoger('coeficienteDescarga1'), coeficienteDescarga2: escoger('coeficienteDescarga2') };
}

function cargarParametrosGuardados() {
  try { return normalizarParametros(JSON.parse(localStorage.getItem('alambique.parametros') || '{}')); }
  catch { return { ...PARAMETROS_NOMINALES }; }
}

function guardarParametrosGuardados(parametros) {
  try { localStorage.setItem('alambique.parametros', JSON.stringify(normalizarParametros(parametros))); } catch {}
}

function decimalParametro(valor) { return String(valor).replace('.', ','); }

export class Simulacion extends EscenaBase {
  constructor() { super('Simulacion'); }
  create() {
    this.terminado = false;
    this.audio = obtenerGestorAudio(this);
    this.audio?.vincular(this);
    this.audio?.setMusic('musica_operacion');
    this.audioAlarma = [];
    this.audioReferencia = null;
    this.audioFasePerturbacion = null;
    this.faseLlave = null;
    this.reducirEfectos = contextoJuego.reducirEfectos ?? leerPreferencia('alambique.reducirEfectos', 'false') === 'true';
    this.resorteCamaraX = new ResorteVisual({ zeta: .3, frecuenciaHz: 12 });
    this.resorteCamaraY = new ResorteVisual({ zeta: .3, frecuenciaHz: 12 });
    this.resortesOleaje = Array.from({ length: 2 }, () => new ResorteVisual({ zeta: .2, frecuenciaHz: 2 }));
    this.historialActuadores = { v1: [], v2: [] };
    this.oleajeArmado = { v1: true, v2: true };
    this.oleajeActual = [0, 0];
    this.dentroBandaAnterior = false;
    this.brilloBandaHasta = 0;
    this.destelloHasta = 0;
    this.flashTanque = 0;
    this.avisoErrorEfectos = false;
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
    this.tiemposCuadro = [];
    this.tiempoMedioCuadroMs = 0;
    this.debugVisibleAnterior = false;
    contextoJuego.vistaDepuracionActiva = false;
    mostrarVistaCamaraDepuracion(false);
    this.selectStart = null;
    this.selectWasLong = false;
    this.ultimaAlarma = {};
    this.tiempoJuego = 0;
    this.izquierdaPresenteAnterior = false;
    this.ayudaPellizcoHasta = 0;
    this.nivel = cargarNiveles().find((n) => n.id === Number(contextoJuego.nivelElegido)) || cargarNiveles()[0];
    this.parametrosEnUso = cargarParametrosGuardados();
    this.parametrosEdicion = { ...this.parametrosEnUso };
    this.gestor = contextoJuego.gestor = new GestorEntrada({ fuente: contextoJuego.fuenteElegida || undefined });
    this.gestor.elegir(contextoJuego.fuenteElegida || this.gestor.fuente);
    this.modoVerificacionEscalon = this.gestor.fuente === 'escalon' && this.nivel.id === 1;
    if (this.modoVerificacionEscalon) {
      const alturaEquilibrio = (PARAMETROS_TANQUES.caudalEntradaMaximo * 0.612372 / this.parametrosEnUso.coeficienteDescarga1) ** 2;
      this.nivel.estadoInicial = [alturaEquilibrio];
      this.nivel.duracion = 120;
    }
    const h1 = this.nivel.estadoInicial[0];
    this.actuador1 = new Actuador({ velocidadMaxima: PARAMETROS_TANQUES.velocidadMaximaValvula, inicial: this.parametrosEnUso.coeficienteDescarga1 * Math.sqrt(h1) / PARAMETROS_TANQUES.caudalEntradaMaximo });
    this.actuador2 = new Actuador({ velocidadMaxima: PARAMETROS_TANQUES.velocidadMaximaValvula, inicial: 1 });
    this.audioUltimoMando = { v1: this.actuador1.salida(), v2: this.actuador2.salida() };
    this.audioUltimoTope = { v1: this.actuador1.salida() <= .001 ? 0 : this.actuador1.salida() >= .999 ? 1 : null, v2: 1 };
    this.sistema = crearSistemaTanques(this.nivel);
    Object.assign(this.sistema.p, this.parametrosEnUso);
    const encabezados = ['t', 'u_crudo', 'u', 'x1', 'x2', 'y', 'v2', 'q_d', 'h_sp'];
    this.registro = new Registro({ encabezados });
    this.muestras = []; this.muestrasVista = []; this.alarmas = []; this.pausado = false; this.pausaPorManos = false; this.debug = false;
    this.ultimoUpdateReal = performance.now();
    this.ultimoTiempoMuestra = 0;
    this.crearFondo();
    const L = LAYOUT.simulacion;
    this.panel(L.barraSuperior, { radio: 0, profundidad: -850 });
    this.add.text(L.titulo.x, L.titulo.y, this.nivel.nombre, fuenteTitulo(27)).setDepth(5);
    this.promptAudio = this.add.text(L.audioPrompt.x, L.audioPrompt.y, 'Toca o haz un gesto para activar el sonido', fuenteInterfaz(10, '#F2E6C9')).setDepth(5);
    this.audio?.instalarDesbloqueo(this, this.promptAudio);
    this.promptAudio?.setVisible(!this.audio?.desbloqueado);
    this.audio?.setMusic('musica_operacion');
    this.parametrosEstado = this.add.text(L.parametrosEstado.x, L.parametrosEstado.y, '', fuenteInterfaz(12, '#E6E8EA')).setDepth(5);
    this.actualizarEtiquetaParametros();
    this.panel(L.hmi, { profundidad: -5 });
    this.panel(L.footer, { profundidad: -5 });
    this.hmiX = L.hmiInterior.x;
    this.hmiAncho = L.hmiInterior.ancho;
    this.esCascada = this.nivel.tanques === 2 && this.textures.exists('alambique-cascada');
    this.render = this.add.graphics().setDepth(-1);
    this.renderFijo = this.add.graphics().setDepth(-1.1);
    this.renderMarcasFijas = this.add.graphics().setDepth(2);
    this.renderTuberias = this.add.graphics().setDepth(-.55);
    this.renderSalidaOculta = this.add.graphics().setDepth(-.6);
    this.renderBridaSalida = this.add.graphics().setDepth(.3);
    this.renderCanalSalida = this.add.graphics().setDepth(.35);
    this.renderTuberiasExtra = this.add.graphics().setDepth(0);
    this.renderTuberiaCascada = this.add.graphics().setDepth(.15);
    this.renderIntercambioFijo = this.add.graphics().setDepth(.2);
    this.renderIntercambioFlujo = this.add.graphics().setDepth(.25);
    this.renderIntercambioAviso = this.add.graphics().setDepth(.3);
    this.renderLlaveChorro = this.add.graphics().setDepth(3.2);
    this.renderEntradaFixtures = this.add.graphics().setDepth(-.4);
    this.renderVisorLiquido = this.add.graphics().setDepth(1.5);
    this.renderVisorOverlay = this.add.graphics().setDepth(2);
    this.renderEquilibrio = this.add.graphics().setDepth(2.5);
    this.renderChorro = this.add.graphics().setDepth(4);
    this.renderDestello = this.add.graphics().setDepth(4.6);
    this.renderBrilloBanda = this.add.graphics().setDepth(4.7);
    this.conSprites = this.textures.exists('alambique');
    this.spritesTanques = [];
    this.spritesValvulas = [];
    if (this.textures.exists('mesa-laboratorio')) {
      const mesa = L.mesa, fuente = this.textures.get('mesa-laboratorio').getSourceImage();
      const alto = mesa.ancho * fuente.height / fuente.width;
      this.mesaSprite = this.add.image(mesa.centroX, mesa.patasY - alto / 2, 'mesa-laboratorio').setDisplaySize(mesa.ancho, alto).setDepth(-.8);
      const cimaMesa = mesa.patasY - alto;
      this.anclajesMesa = {
        bordeTrasero: { x: mesa.centroX, y: cimaMesa + alto * mesa.bordeTrasero.yRel },
        bordeDelantero: { x: mesa.centroX, y: cimaMesa + alto * mesa.bordeDelantero.yRel },
        apoyoTanque: { x: mesa.centroX, y: cimaMesa + alto * mesa.puntoApoyoTanque.yRel },
        bordeIzquierdo: mesa.centroX - mesa.ancho / 2,
        bordeDerecho: mesa.centroX + mesa.ancho / 2,
      };
      const sombraMesa = this.add.graphics().setDepth(-.75);
      for (const fraccion of mesa.patasDelanteras) {
        const x = mesa.centroX + (fraccion - .5) * mesa.ancho;
        sombraMesa.fillStyle(0x111315, .12).fillEllipse(x, mesa.patasY + 3, 54, 13);
      }
    }
    if (this.esCascada) {
      const cfg = L.cascada, fuente = this.textures.get('alambique-cascada').getSourceImage();
      const mesa = L.mesa, surfaceY = this.anclajesMesa?.apoyoTanque.y ?? (mesa.patasY - mesa.alto * (1 - mesa.puntoApoyoTanque.yRel));
      const alto = Math.min(surfaceY - cfg.topMinimo, (surfaceY - cfg.topMinimo) / cfg.baseTanque2Y);
      const ancho = alto * fuente.width / fuente.height;
      const salidaXRel = cfg.salida.x;
      const bordeMesa = this.anclajesMesa?.bordeDerecho ?? (mesa.centroX + mesa.ancho / 2);
      const x = bordeMesa + cfg.salidaFueraMesa - salidaXRel * ancho + ancho / 2;
      const top = surfaceY - cfg.baseTanque2Y * alto;
      this.cajaCascada = { x: x - ancho / 2, y: top, w: ancho, h: alto };
      const cuerpo = cfg.cuerpoTanques, centroBase = this.cajaCascada.x + (cuerpo.x0 + cuerpo.x1) / 2 * ancho;
      const anchoBase = (cuerpo.x1 - cuerpo.x0) * ancho;
      const sombra = this.add.graphics().setDepth(-.8);
      for (const [anchoSombra, alpha] of [[anchoBase + 38, .08], [anchoBase + 20, .13], [anchoBase + 5, .18]]) sombra.fillStyle(0x111315, alpha).fillEllipse(centroBase, surfaceY + 4, anchoSombra, 16);
      this.spriteCascada = this.add.image(x, top + alto / 2, 'alambique-cascada').setDisplaySize(ancho, alto).setDepth(-.5);
      this.visoresCascada = convertirVisoresCascada(this.cajaCascada, this.cache.json.get('alambique-cascada-visores'));
      this.mascaraGeometricaVisores = this.make.graphics({ x: 0, y: 0, add: false });
      this.mascaraGeometricaVisores.fillStyle(0xffffff, 1);
      for (const v of Object.values(this.visoresCascada)) this.mascaraGeometricaVisores.fillRect(v.x, v.y, v.w, v.h);
      this.mascaraVisores = this.mascaraGeometricaVisores.createGeometryMask();
      this.renderVisorLiquido.setMask(this.mascaraVisores);
      this.renderEquilibrio.setMask(this.mascaraVisores);
    } else {
      for (let i = 0; i < this.nivel.tanques; i++) {
        if (!this.conSprites) continue;
        const p = posicionSpriteTanque(i, this.nivel.tanques);
        this.spritesTanques.push(this.add.image(p.x, p.y, 'alambique').setDisplaySize(p.ancho, p.alto).setDepth(-.5));
        const sombra = this.add.graphics().setDepth(-.7);
        for (const [anchoSombra, alpha] of [[p.ancho + 48, .08], [p.ancho + 28, .12], [p.ancho + 10, .16]]) sombra.fillStyle(0x111315, alpha).fillEllipse(p.x, p.y + p.alto / 2 + 4, anchoSombra, 16);
      }
    }
    if (!this.esCascada) this.dibujarFijacionesEntrada();
    this.conSpritesValvula = this.textures.exists('valvula-cuerpo') && this.textures.exists('valvula-volante');
    if (this.conSpritesValvula && !this.esCascada) {
      const puntos = posicionSpritesValvulas(this.nivel.tanques);
      for (const [clave, punto] of [['v1', puntos.v1], ['v2', puntos.v2]]) {
        if (!punto || (clave === 'v2' && this.nivel.tanques !== 2)) continue;
        const cuerpo = this.add.image(punto.x, punto.y, 'valvula-cuerpo').setDisplaySize(L.valvulaSprite.cuerpo, L.valvulaSprite.cuerpo);
        const volante = this.add.sprite(punto.x, punto.y, 'valvula-volante').setDisplaySize(L.valvulaSprite.volante, L.valvulaSprite.volante).play('valvula-en-servicio');
        this.spritesValvulas.push({ clave, cuerpo, volante });
      }
    } else if (this.esCascada && this.textures.exists('valvula-volante')) {
      const cfg = L.cascada;
      for (const clave of ['v1', 'v2']) {
        const r = cfg.ruedas[clave], x = this.cajaCascada.x + r.x * this.cajaCascada.w, y = this.cajaCascada.y + r.y * this.cajaCascada.h;
        const volante = this.add.sprite(x, y, 'valvula-volante').setDisplaySize(cfg.ruedas.tamano, cfg.ruedas.tamano).play('valvula-en-servicio');
        this.spritesValvulas.push({ clave, volante });
      }
    }
    this.renderOverlay = this.add.graphics().setDepth(2);
    this.etiquetasEquilibrio = Array.from({ length: this.nivel.tanques }, (_, indice) => {
      const visor = this.esCascada
        ? this.visoresCascada[indice === 0 ? 'superior' : 'inferior']
        : obtenerVisorTanque(indice, this.nivel.tanques, this.conSprites);
      const xDerecha = visor.x + visor.w + L.equilibrio.etiquetaOffsetX;
      const x = xDerecha + L.equilibrio.etiquetaAncho <= L.planta.x + L.planta.ancho
        ? xDerecha
        : visor.x - L.equilibrio.etiquetaAncho - L.equilibrio.etiquetaOffsetX;
      return this.add.text(x, visor.y, 'equilibrio', fuenteInterfaz(9, '#FFFFFF', { backgroundColor: 'rgba(28,32,38,0.9)', padding: { x: 2, y: 1 } })).setDepth(6).setVisible(false);
    });
    if (this.textures.exists('caldero-real')) {
      const cfg = L.caldero, fuente = this.textures.get('caldero-real').getSourceImage();
      const ancho = cfg.ancho, alto = ancho * fuente.height / fuente.width;
      const x = this.esCascada
        ? this.cajaCascada.x + L.cascada.salida.x * this.cajaCascada.w
        : cfg.centroX;
      this.calderoCaja = { x: x - ancho / 2, y: cfg.baseY - alto, w: ancho, h: alto };
      const sombraCaldero = this.add.graphics().setDepth(-.7);
      for (const [anchoSombra, alpha] of [[ancho + 38, .08], [ancho + 20, .13], [ancho + 5, .18]]) sombraCaldero.fillStyle(0x111315, alpha).fillEllipse(x, cfg.baseY + 3, anchoSombra, 13);
      this.add.image(x, cfg.baseY - alto / 2, 'caldero-real').setDisplaySize(ancho, alto).setDepth(1);
      this.anclajeBocaCaldero = { x, y: this.calderoCaja.y + alto * cfg.boca.yRel };
      this.superficiePocionCaldero = { x, y: this.calderoCaja.y + alto * cfg.pocion.yRel };
      this.picoSalida = this.esCascada
        ? { x: this.cajaCascada.x + L.cascada.salida.x * this.cajaCascada.w, y: this.cajaCascada.y + L.cascada.salida.y * this.cajaCascada.h }
        : { x, y: this.anclajeBocaCaldero.y - cfg.alturaPicoSobreBorde };
    }
    this.placasAlarmas = [];
    this.runasAlarmas = [];
    if (this.textures.exists('alarma-placa') && this.textures.exists('alarma-runa')) {
      const puntos = this.esCascada
        ? ['superior', 'inferior'].map((key, i) => ({ x: L.cascada.etiquetasTanque[i].x + L.cascada.etiquetasTanque[i].placa / 2, y: this.visoresCascada[key].y + this.visoresCascada[key].h / 2, tamano: L.cascada.etiquetasTanque[i].placa }))
        : posicionSpritesValvulas(this.nivel.tanques).alarmas.map((p) => ({ ...p, tamano: L.alarmaSolo.tamano }));
      for (const p of puntos) {
        this.placasAlarmas.push(this.add.image(p.x, p.y, 'alarma-placa').setDisplaySize(p.tamano, p.tamano).setDepth(3));
        this.runasAlarmas.push(this.add.sprite(p.x, p.y, 'alarma-runa').setDisplaySize(p.tamano, p.tamano).setDepth(4).play('runa-alerta'));
      }
    }
    this.etiquetasEscala = [];
    if (this.esCascada) {
      for (const key of ['superior', 'inferior']) {
        const v = this.visoresCascada[key], x = v.x + v.w + 9;
        for (let metro = 0; metro <= 3; metro++) {
          const y = v.y + v.h * (1 - metro / 3);
          this.renderVisorOverlay.lineStyle(1, 0xe6e8ea, .9).lineBetween(v.x + v.w, y, x - 2, y);
          this.etiquetasEscala.push(this.add.text(x, y - 7, String(metro), fuenteInterfaz(10)).setDepth(5));
        }
        this.etiquetasEscala.push(this.add.text(x, v.y - 15, 'm', fuenteInterfaz(9)).setDepth(5));
      }
    } else for (let tanque = 0; tanque < this.nivel.tanques; tanque++) {
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
      if (this.esCascada) {
        const key = i === 0 ? 'superior' : 'inferior', visor = this.visoresCascada[key], cfg = L.cascada.etiquetasTanque[i];
        const y = visor.y + visor.h / 2 - cfg.alto / 2;
        this.panel({ x: cfg.x, y, ancho: cfg.ancho, alto: cfg.alto }, { profundidad: 1, radio: 7 });
        this.placasAlarmas[i]?.setPosition(cfg.x + cfg.placa / 2, y + cfg.alto / 2);
        this.runasAlarmas[i]?.setPosition(cfg.x + cfg.placa / 2, y + cfg.alto / 2);
        this.add.text(cfg.x + cfg.placa + 3, y + 10, `Alambique ${i + 1} · h${i + 1}`, fuenteInterfaz(10, '#E6E8EA', { fontStyle: 'bold' })).setDepth(5);
        this.renderVisorOverlay.lineStyle(1, 0xb85a24, .72).lineBetween(cfg.x + cfg.ancho, y + cfg.alto / 2, visor.x - 3, y + cfg.alto / 2);
        continue;
      }
      const r = this.nivel.tanques === 2 ? (i === 0 ? L.etiqueta1Cascada : L.etiqueta2Cascada) : L.etiquetaSolo;
      const a = this.nivel.tanques === 2 ? (i === 0 ? L.alarma1Cascada : L.alarma2Cascada) : L.alarmaSolo;
      this.panel(r, { profundidad: 1, radio: 8 });
      const plate = this.placasAlarmas[i], rune = this.runasAlarmas[i];
      if (plate) plate.setPosition(a.x + a.tamano / 2, a.y + a.tamano / 2);
      if (rune) rune.setPosition(a.x + a.tamano / 2, a.y + a.tamano / 2);
      this.add.text(r.x + (a.x - r.x) + a.tamano + 9, r.y + 9, '', fuenteInterfaz(this.nivel.tanques === 2 ? 13 : 12, '#E6E8EA', { fontStyle: 'bold' })).setDepth(5).setName(`etiqueta-tanque-${i}`);
    }
    this.refTexto = this.add.text(L.estado.x, L.estado.y, '', fuenteInterfaz(15, '#E6E8EA', { fontStyle: 'bold' }));
    if (this.esCascada) {
      this.etiquetasValvulas = {};
      for (const [i, clave] of ['v1', 'v2'].entries()) {
        const pos = L.cascada.etiquetasValvula, rueda = L.cascada.ruedas[clave];
        const cx = this.cajaCascada.x + rueda.x * this.cajaCascada.w;
        const cy = this.cajaCascada.y + rueda.y * this.cajaCascada.h;
        const arriba = clave === 'v1';
        const y = arriba ? cy - rueda.tamano / 2 - pos.separacion - pos.alto : cy + rueda.tamano / 2 + pos.separacion;
        const x = cx + rueda.tamano / 2 + pos.separacion;
        this.panel({ x, y, ancho: pos.ancho, alto: pos.alto }, { profundidad: 1, radio: 5 });
        const puntoRueda = { x: cx, y: cy + (arriba ? -1 : 1) * rueda.tamano / 2 };
        const puntoEtiqueta = { x, y: arriba ? y + pos.alto : y };
        this.renderVisorOverlay.lineStyle(1, 0xb85a24, .8).lineBetween(puntoRueda.x, puntoRueda.y, puntoEtiqueta.x, puntoEtiqueta.y);
        this.etiquetasValvulas[clave] = this.add.text(x + 5, y + 5, '', fuenteInterfaz(11, '#E6E8EA', { fontStyle: 'bold' })).setDepth(5);
      }
      const q = L.cascada.etiquetaQ12;
      this.panel(q, { profundidad: 1, radio: 5 });
      const tuboUnion = L.cascada.unionVidrio;
      this.renderVisorOverlay.lineStyle(1, 0xb85a24, .8).lineBetween(q.x + q.ancho, q.y + q.alto / 2, this.cajaCascada.x + this.cajaCascada.w * tuboUnion.x, q.y + q.alto / 2);
      this.add.text(q.x + 5, q.y + 4, 'q12 = c1·√h1\n(llave abierta)', fuenteInterfaz(10, '#E6E8EA', { fontStyle: 'bold', lineSpacing: 1 })).setDepth(5);
    }
    if (this.nivel.tanques === 2 && !this.esCascada) {
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
    this.panelDepuracion = crearPanelDepuracion(this, {
      intercambiar: contextoJuego.camara?.intercambiar ?? (leerPreferencia('alambique.intercambiarEtiquetas', 'false') === 'true'),
      onIntercambiar: (value) => { guardarPreferencia('alambique.intercambiarEtiquetas', String(value)); if (contextoJuego.camara) contextoJuego.camara.intercambiar = value; },
      alfa: this.gestor.camara.alfa,
      onAlfa: (value) => {
        this.gestor.camara.alfa = value;
        try { localStorage.setItem('alambique.alfa', String(value)); } catch {}
      },
    });
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
      limpiar(() => this.audio?.detenerSonificacion());
      limpiar(() => mostrarVistaCamaraDepuracion(false));
      limpiar(() => { contextoJuego.vistaDepuracionActiva = false; });
      limpiar(() => this.graf?.destruir());
      limpiar(() => this.grafValvulas?.destruir());
      this.barras.forEach((barra) => limpiar(() => barra.destruir()));
      this.paramPanel?.forEach((elemento) => limpiar(() => elemento.destroy()));
      limpiar(() => this.render.destroy());
      limpiar(() => this.renderFijo.destroy());
      limpiar(() => this.renderMarcasFijas.destroy());
      limpiar(() => this.renderTuberias.destroy());
      limpiar(() => this.renderSalidaOculta.destroy());
      limpiar(() => this.renderBridaSalida.destroy());
      limpiar(() => this.renderCanalSalida.destroy());
      limpiar(() => this.renderTuberiaCascada.destroy());
      limpiar(() => this.renderDestello.destroy());
      limpiar(() => this.renderBrilloBanda.destroy());
      limpiar(() => this.renderDesbordeFallback?.destroy());
      this.emisoresEfectos?.forEach((emisor) => limpiar(() => emisor?.destroy()));
      limpiar(() => this.spriteDesborde?.destroy());
      limpiar(() => this.cameras.main.setScroll(this.scrollBase?.x ?? 0, this.scrollBase?.y ?? 0));
      limpiar(() => this.renderIntercambioFijo.destroy());
      limpiar(() => this.renderIntercambioFlujo.destroy());
      limpiar(() => this.renderIntercambioAviso.destroy());
      limpiar(() => this.renderLlaveChorro.destroy());
      limpiar(() => this.renderOverlay.destroy());
      limpiar(() => this.renderEquilibrio.destroy());
      this.etiquetasEscala.forEach((texto) => limpiar(() => texto.destroy()));
    });
    this.gestor.eventos.addEventListener('pausa', () => { this.pausado = !this.pausado; this.pausaPorManos = false; });
      const ayudaLayout = this.nivel.tanques === 2 ? L.ayudaCascada : L.ayudaSimple;
    this.ayuda = this.add.text(ayudaLayout.x, L.ayuda.y, '', fuenteInterfaz(13)).setDepth(5);
    this.ayuda.setWordWrapWidth(ayudaLayout.ancho);
    this.tiempoTexto = this.add.text(L.tiempo.x, L.tiempo.y, '', fuenteInterfaz(14, '#E6E8EA', { fontStyle: 'bold' })).setDepth(5);
    this.relojIcono = this.textures.exists('interfaz') ? this.add.image(L.reloj.x, L.reloj.y, 'interfaz', 6).setDisplaySize(L.reloj.tamano, L.reloj.tamano).setDepth(5) : null;
    this.estadoCamara = this.add.text(L.estadoCamara.x, L.estadoCamara.y, '', fuenteInterfaz(14, '#E6E8EA', { fontStyle: 'bold' })).setOrigin(1, .5).setDepth(5);
    this.mando1Visual = this.actuador1.salida();
    this.mando2Visual = this.actuador2.salida();
    this.barras[0] = dibujarBarraActuador(this, L.barraV1.x, L.barraV1.y, 'v1 entrada', this.actuador1.salida(), this.sistema.x[0], 'm', 'h1', L.barraV1.ancho, this.mando1Visual);
    if (this.nivel.tanques === 2) this.barras[1] = dibujarBarraActuador(this, L.barraV2.x, L.barraV2.y, 'v2 salida', this.actuador2.salida(), this.sistema.x[1], 'm', 'h2', L.barraV2.ancho, this.mando2Visual);
    this.add.text(L.ayudaValvulas.x, L.ayudaValvulas.y, '▲ mano · ■ válvula (tarda 4 s de 0 a 100 %)', fuenteInterfaz(10, '#E6E8EA')).setDepth(5);
    if (this.nivel.id === 3) {
      const ayuda = L.ayudaPellizco;
      this.graficoAyudaPellizco = this.add.graphics().setDepth(7);
      this.textoAyudaPellizco = this.add.text(ayuda.textoX, ayuda.textoY, 'Pellizco izquierdo: abrir = v2 abierta', fuenteInterfaz(11, '#F2E6C9', { fontStyle: 'bold' })).setDepth(7).setVisible(false);
      this.graficoAyudaPellizco.setVisible(false);
    }
    this.botonTerminar = this.boton(L.terminar, 'Terminar', () => {
      console.info('[DIAG] botón Terminar', { terminado: this.terminado, sysIsActive: this.sys.isActive(), tiempoJuego: this.tiempoJuego });
      this.terminar(false);
    }).setDepth(20);
    const controlesIniciales = this.gestor.actualizar(0) ?? {};
    const x0 = [...this.sistema.x], y0 = this.nivel.tanques === 2 ? x0[1] : x0[0];
    const v10 = this.actuador1.salida(), v20 = this.actuador2.salida();
    const ref0 = obtenerReferencia(this.nivel, 0), banda0 = obtenerTolerancia(this.nivel, 0), qd0 = obtenerPerturbacion(this.nivel, 0);
    const muestraInicial = { t: 0, u_crudo: v10, u: v10, x: x0, y: y0, v2: v20, q_d: qd0, h_sp: ref0, referencia: ref0, tolerancia: banda0, banda_inf: ref0 - banda0, banda_sup: ref0 + banda0 };
    this.muestras.push(muestraInicial);
    this.muestrasVista.push(muestraInicial);
    this.registro.filas.push([0, muestraInicial.u_crudo, v10, x0[0], x0[1] ?? '', y0, v20, qd0, ref0]);
    if (!this.esCascada) dibujarTanquesFijos(this.renderFijo, this.renderMarcasFijas, this.renderTuberias, this.nivel.tanques, { conSprites: this.conSprites, conSpritesValvula: this.conSpritesValvula });
    if (!this.esCascada && this.calderoCaja) this.dibujarSalidaFija();
    if (this.esCascada && this.calderoCaja) this.dibujarSalidaCascadaFija();
    // Las perturbaciones se anclan después de crear mesa, equipo, tuberías y caldero.
    try { this.crearVisualPerturbacion(); }
    catch (error) { console.warn('[AVISO JUEGO] No se pudo dibujar la perturbación; la simulación continúa.', error); }
    this.crearRetroalimentacion();
  }

  crearVisualPerturbacion() {
    const programacion = this.nivel?.perturbacion;
    if (!programacion) return;
    if (!this.calderoCaja || !this.anclajeBocaCaldero) {
      console.warn('[AVISO JUEGO] Perturbación omitida: falta la geometría del caldero.');
      return;
    }
    const L = LAYOUT.simulacion;
    if (this.nivel.id === 2) {
      const metadata = this.cache.json.get('llave-consumo-puntos');
      const key = 'llave-consumo-cerrada';
      const texturasLlave = ['cerrada', 'aviso', 'abierta'].every((estado) => this.textures.exists(`llave-consumo-${estado}`));
      if (!metadata?.puntos?.union || !metadata?.puntos?.boca || !texturasLlave) {
        console.warn('[AVISO JUEGO] Perturbación del nivel 2 omitida: falta el sprite o sus puntos de anclaje.');
        return;
      }
      const tank = this.spritesTanques[0] || (() => { const p = posicionSpriteTanque(0, 1); return { x: p.x, y: p.y, displayWidth: p.ancho, displayHeight: p.alto }; })();
      const cfg = L.perturbaciones.llaveConsumo;
      const ancho = cfg.alto * metadata.frameWidth / metadata.frameHeight;
      // El borde del cuerpo a la altura de la unión se midió en el contorno alfa del sprite (fila 150/300: x=23/215).
      const unionX = tank.x - tank.displayWidth / 2 + cfg.bordeIzquierdoRel * tank.displayWidth + cfg.insetUnion;
      const unionY = tank.y - tank.displayHeight / 2 + tank.displayHeight * cfg.alturaUnionRel;
      this.llaveConsumo = this.add.sprite(unionX - (metadata.puntos.union[0] - .5) * ancho, unionY - (metadata.puntos.union[1] - .5) * cfg.alto, key, 0)
        .setDisplaySize(ancho, cfg.alto).setDepth(-.6);
      this.puntoBocaLlave = {
        x: this.llaveConsumo.x + (metadata.puntos.boca[0] - .5) * ancho,
        y: this.llaveConsumo.y + (metadata.puntos.boca[1] - .5) * cfg.alto,
      };
      const etiqueta = L.perturbaciones.llaveEtiqueta;
      this.etiquetaLlave = this.add.text(tank.x - tank.displayWidth / 2 - etiqueta.ancho - 8, this.llaveConsumo.y + cfg.alto / 2 + etiqueta.margenY, '', fuenteInterfaz(9, '#E6E8EA', { fontStyle: 'bold', backgroundColor: 'rgba(28,32,38,.92)', padding: { x: 3, y: 2 }, wordWrap: { width: etiqueta.ancho } })).setDepth(6);
      this.salpiqueLlave = { x: this.puntoBocaLlave.x, y: this.anclajesMesa?.apoyoTanque.y ?? L.mesa.patasY };
      return;
    }
    if (this.nivel.id === 3 && this.cajaCascada) {
      const cuerpo = L.cascada.cuerpoTanques;
      const caja = this.cajaCascada;
      const xInicio = caja.x + cuerpo.x1 * caja.w;
      const intercambio = L.perturbaciones.intercambio;
      const ruedaV2Y = caja.y + L.cascada.ruedas.v2.y * caja.h;
      const yInicio = ruedaV2Y + intercambio.separacionSalidaV2;
      const xEntradaBoca = this.calderoCaja.x + this.calderoCaja.w * intercambio.bocaXRel;
      const yFin = this.calderoCaja.y + intercambio.entradaBocaY;
      if (!(xEntradaBoca > xInicio) || !(yFin > yInicio)) {
        console.warn('[AVISO JUEGO] Intercambio visual omitido: no hay espacio entre el alambique 2 y el caldero.');
        return;
      }
      this.recorridoIntercambio = [{ x: xInicio, y: yInicio }, { x: xEntradaBoca, y: yInicio }, { x: xEntradaBoca, y: yFin }];
      dibujarTuberia(this.renderIntercambioFijo, this.recorridoIntercambio, L.tuberia.ancho);
      const etiqueta = intercambio.etiqueta;
      this.etiquetaIntercambio = this.add.text(etiqueta.x, etiqueta.y, '', fuenteInterfaz(9, '#E6E8EA', { fontStyle: 'bold', backgroundColor: 'rgba(28,32,38,.92)', padding: { x: 3, y: 2 }, wordWrap: { width: etiqueta.ancho } })).setDepth(6);
    }
  }

  actualizarVisualPerturbacion() {
    const p = this.nivel.perturbacion;
    if (!p) return;
    const tiempo = this.tiempoJuego;
    const fase = faseVisualPerturbacion(this.nivel, tiempo);
    if (this.nivel.id === 2 && this.llaveConsumo) {
      const texturas = { cerrada: 'llave-consumo-cerrada', aviso: 'llave-consumo-aviso', abierta: 'llave-consumo-abierta' };
      if (fase !== this.faseLlave) {
        this.faseLlave = fase;
        const textura = texturas[fase];
        this.llaveConsumo.stop();
        if (fase === 'aviso' && this.anims.exists('llave-consumo-aviso')) this.llaveConsumo.play('llave-consumo-aviso');
        else this.llaveConsumo.setTexture(textura, 0);
      }
      const qd = obtenerPerturbacion(this.nivel, tiempo);
      this.etiquetaLlave?.setText(`consumo q_d = ${qd.toFixed(2).replace('.', ',')} m³/s`);
      const cfg = LAYOUT.simulacion.perturbaciones.llaveConsumo;
      this.renderLlaveChorro.clear();
      if (qd > 0) {
        const ancho = Math.max(2, cfg.chorroMaximo * Math.min(1, qd / p.valor));
        const fin = this.salpiqueLlave;
        this.renderLlaveChorro.lineStyle(ancho + 2, 0x168e4d, .45).lineBetween(this.puntoBocaLlave.x, this.puntoBocaLlave.y, fin.x, fin.y);
        this.renderLlaveChorro.lineStyle(ancho, 0x2ecc71, .9).lineBetween(this.puntoBocaLlave.x, this.puntoBocaLlave.y, fin.x, fin.y);
        const r = 2 + 3 * Math.min(1, qd / p.valor);
        this.renderLlaveChorro.fillStyle(0x00e676, .9).fillCircle(fin.x, fin.y, r).fillCircle(fin.x - r, fin.y - 1, r * .65).fillCircle(fin.x + r, fin.y - 2, r * .55);
      }
      return;
    }
    if (this.nivel.id === 3 && this.recorridoIntercambio) {
      const qd = obtenerPerturbacion(this.nivel, tiempo), cfg = LAYOUT.simulacion.perturbaciones.intercambio;
      const amplitud = Math.min(1, Math.abs(qd) / p.amplitud);
      this.renderIntercambioFlujo.clear();
      if (amplitud > 0) {
        const puntos = this.recorridoIntercambio;
        const anchoFlujo = Math.max(1.5, cfg.anchoTubo * .48 * amplitud);
        this.renderIntercambioFlujo.lineStyle(anchoFlujo, 0x2ecc71, .92);
        for (let i = 1; i < puntos.length; i++) this.renderIntercambioFlujo.lineBetween(puntos[i - 1].x, puntos[i - 1].y, puntos[i].x, puntos[i].y);
        const tramos = puntos.slice(1).map((b, i) => ({ a: puntos[i], b, largo: Math.hypot(b.x - puntos[i].x, b.y - puntos[i].y) }));
        const largoTotal = tramos.reduce((suma, tramo) => suma + tramo.largo, 0);
        const puntoEnRecorrido = (distancia) => {
          let d = ((distancia % largoTotal) + largoTotal) % largoTotal;
          if (qd < 0) d = largoTotal - d;
          for (const tramo of tramos) {
            if (d <= tramo.largo) {
              const f = d / tramo.largo;
              return { x: tramo.a.x + (tramo.b.x - tramo.a.x) * f, y: tramo.a.y + (tramo.b.y - tramo.a.y) * f };
            }
            d -= tramo.largo;
          }
          return puntos[0];
        };
        const paso = (tiempo * cfg.velocidad * 30) % largoTotal;
        for (const separacion of [0, largoTotal * .48, largoTotal * .82]) {
          const pulso = puntoEnRecorrido(paso + separacion);
          this.renderIntercambioFlujo.fillStyle(0x00e676, .98).fillCircle(pulso.x, pulso.y, 1 + .6 * amplitud);
        }
        const sentido = qd >= 0 ? 1 : -1;
        const dibujarFlecha = (x, y, horizontal) => {
          const tam = 4, medioAncho = 1.45;
          const vertices = horizontal
            ? (sentido > 0 ? [[x + tam, y], [x - tam, y - medioAncho], [x - tam, y + medioAncho]] : [[x - tam, y], [x + tam, y - medioAncho], [x + tam, y + medioAncho]])
            : (sentido > 0 ? [[x, y + tam], [x - medioAncho, y - tam], [x + medioAncho, y - tam]] : [[x, y - tam], [x - medioAncho, y + tam], [x + medioAncho, y + tam]]);
          this.renderIntercambioFlujo.fillStyle(0x00e676, 1).fillTriangle(...vertices.flat());
        };
        dibujarFlecha((puntos[0].x + puntos[1].x) / 2, puntos[0].y, true);
        dibujarFlecha(puntos[2].x, (puntos[1].y + puntos[2].y) / 2, false);
      }
      this.renderIntercambioAviso.clear();
      if (fase === 'aviso' && Math.floor(performance.now() / 250) % 2 === 0) {
        this.renderIntercambioAviso.lineStyle(cfg.anchoTubo + 3, 0xffb52e, .8);
        for (let i = 1; i < this.recorridoIntercambio.length; i++) this.renderIntercambioAviso.lineBetween(this.recorridoIntercambio[i - 1].x, this.recorridoIntercambio[i - 1].y, this.recorridoIntercambio[i].x, this.recorridoIntercambio[i].y);
      }
      this.etiquetaIntercambio?.setText(`intercambio q_d = ${qd >= 0 ? '+' : ''}${qd.toFixed(3).replace('.', ',')} m³/s`);
    }
  }

  crearRetroalimentacion() {
    try {
      if (!this.textures.exists('fx-particula-grafica')) {
        const circulo = this.make.graphics({ x: 0, y: 0, add: false });
        circulo.fillStyle(0xffffff, 1).fillCircle(8, 8, 7).generateTexture('fx-particula-grafica', 16, 16);
        circulo.destroy();
      }
      const reducido = this.reducirEfectos;
      const crearEmisor = (nombre, maxNormal, opciones) => {
        const clave = `efecto-${nombre}`;
        const textura = this.textures.exists(clave) ? clave : 'fx-particula-grafica';
        if (textura === 'fx-particula-grafica') console.warn(`[AVISO JUEGO] Falta ${clave}; partículas dibujadas con Graphics.`);
        const emisor = this.add.particles(0, 0, textura, { frame: 0, emitting: false, frequency: -1, maxParticles: reducido ? Math.floor(maxNormal / 2) : maxNormal, blendMode: Phaser.BlendModes.ADD, ...opciones });
        emisor.setDepth(5.8);
        this.emisoresEfectos.push(emisor);
        return emisor;
      };
      this.emisoresEfectos = [];
      this.emisorSalpicadura = crearEmisor('salpicadura', 30, { lifespan: 420, speed: { min: 35, max: 130 }, angle: { min: 215, max: 325 }, gravityY: 260, scale: { start: .55, end: .08 }, alpha: { start: .95, end: 0 }, tint: [0x00e676, 0x2ecc71, 0xb5ffd0] });
      this.emisorVapor = crearEmisor('vapor', 20, { lifespan: 900, speed: { min: 12, max: 42 }, angle: { min: 245, max: 295 }, scale: { start: .35, end: .8 }, alpha: { start: .32, end: 0 }, tint: 0xd7f1e4 });
      this.emisorChispa = crearEmisor('chispa', 10, { lifespan: 300, speed: { min: 40, max: 150 }, angle: { min: 200, max: 340 }, gravityY: 90, scale: { start: .65, end: 0 }, alpha: { start: 1, end: 0 }, tint: [0xffd700, 0xfff0a0] });
      this.scrollBase = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY };
      this.ultimoSplashCaldero = 0;
      this.ultimoSplashLlave = 0;
      this.ultimoVapor = 0;
      this.renderDesbordeFallback = this.add.graphics().setDepth(3.9);
    } catch (error) {
      console.warn('[AVISO JUEGO] No se pudieron crear algunos efectos; la partida continúa.', error);
      this.emisoresEfectos ||= [];
    }
  }

  emitirParticulas(emisor, x, y, cantidad = 1) {
    if (!emisor || !Number.isFinite(x) || !Number.isFinite(y)) return;
    try { emisor.emitParticleAt(x, y, cantidad); }
    catch (error) {
      if (!this.avisoErrorEfectos) { this.avisoErrorEfectos = true; console.warn('[AVISO JUEGO] Falló una emisión de partículas; se omite ese efecto.', error); }
    }
  }

  reproducirEfectoSonoro(clave, importante = false, indicador = '') {
    try {
      this.audio?.sonar(clave.replaceAll('-', '_'), 'efectos', { importante });
      if (indicador) this.audio?.indicador(indicador, contextoJuego.indicadoresSonido !== false);
    } catch (error) {
      if (!this.avisoAudioEfectos) { this.avisoAudioEfectos = true; console.warn('[AVISO JUEGO] No se pudo reproducir un efecto sonoro.', error); }
    }
  }

  activarVibracionGamepad() {
    try {
      const pads = navigator.getGamepads?.() || [];
      for (const pad of pads) {
        const actuador = pad?.vibrationActuator || pad?.hapticActuators?.[0];
        if (actuador?.playEffect) {
          const promesa = actuador.playEffect('dual-rumble', { duration: 150, strongMagnitude: .55, weakMagnitude: .35 });
          promesa?.catch?.(() => {});
        }
      }
    } catch (error) { console.warn('[AVISO JUEGO] No se pudo vibrar el gamepad.', error); }
  }

  activarImpacto(tanque = 0) {
    this.flashTanque = tanque;
    if (!this.reducirEfectos) {
      this.destelloHasta = performance.now() + 120;
      this.resorteCamaraX.impulsar(2.2);
      this.resorteCamaraY.impulsar(-1.7);
    }
    this.activarVibracionGamepad();
  }

  mostrarAnimacionDesborde(hs) {
    const tanque = hs.findIndex((h) => h >= 3);
    let x, y;
    if (this.esCascada) {
      const v = this.visoresCascada[tanque === 0 ? 'superior' : 'inferior'];
      x = v.x + v.w / 2;
      y = v.y - 12;
    } else {
      const sprite = this.spritesTanques[tanque] || this.spritesTanques[0];
      if (sprite) { x = sprite.x; y = sprite.y - sprite.displayHeight / 2 + 26; }
      else { const p = posicionSpriteTanque(tanque, this.nivel.tanques); x = p.x; y = p.y - p.alto / 2 + 26; }
    }
    if (this.textures.exists('efecto-desborde') && this.anims.exists('efecto-desborde')) {
      this.spriteDesborde = this.add.sprite(x, y, 'efecto-desborde', 0).setDisplaySize(112, 112).setDepth(3.9).play('efecto-desborde');
      this.spriteDesborde.once('animationcomplete', () => this.spriteDesborde?.destroy());
    } else {
      if (this.renderDesbordeFallback) {
        this.renderDesbordeFallback.clear().fillStyle(0x2ecc71, .88).fillEllipse(x, y + 10, 100, 40).fillCircle(x - 24, y - 7, 13).fillCircle(x + 18, y - 18, 10);
        this.time.delayedCall(240, () => this.renderDesbordeFallback?.clear());
      }
    }
    const base = this.esCascada ? (this.cajaCascada.y + this.cajaCascada.h * LAYOUT.simulacion.cascada.baseTanque2Y) : LAYOUT.simulacion.mesa.patasY - LAYOUT.simulacion.mesa.alto * .72;
    const centro = this.esCascada ? this.cajaCascada.x + this.cajaCascada.w / 2 : (this.spritesTanques[tanque]?.x ?? 330);
    for (const dx of [-36, -14, 14, 36]) this.emitirParticulas(this.emisorSalpicadura, centro + dx, base, this.reducirEfectos ? 2 : 4);
  }

  iniciarEfectoDesborde(hs) {
    if (this.desbordePendiente) return;
    this.desbordePendiente = true;
    const tanque = Math.max(0, hs.findIndex((h) => h >= 3));
    this.activarImpacto(tanque);
    this.mostrarAnimacionDesborde(hs);
    this.reproducirEfectoSonoro('sfx-modelo-desborde', true, 'DESBORDE');
    this.time.delayedCall(180, () => { if (this.sys.isActive() && !this.terminado) this.terminar(true); });
  }

  actualizarOleaje(dt) {
    const actual = { v1: this.actuador1.salida(), v2: this.actuador2.salida() };
    for (const [indice, clave] of ['v1', 'v2'].entries()) {
      const muestras = this.historialActuadores[clave], t = this.tiempoJuego, v = actual[clave];
      muestras.push({ t, v });
      while (muestras.length > 2 && muestras[1].t < t - .5) muestras.shift();
      const diferencia = muestras.length > 1 && muestras[0].t <= t - .45 ? v - muestras[0].v : 0;
      if (Math.abs(diferencia) > .1 && this.oleajeArmado[clave]) {
        this.resortesOleaje[indice].impulsar(Math.sign(diferencia) * Math.min(1.2, Math.abs(diferencia) * 10));
        this.oleajeArmado[clave] = false;
      } else if (Math.abs(diferencia) < .06) this.oleajeArmado[clave] = true;
      this.oleajeActual[indice] = Math.max(-6, Math.min(6, this.resortesOleaje[indice].actualizar(dt) * 28));
    }
  }

  actualizarParticulas() {
    const ahora = performance.now();
    const p = this.sistema.p;
    const qSalida = this.esCascada
      ? p.coeficienteDescarga2 * this.actuador2.salida() * Math.sqrt(Math.max(0, this.sistema.x[1] ?? 0))
      : p.coeficienteDescarga1 * Math.sqrt(Math.max(0, this.sistema.x[0] ?? 0));
    if (qSalida > 0 && this.superficiePocionCaldero && ahora - this.ultimoSplashCaldero > 150) {
      const maximo = (this.esCascada ? p.coeficienteDescarga2 : p.coeficienteDescarga1) * Math.sqrt(3);
      this.emitirParticulas(this.emisorSalpicadura, this.superficiePocionCaldero.x, this.superficiePocionCaldero.y, 1 + Math.round(3 * qSalida / maximo));
      this.ultimoSplashCaldero = ahora;
    }
    const qd = obtenerPerturbacion(this.nivel, this.tiempoJuego);
    if (this.nivel.id === 2 && qd > 0 && this.salpiqueLlave && ahora - this.ultimoSplashLlave > 160) {
      this.emitirParticulas(this.emisorSalpicadura, this.salpiqueLlave.x, this.salpiqueLlave.y, 1 + Math.round(2 * qd / this.nivel.perturbacion.valor));
      this.ultimoSplashLlave = ahora;
    }
    if (this.actuador1.salida() > .5 && ahora - this.ultimoVapor > 180) {
      const punto = this.esCascada
        ? { x: this.cajaCascada.x + this.cajaCascada.w * .5, y: this.cajaCascada.y + this.cajaCascada.h * .10 }
        : { x: this.spritesTanques[0]?.x ?? 330, y: (this.spritesTanques[0]?.y ?? 369) - (this.spritesTanques[0]?.displayHeight ?? 300) / 2 + 8 };
      this.emitirParticulas(this.emisorVapor, punto.x, punto.y, 1);
      this.ultimoVapor = ahora;
    }
  }

  actualizarEfectosDePantalla(dt) {
    const sx = this.resorteCamaraX.actualizar(dt), sy = this.resorteCamaraY.actualizar(dt);
    const camara = this.cameras.main;
    if (this.reducirEfectos) camara.setScroll(this.scrollBase?.x ?? 0, this.scrollBase?.y ?? 0);
    else camara.setScroll((this.scrollBase?.x ?? 0) + sx * 65, (this.scrollBase?.y ?? 0) + sy * 65);
    const ahora = performance.now();
    this.renderDestello.clear();
    if (!this.reducirEfectos && ahora < this.destelloHasta) {
      const sprite = this.esCascada ? this.spriteCascada : this.spritesTanques[this.flashTanque];
      if (sprite) this.renderDestello.fillStyle(0xff1744, .24 * (this.destelloHasta - ahora) / 120).fillEllipse(sprite.x, sprite.y, sprite.displayWidth * 1.08, sprite.displayHeight * .75);
    }
    this.renderBrilloBanda.clear();
    if (ahora < this.brilloBandaHasta) {
      const restante = (this.brilloBandaHasta - ahora) / 500, l = LAYOUT.simulacion;
      const visor = this.esCascada ? this.visoresCascada[this.nivel.tanques === 2 ? 'inferior' : 'superior'] : obtenerVisorTanque(0, 1, this.conSprites);
      if (visor) {
        const y = visor.y ?? visor.top, h = visor.h ?? visor.bottom - visor.top;
        this.renderBrilloBanda.lineStyle(3, 0x00e676, .65 * restante).strokeRoundedRect(visor.x - 3, y - 3, visor.w + 6, h + 6, 4);
      }
      this.renderBrilloBanda.lineStyle(2, 0x00e676, .55 * restante).strokeRoundedRect(l.hmi.x + 3, l.estado.y - 3, l.estado.ancho - 6, l.estado.alto + 6, 8);
    }
  }

  dibujarFijacionesEntrada() {
    const cfg = LAYOUT.simulacion.entradaSolo, tuboY = cfg.ejeTuboY, g = this.renderEntradaFixtures;
    const xBrida = cfg.brida.x, yBrida = tuboY - cfg.brida.alto / 2;
    g.fillStyle(0x4a5056, 1).fillRoundedRect(xBrida, yBrida, cfg.brida.ancho, cfg.brida.alto, 3);
    g.lineStyle(2, 0x1a1b1d, 1).strokeRoundedRect(xBrida, yBrida, cfg.brida.ancho, cfg.brida.alto, 3);
    for (const x of [xBrida + 5, xBrida + cfg.brida.ancho - 5]) {
      for (const y of [yBrida + 6, yBrida + cfg.brida.alto - 6]) {
        g.fillStyle(0x1a1b1d).fillCircle(x, y, 2.7);
        g.fillStyle(0xaeb5b8).fillCircle(x - .5, y - .5, 1.1);
      }
    }
    for (const x of cfg.soportesX) {
      g.lineStyle(4, 0x1a1b1d, 1).lineBetween(x, cfg.barraY, x, tuboY - 2);
      g.lineStyle(2, 0x4a5056, 1).lineBetween(x, cfg.barraY, x, tuboY - 2);
      g.fillStyle(0x1a1b1d).fillRoundedRect(x - 6, tuboY - 5, 12, 6, 2);
      g.fillStyle(0x4a5056).fillRoundedRect(x - 4, tuboY - 4, 8, 4, 1);
    }
  }

  dibujarSalidaFija() {
    const L = LAYOUT.simulacion, caja = posicionSpriteTanque(0, 1), anclaje = L.entradaSolo.salidaAlambique;
    const port = { x: caja.x - caja.ancho / 2 + anclaje.xRel * caja.ancho, y: caja.y - caja.alto / 2 + anclaje.yRel * caja.alto };
    const boca = this.anclajeBocaCaldero, picoY = boca.y - L.caldero.alturaPicoSobreBorde;
    const xBajada = this.anclajesMesa.bordeDerecho, yHorizontalBajo = picoY - L.salidaConsumo.codoAntesPico;
    const finalBoquilla = { x: port.x + anclaje.brida.radio + anclaje.boquillaLongitud, y: port.y };
    this.recorridoSalida = [finalBoquilla, { x: xBajada, y: port.y }, { x: xBajada, y: yHorizontalBajo }, { x: boca.x, y: yHorizontalBajo }, { x: boca.x, y: picoY }];
    dibujarTuberia(this.renderSalidaOculta, [{ x: port.x - anclaje.inicioDentro, y: port.y }, finalBoquilla, ...this.recorridoSalida.slice(1)]);

    const brida = anclaje.brida, g = this.renderBridaSalida;
    dibujarTuberia(g, [{ x: port.x, y: port.y }, finalBoquilla], anclaje.boquillaAncho);
    g.fillStyle(0x1a1b1d, 1).fillCircle(port.x, port.y, brida.radio + brida.anchoBorde);
    g.lineStyle(brida.anchoBorde, 0x1a1b1d, 1).strokeCircle(port.x, port.y, brida.radio);
    g.lineStyle(brida.anchoBorde + 1, 0xb85a24, 1).strokeCircle(port.x, port.y, brida.radio - 1);
    for (const signo of [-1, 1]) for (const direccion of [-1, 1]) {
      const xRemache = port.x + direccion * brida.remacheOffset;
      const yRemache = port.y + signo * brida.remacheOffset;
      g.fillStyle(0x1a1b1d, 1).fillCircle(xRemache, yRemache, brida.remacheRadio + .8);
      g.fillStyle(0xd7a06f, 1).fillCircle(xRemache, yRemache, brida.remacheRadio);
    }
    dibujarTuberia(g, [{ x: port.x - 5, y: port.y }, { x: port.x + 7, y: port.y }], anclaje.boquillaAncho);
    dibujarTuberia(g, [{ x: port.x + 7, y: port.y }, finalBoquilla], anclaje.boquillaAncho);
    this.picoSalida = { x: boca.x, y: picoY };
  }

  actualizarFlujoSalida() {
    if (!this.picoSalida || !this.superficiePocionCaldero) return;
    const p = this.sistema.p;
    const caudal = this.esCascada
      ? p.coeficienteDescarga2 * this.actuador2.salida() * Math.sqrt(Math.max(0, this.sistema.x[1] ?? 0))
      : p.coeficienteDescarga1 * Math.sqrt(Math.max(0, this.sistema.x[0] ?? 0));
    if (!this.esCascada && this.recorridoSalida) dibujarCanalConFlujo(this.renderCanalSalida, this.recorridoSalida, caudal, this.tiempoJuego, LAYOUT.simulacion.entradaSolo.salidaAlambique.canal, LAYOUT.simulacion.tuberia.ancho);
    this.renderChorro.clear();
    if (caudal > 0) {
      const L = LAYOUT.simulacion;
      const coeficiente = this.esCascada ? p.coeficienteDescarga2 : p.coeficienteDescarga1;
      const maxCaudal = coeficiente * Math.sqrt(PARAMETROS_TANQUES.alturaMaxima);
      const grosor = Math.max(L.tuberia.chorroMinimo, Math.min(L.tuberia.chorroMaximo, caudal / maxCaudal * L.tuberia.chorroMaximo));
      this.renderChorro.lineStyle(grosor + 2, 0x168e4d, .48).lineBetween(this.picoSalida.x, this.picoSalida.y + 1, this.superficiePocionCaldero.x, this.superficiePocionCaldero.y);
      this.renderChorro.lineStyle(grosor, 0x2ecc71, .85).lineBetween(this.picoSalida.x, this.picoSalida.y + 1, this.superficiePocionCaldero.x, this.superficiePocionCaldero.y);
    }
  }

  dibujarSalidaCascadaFija() {
    const x = this.anclajeBocaCaldero.x, y = this.anclajeBocaCaldero.y - LAYOUT.simulacion.caldero.alturaPicoSobreBorde;
    dibujarTuberia(this.renderTuberiaCascada, [this.picoSalida, { x, y }]);
    this.picoSalida = { x, y };
  }

  update(time, deltaMs) {
    try {
      if (Number.isFinite(deltaMs) && deltaMs > 0) {
        this.tiemposCuadro.push(deltaMs);
        if (this.tiemposCuadro.length > 60) this.tiemposCuadro.shift();
        this.tiempoMedioCuadroMs = this.tiemposCuadro.reduce((suma, valor) => suma + valor, 0) / this.tiemposCuadro.length;
      }
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
    this.audio?.actualizarDesbloqueo();
    if (c?.der?.presente || c?.izq?.presente) this.audio?.desbloquear();
    if (camara?.activo && this.gestor.fuente === 'camara') {
      const hayManos = Boolean(c?.der?.presente || c?.izq?.presente);
      if (hayManos) { this.noManosDesde = null; if (this.pausaPorManos) { this.pausado = false; this.pausaPorManos = false; } }
      else { this.noManosDesde ??= performance.now(); if (performance.now() - this.noManosDesde > 3000) { this.pausado = true; this.pausaPorManos = true; } }
    }
    if (!this.pausado && !this.desbordePendiente) {
      const conservaAusente = this.gestor.fuente === 'camara';
      const mando1 = leerSenalSiPresente(c, MAPA_CONTROL.v1, null, this.actuador1.salida(), conservaAusente);
      const crudo = leerSenalSiPresente(c, MAPA_CONTROL.v1, 'u_crudo', mando1, conservaAusente);
      const mando2 = this.nivel.tanques === 2
        ? leerSenalSiPresente(c, MAPA_CONTROL.v2, null, this.actuador2.salida(), conservaAusente)
        : 1;
      this.mando1Visual = mando1;
      this.mando2Visual = mando2;
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
      this.actualizarEventosAudio(hs, qd, referenciaActual);
      const desborde = hs.some((h) => h >= PARAMETROS_TANQUES.alturaMaxima);
      if (desborde) { this.iniciarEfectoDesborde(hs); return; }
      if (this.tiempoJuego >= this.nivel.duracion) { this.terminar(false); return; }
      if (!this.modoVerificacionEscalon && this.nivel.criterio.tipo === 'consecutivo' && this.tiempoEnBandaSeguido >= this.nivel.criterio.segundos) { this.terminar(false); return; }
    }
    this.actualizarOleaje(dt);
    this.actualizarBarrasEnVivo();
    this.actualizarElementosVivos();
    this.actualizarAyudaPellizco(c);
    this.actualizarFlujoSalida();
    this.actualizarParticulas();
    this.actualizarEfectosDePantalla(dt);
    const nivelSonoro = this.nivel.tanques === 2 ? (this.sistema.x[1] ?? 0) : (this.sistema.x[0] ?? 0);
    this.audio?.actualizarSonificacion(nivelSonoro, .4 * this.actuador1.salida(), this.pausado || this.terminado || this.desbordePendiente);
    try { this.actualizarVisualPerturbacion(); }
    catch (error) {
      if (!this.avisoErrorPerturbacion) {
        this.avisoErrorPerturbacion = true;
        console.warn('[AVISO JUEGO] Se desactivó el dibujo de la perturbación; el simulador continúa.', error);
      }
      this.llaveConsumo?.setVisible(false);
      this.renderLlaveChorro?.clear();
      this.renderIntercambioFlujo?.clear();
      this.renderIntercambioAviso?.clear();
    }
    if (this.debug !== this.debugVisibleAnterior) {
      contextoJuego.vistaDepuracionActiva = this.debug;
      mostrarVistaCamaraDepuracion(this.debug);
      this.panelDepuracion.setVisible(this.debug);
      this.debugVisibleAnterior = this.debug;
    }
    const selectPressed = this.gestor.selectPulsado();
    if (selectPressed) { this.selectStart ??= performance.now(); if (!this.selectWasLong && performance.now() - this.selectStart >= 700) { this.debug = !this.debug; this.selectWasLong = true; } }
    else { this.selectStart = null; this.selectWasLong = false; }
    const ahoraHmi = performance.now();
    if (ahoraHmi - this.ultimoHmi >= 100) { this.actualizarHmi(camara, ahoraHmi); this.ultimoHmi = ahoraHmi; }
    if (this.debug && ahoraHmi - this.ultimoDebug >= 200) {
      const dep = this.gestor.camara.depuracion();
      const fpsJuego = this.game.loop.actualFps || (dt > 0 ? 1 / dt : 0);
      const alertaFPS = camara?.activo && camara.fps < 15 ? ' · detección lenta: más luz, cerrar pestañas o bajar resolución' : '';
      this.panelDepuracion.actualizar({ fps: camara?.fps, fpsCamara: camara?.fpsCamara, fpsJuego, tiempoDeteccionMs: camara?.promedioDeteccionMs, tiempoCuadroMs: this.tiempoMedioCuadroMs, delegado: camara?.delegado, resolucion: camara?.obtenerResolucion?.(), avisoResolucion: camara?.avisoResolucion, alertaFPS, alfa: dep.alfa, Ts: dep.Ts, tau: dep.tau, controles: c, x: this.sistema.x, canales: dep.canales });
      this.ultimoDebug = ahoraHmi;
    }
  }

  actualizarBarrasEnVivo() {
    const hs = this.sistema.x;
    this.barras[0]?.actualizar(this.actuador1.salida(), hs[0], this.mando1Visual);
    this.barras[1]?.actualizar(this.actuador2.salida(), hs[1] ?? 0, this.mando2Visual);
  }

  actualizarElementosVivos() {
    const hs = this.sistema.x;
    const L = LAYOUT.simulacion;
    const variableControlada = this.nivel.tanques === 2 ? hs[1] : hs[0];
    const referencia = obtenerReferencia(this.nivel, this.tiempoJuego), banda = obtenerTolerancia(this.nivel, this.tiempoJuego);
    const dentroBanda = Math.abs(variableControlada - referencia) <= banda;
    if (dentroBanda && !this.dentroBandaAnterior) {
      this.brilloBandaHasta = performance.now() + 500;
      this.reproducirEfectoSonoro('sfx-modelo-en-banda');
      this.audio?.indicador('EN BANDA', contextoJuego.indicadoresSonido !== false);
    } else if (!dentroBanda && this.dentroBandaAnterior) {
      this.reproducirEfectoSonoro('sfx-modelo-fuera-banda');
    }
    this.dentroBandaAnterior = dentroBanda;
    if (this.esCascada) {
      dibujarLiquidosCascada(this.renderVisorLiquido, this.visoresCascada, hs, referencia, banda, dentroBanda, this.oleajeActual);
      this.renderTuberiasExtra.clear();
      const q12 = this.sistema.p.coeficienteDescarga1 * Math.sqrt(Math.max(0, hs[0] ?? 0));
      if (q12 > 0) {
        const v = L.cascada.unionVidrio, m = v.margenInterior;
        const alpha = Math.min(.9, q12 / (this.sistema.p.coeficienteDescarga1 * Math.sqrt(PARAMETROS_TANQUES.alturaMaxima)));
        this.renderTuberiasExtra.fillStyle(0x00e676, alpha).fillRect(this.cajaCascada.x + v.x * this.cajaCascada.w + m, this.cajaCascada.y + v.y * this.cajaCascada.h + m, v.ancho * this.cajaCascada.w - m * 2, v.alto * this.cajaCascada.h - m * 2);
      }
    } else dibujarNivelesTanques(this.render, this.renderOverlay, hs, this.nivel.tanques, {
      tanqueControlado: this.nivel.tanques === 2 ? 1 : 0, referencia, tolerancia: banda, dentroBanda, conSprites: this.conSprites, oleaje: this.oleajeActual,
    });
    const alturaEtiqueta = this.nivel.tanques === 2 ? 'h2' : 'h1';
    this.refTexto.setText(this.nivel.tanques === 2
      ? `${alturaEtiqueta} ${variableControlada.toFixed(2)} m · ref ${referencia.toFixed(2)} ±${banda.toFixed(2)} m · qd ${obtenerPerturbacion(this.nivel, this.tiempoJuego).toFixed(2)}`
      : `${alturaEtiqueta} ${variableControlada.toFixed(2)} m · referencia ${referencia.toFixed(2)} ±${banda.toFixed(2)} m · qd ${obtenerPerturbacion(this.nivel, this.tiempoJuego).toFixed(3)} m³/s`);
    this.alarmasActivas = hs.map((h, i) => h >= 2.8 ? `HH${i + 1}` : h >= 2.4 ? `H${i + 1}` : '').filter(Boolean);
    this.alarmText.setText(this.alarmasActivas.length ? `ALARMA ${this.alarmasActivas.join(' · ')}` : '');
    this.alarmText.setColor(this.alarmasActivas.some((a) => a.startsWith('HH')) ? '#FF1744' : '#FFD700');
    hs.forEach((h, i) => this.children.getByName(`etiqueta-tanque-${i}`)?.setText(`Alambique ${i + 1} · h${i + 1} ${h.toFixed(2)} m`));
    (this.runasAlarmas || []).forEach((runa, i) => {
      const h = hs[i] ?? 0;
      const color = h >= 2.8 ? 0xff1744 : h >= 2.4 ? 0xffd700 : 0x70777a;
      runa.setTint(color).setAlpha(h >= 2.4 ? 1 : .8);
    });
    for (const valve of this.spritesValvulas || []) valve.volante.setRotation((valve.clave === 'v1' ? this.actuador1.salida() : this.actuador2.salida()) * Math.PI * 1.5);
    this.etiquetasValvulas?.v1?.setText(`v1 ${Math.round(this.actuador1.salida() * 100)} %`);
    this.etiquetasValvulas?.v2?.setText(`v2 ${Math.round(this.actuador2.salida() * 100)} %`);
    this.dibujarMarcasEquilibrio();
  }

  dibujarMarcasEquilibrio() {
    if (!this.renderEquilibrio || !this.etiquetasEquilibrio) return;
    const p = this.sistema.p, qd = obtenerPerturbacion(this.nivel, this.tiempoJuego);
    const v1 = this.actuador1.salida(), h1 = Math.max(0, this.sistema.x[0] ?? 0);
    const qd1 = this.nivel.tanques === 1 ? qd : 0;
    const alturas = [Math.max(0, Math.min(3, ((p.caudalEntradaMaximo * v1 - qd1) / p.coeficienteDescarga1) ** 2))];
    if (this.nivel.tanques === 2) {
      const v2 = this.actuador2.salida();
      alturas.push(v2 <= 0 ? 3 : Math.max(0, Math.min(3, ((p.coeficienteDescarga1 * Math.sqrt(h1) - qd) / (p.coeficienteDescarga2 * v2)) ** 2)));
    }
    this.renderEquilibrio.clear();
    const L = LAYOUT.simulacion, dash = L.equilibrio.dash, espacio = L.equilibrio.espacio;
    alturas.forEach((altura, indice) => {
      const visor = this.esCascada
        ? this.visoresCascada[indice === 0 ? 'superior' : 'inferior']
        : obtenerVisorTanque(indice, this.nivel.tanques, this.conSprites);
      const arriba = visor.top ?? visor.y, abajo = visor.bottom ?? visor.y + visor.h;
      const y = abajo - (abajo - arriba) * altura / 3;
      const izquierda = visor.x + 1, derecha = visor.x + visor.w - 1;
      this.renderEquilibrio.lineStyle(1.5, 0xffffff, .95);
      for (let x = izquierda; x < derecha; x += dash + espacio) this.renderEquilibrio.lineBetween(x, y, Math.min(derecha, x + dash), y);
      const etiqueta = this.etiquetasEquilibrio[indice];
      etiqueta?.setY(y - L.equilibrio.etiquetaAlto / 2).setVisible(true);
    });
  }

  actualizarAyudaPellizco(controles) {
    if (!this.graficoAyudaPellizco || !this.textoAyudaPellizco) return;
    const presente = Boolean(controles?.izq?.presente);
    if (presente && !this.izquierdaPresenteAnterior) this.ayudaPellizcoHasta = Math.max(this.ayudaPellizcoHasta, this.tiempoJuego + 3);
    this.izquierdaPresenteAnterior = presente;
    const visible = this.tiempoJuego <= 8 || this.tiempoJuego < this.ayudaPellizcoHasta;
    this.graficoAyudaPellizco.setVisible(visible);
    this.textoAyudaPellizco.setVisible(visible);
    if (!visible) return;
    const { iconoX: x, iconoY: y } = LAYOUT.simulacion.ayudaPellizco;
    const fase = (performance.now() / 1000 * Math.PI * 2) % (Math.PI * 2);
    const apertura = (1 - Math.cos(fase)) / 2;
    const g = this.graficoAyudaPellizco;
    g.clear();
    g.lineStyle(3, 0xe6e8ea, 1);
    g.lineBetween(x + 3, y + 17, x + 11, y + 13);
    g.lineBetween(x + 11, y + 13, x + 11 + apertura * 8, y + 5);
    g.lineBetween(x + 22, y + 17, x + 15 - apertura * 5, y + 13);
    g.lineBetween(x + 15 - apertura * 5, y + 13, x + 15 - apertura * 5, y + 3);
    g.lineStyle(1, 0xb85a24, .95);
    g.lineBetween(x + 5, y + 20, x + 20, y + 20);
    g.fillStyle(0xb85a24, 1).fillCircle(x + 11 + apertura * 8, y + 5, 2.3).fillCircle(x + 15 - apertura * 5, y + 3, 2.3);
  }

  actualizarHmi(camara) {
    const L = LAYOUT.simulacion;
    this.pausaTexto.setText(this.pausado ? (this.pausaPorManos ? 'Muestra las manos' : 'PAUSA · Enter para reanudar') : '');
    this.pausaTexto.setVisible(this.pausado);
    this.pausaPanel.setVisible(this.pausado);
    const alarmasActivas = this.alarmasActivas || [];
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
    const marcadoresTiempo = instantesInicioPerturbacion(this.nivel).filter((t) => t <= this.tiempoJuego);
    const opcionesNiveles = { ...L.tendenciaNiveles, muestras: this.muestrasVista, min: 0, max: 3, unidad: 'm', titulo: 'Niveles y banda', clave: 'y', series: [...seriesAltura, { clave: 'h_sp', nombre: 'referencia', color: 0xc9a227 }], bandaInferiorClave: 'banda_inf', bandaSuperiorClave: 'banda_sup', alarma: alarmasActivas.length > 0, ejeTiempo: true, marcadoresTiempo };
    const opcionesValvulas = { ...L.tendenciaValvulas, muestras: this.muestrasVista, min: 0, max: 1, unidad: '', titulo: 'Válvulas v1 / v2', tituloEjeY: 'apertura', formatoTickY: (v) => Number(v.toFixed(2)).toString(), ejeTiempo: true, marcadoresTiempo, series: [{ clave: 'u', nombre: 'v1', color: 0xe6e8ea }, ...(this.nivel.tanques === 2 ? [{ clave: 'v2', nombre: 'v2', color: 0x2ecc71 }] : [])] };
    if (!this.graf) this.graf = dibujarTendencia(this, opcionesNiveles); else this.graf.actualizar(opcionesNiveles);
    if (!this.grafValvulas) this.grafValvulas = dibujarTendencia(this, opcionesValvulas); else this.grafValvulas.actualizar(opcionesValvulas);
  }

  actualizarEtiquetaParametros() {
    if (!this.parametrosEstado) return;
    const p = this.parametrosEnUso, cambios = [];
    if (p.area !== PARAMETROS_NOMINALES.area) cambios.push(`A ${decimalParametro(p.area)} m²`);
    if (p.coeficienteDescarga1 !== PARAMETROS_NOMINALES.coeficienteDescarga1) cambios.push(`c1 ${decimalParametro(p.coeficienteDescarga1)} m²·⁵/s`);
    if (p.coeficienteDescarga2 !== PARAMETROS_NOMINALES.coeficienteDescarga2) cambios.push(`c2 ${decimalParametro(p.coeficienteDescarga2)} m²·⁵/s`);
    this.parametrosEstado.setText(cambios.length ? `Parámetros modificados: ${cambios.join(' · ')}` : '').setVisible(cambios.length > 0);
  }

  registrarAlarmas(hs) {
    hs.forEach((h, i) => {
      const estado = h >= 2.8 ? 'HH' : h >= 2.4 ? 'H' : null;
      if (estado && this.ultimaAlarma[i] !== estado) this.alarmas.push({ t: this.tiempoJuego, tanque: i + 1, tipo: estado, altura: h });
      if (estado === 'HH' && this.ultimaAlarma[i] !== 'HH') {
        this.activarImpacto(i);
        const placa = this.runasAlarmas?.[i];
        if (placa) this.emitirParticulas(this.emisorChispa, placa.x, placa.y, this.reducirEfectos ? 2 : 4);
      }
      this.ultimaAlarma[i] = estado;
    });
  }

  actualizarEventosAudio(hs, qd, referencia) {
    const importante = contextoJuego.indicadoresSonido !== false;
    for (const [i, h] of hs.entries()) {
      const previo = this.audioAlarma[i] || { H: false, HH: false };
      const hh = previo.HH ? h >= 2.7 : h >= 2.8;
      const alta = previo.H ? h >= 2.3 : h >= 2.4;
      if (hh && !previo.HH) { this.reproducirEfectoSonoro('sfx-alarma-hh', true, `HH${i + 1}`); }
      else if (alta && !previo.H) this.reproducirEfectoSonoro('sfx-alarma-h', true, `H${i + 1}`);
      else if (!alta && previo.H) {
        this.audio?.sonar('sfx_alarma_h', 'efectos', { importante: true });
        this.audio?.indicador(`H${i + 1} despejada`, importante);
      }
      if (!hh && previo.HH) {
        this.audio?.sonar('sfx_alarma_hh', 'efectos', { importante: true });
        this.audio?.indicador(`HH${i + 1} despejada`, importante);
      }
      this.audioAlarma[i] = { H: alta, HH: hh };
    }
    if (this.audioReferencia === null) this.audioReferencia = referencia;
    else if (Math.abs(referencia - this.audioReferencia) > 1e-6) {
      this.reproducirEfectoSonoro('sfx-modelo-cambio-referencia', false, 'REFERENCIA');
      this.audioReferencia = referencia;
    }
    const fase = this.nivel.perturbacion ? faseVisualPerturbacion(this.nivel, this.tiempoJuego) : 'cerrada';
    if (this.audioFasePerturbacion !== fase) {
      if (fase === 'aviso') this.reproducirEfectoSonoro('sfx-perturbacion-aviso', false, 'AVISO DE CONSUMO');
      if (fase === 'abierta') {
        this.reproducirEfectoSonoro('sfx-perturbacion-inicio', false, 'CONSUMO ACTIVO');
        this.audio?.setMusic('musica_perturbacion');
      }
      if (this.audioFasePerturbacion === 'abierta' && fase !== 'abierta') {
        this.reproducirEfectoSonoro('sfx-perturbacion-fin');
        this.audio?.setMusic('musica_operacion');
      }
      this.audioFasePerturbacion = fase;
    }
    const valores = { v1: this.actuador1.salida(), v2: this.actuador2.salida() };
    for (const [clave, valor] of Object.entries(valores)) {
      if (clave === 'v2' && this.nivel.tanques < 2) continue;
      const anterior = this.audioUltimoMando[clave] ?? valor;
      if (Math.abs(valor - anterior) > .1) {
        this.audio?.sonar('sfx_actuador_mover');
        this.audioUltimoMando[clave] = valor;
      }
      const tope = valor <= .001 ? 0 : valor >= .999 ? 1 : null;
      if (tope !== null && this.audioUltimoTope[clave] !== tope) this.audio?.sonar('sfx_actuador_tope');
      this.audioUltimoTope[clave] = tope;
    }
  }

  toggleParametros() {
    if (this.paramPanel) { this.destruirPanelParametros(); return; }
    this.dibujarPanelParametros();
  }

  destruirPanelParametros() {
    this.paramPanel?.forEach((elemento) => elemento.destroy());
    this.paramPanel = null;
  }

  dibujarPanelParametros() {
    const ui = LAYOUT.simulacion.parametros, p = this.sistema.p;
    this.paramPanel = [];
    const agregar = (elemento) => { this.paramPanel.push(elemento); return elemento; };
    agregar(this.panel(ui.panel, { profundidad: 8 }));
    const h0 = this.nivel.tanques === 2 ? this.sistema.x[1] : this.sistema.x[0];
    const tau = constanteTiempoTanque(h0, p.area, this.nivel.tanques === 2 ? p.coeficienteDescarga2 : p.coeficienteDescarga1);
    const K = gananciaTanque(h0, this.nivel.tanques === 2 ? p.coeficienteDescarga2 : p.coeficienteDescarga1);
    agregar(this.add.text(ui.texto.x, ui.texto.y, `Linealización local del tanque ${this.nivel.tanques === 2 ? 2 : 1}\nA·dh/dt = qin − c√h\nh₀ = ${h0.toFixed(3)} m · τ = 2A√h₀/c = ${tau.toFixed(3)} s\nK = 2√h₀/c = ${K.toFixed(3)} · d(qsalida)/dh`, fuenteInterfaz(16, '#E6E8EA', { lineSpacing: 4 })).setDepth(9));
    const filas = [
      { clave: 'area', etiqueta: 'Área del tanque A (m²)', valores: OPCIONES_PARAMETROS.area },
      { clave: 'coeficienteDescarga1', etiqueta: 'Descarga c1 (m²·⁵/s)', valores: OPCIONES_PARAMETROS.coeficienteDescarga1 },
      ...(this.nivel.id === 3 ? [{ clave: 'coeficienteDescarga2', etiqueta: 'Descarga c2 (m²·⁵/s)', valores: OPCIONES_PARAMETROS.coeficienteDescarga2 }] : []),
    ];
    for (const { clave, etiqueta, valores } of filas) {
      const y = ui.filas[clave];
      agregar(this.add.text(ui.etiquetaX, y + 8, etiqueta, fuenteInterfaz(13, '#E6E8EA')).setDepth(9));
      valores.forEach((valor, indice) => {
        const seleccionado = this.parametrosEdicion[clave] === valor;
        const texto = `${seleccionado ? '✓ ' : ''}${decimalParametro(valor)}`;
        const rect = { x: ui.opcionesX + indice * (ui.opcionAncho + ui.opcionGap), y, ancho: ui.opcionAncho, alto: ui.opcionAlto };
        agregar(this.boton(rect, texto, () => {
          this.parametrosEdicion[clave] = valor;
          guardarParametrosGuardados(this.parametrosEdicion);
          this.destruirPanelParametros();
          this.dibujarPanelParametros();
        }, { tamano: 12, fondo: seleccionado ? 0x8c4a26 : 0x3a3d40 })).setDepth(10);
      });
    }
    agregar(this.boton(ui.aplicar, 'Aplicar y reiniciar', () => {
      guardarParametrosGuardados(this.parametrosEdicion);
      this.scene.restart();
    }, { tamano: 14 })).setDepth(10);
    agregar(this.boton(ui.nominales, 'Valores nominales', () => {
      this.parametrosEdicion = { ...PARAMETROS_NOMINALES };
      guardarParametrosGuardados(this.parametrosEdicion);
      this.scene.restart();
    }, { tamano: 14, fondo: 0x3a3d40 })).setDepth(10);
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
    const datosFin = { nivel: this.nivel, muestras: this.muestras, registro: this.registro, alarmas: this.alarmas, desborde, resultado, parametros: { ...this.sistema.p }, modoVerificacionEscalon: this.modoVerificacionEscalon, tauTeorico: constanteTiempoTanque(this.nivel.referencia), KTeorica: gananciaTanque(this.nivel.referencia) };
    this.audio?.detenerSonificacion();
    console.info('terminar: cambio de escena');
    this.scene.start('Fin', datosFin);
    setTimeout(() => {
      console.info('[DIAG] escenas activas', this.game.scene.getScenes(true).map((escena) => escena.scene.key));
    }, 1000);
  }
}
