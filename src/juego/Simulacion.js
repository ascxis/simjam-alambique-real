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
import { dibujarTanquesFijos, dibujarNivelesTanques, dibujarTuberia, dibujarLiquidosCascada, obtenerVisorTanque, posicionSpriteTanque, posicionSpritesValvulas } from '../hmi/tanques.js';
import { MAPA_CONTROL, leerSenalSiPresente } from './mapaControl.js';
import { Equipo } from './entidades/Equipo.js';
import { LAYOUT } from '../hmi/layout.js';
import { fuenteInterfaz, fuenteTitulo } from '../hmi/estilo.js';
import { dibujarProgreso } from '../hmi/actuadores.js';

function puntoMetadataSprite(sprite, punto) {
  if (!sprite || !punto) return null;
  const [x, y] = punto;
  return { x: sprite.x + (x - sprite.originX) * sprite.displayWidth, y: sprite.y + (y - sprite.originY) * sprite.displayHeight };
}
function rectMetadataSprite(sprite, rect) {
  if (!sprite || !rect) return null;
  return {
    x: sprite.x + (rect.x - sprite.originX) * sprite.displayWidth,
    y: sprite.y + (rect.y - sprite.originY) * sprite.displayHeight,
    w: rect.w * sprite.displayWidth, h: rect.h * sprite.displayHeight,
  };
}
function dibujarCanalConFlujo(g, puntos, caudal, tiempo, config, anchoTubo, limpiar = true) {
  if (limpiar) g.clear();
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
    this.parametrosEstado = this.add.text(L.parametrosEstado.x, L.parametrosEstado.y, '', fuenteInterfaz(12, '#E6E8EA')).setDepth(5);
    this.actualizarEtiquetaParametros();
    this.panel(L.hmi, { profundidad: -5 });
    this.panel(L.footer, { profundidad: -5 });
    this.hmiX = L.hmiInterior.x;
    this.hmiAncho = L.hmiInterior.ancho;
    const metadataCascada = this.cache.json.get('alambique-cascada-meta');
    const metadataSimple = this.cache.json.get('alambique-simple-meta');
    this.esCascada = this.nivel.tanques === 2 && this.textures.exists('alambique-cascada-reposo') && Boolean(metadataCascada?.puntos?.entrada && metadataCascada?.puntos?.salida && metadataCascada?.puntos?.base && metadataCascada?.puntos?.visor1 && metadataCascada?.puntos?.visor2 && metadataCascada?.puntos?.q12);
    this.render = this.add.graphics().setDepth(1.5);
    this.renderFijo = this.add.graphics().setDepth(-1.1);
    this.renderMarcasFijas = this.add.graphics().setDepth(2);
    this.renderTuberias = this.add.graphics().setDepth(-.55);
    this.renderSalidaOculta = this.add.graphics().setDepth(.15);
    this.renderBridaSalida = this.add.graphics().setDepth(.3);
    this.renderCanalSalida = this.add.graphics().setDepth(.35);
    this.renderTuberiasExtra = this.add.graphics().setDepth(0);
    this.renderAnclajesDebug = this.add.graphics().setDepth(7);
    this.renderChorroEntrada = this.add.graphics().setDepth(-.54);
    this.renderTuberiaCascada = this.add.graphics().setDepth(-.55);
    this.renderEntradaFixtures = this.add.graphics().setDepth(-.4);
    this.renderVisorLiquido = this.add.graphics().setDepth(1.5);
    this.renderVisorOverlay = this.add.graphics().setDepth(2);
    this.renderEscalaVisores = this.add.graphics().setDepth(2.1);
    this.renderMarcasRegla = this.add.graphics().setDepth(2.3);
    this.renderEquilibrio = this.add.graphics().setDepth(2.5);
    this.renderChorro = this.add.graphics().setDepth(4);
    this.conSprites = this.textures.exists('alambique-simple-reposo') && Boolean(metadataSimple?.puntos?.entrada && metadataSimple?.puntos?.salida && metadataSimple?.puntos?.base && metadataSimple?.puntos?.visor1);
    this.spritesTanques = [];
    this.equiposTanques = [];
    this.visoresSimples = [];
    this.cajasTanquesSprite = [];
    this.anclajesMedidosTanques = [];
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
      const cfg = L.cascada;
      this.metadataEquipo = this.cache.json.get('alambique-cascada-meta');
      this.puntosEquipo = this.metadataEquipo?.puntos;
      const frameWidth = this.metadataEquipo.frameWidth, frameHeight = this.metadataEquipo.frameHeight;
      const mesa = L.mesa, surfaceY = this.anclajesMesa?.apoyoTanque.y ?? (mesa.patasY - mesa.alto * (1 - mesa.puntoApoyoTanque.yRel));
      const base = this.puntosEquipo.base, salida = this.puntosEquipo.salida;
      const alturaDisponible = surfaceY - cfg.topMinimo;
      const alto = Math.min(alturaDisponible, alturaDisponible / base[1]);
      const ancho = alto * frameWidth / frameHeight;
      const bordeMesa = this.anclajesMesa?.bordeDerecho ?? (mesa.centroX + mesa.ancho / 2);
      const referencia = cfg.referencia;
      const anchoReferencia = alto * referencia.ancho / referencia.alto;
      const izquierdaReferencia = bordeMesa + cfg.salidaFueraMesa - referencia.salidaX * anchoReferencia;
      const centroCuerpoReferencia = izquierdaReferencia + (referencia.cuerpoX0 + referencia.cuerpoX1) / 2 * anchoReferencia;
      const izquierda = centroCuerpoReferencia - base[0] * ancho;
      const arriba = surfaceY - base[1] * alto;
      this.cajaCascada = { x: izquierda, y: arriba, w: ancho, h: alto };
      const x = izquierda + base[0] * ancho;
      const anchoBase = ancho * .72;
      const centroBase = izquierda + base[0] * ancho;
      const sombra = this.add.graphics().setDepth(-.8);
      for (const [anchoSombra, alpha] of [[anchoBase + 38, .08], [anchoBase + 20, .13], [anchoBase + 5, .18]]) sombra.fillStyle(0x111315, alpha).fillEllipse(centroBase, surfaceY + 4, anchoSombra, 16);
      const texturaCascada = 'alambique-cascada-reposo';
      this.spriteCascada = this.add.sprite(x, surfaceY, texturaCascada, 0).setOrigin(base[0], base[1]).setDisplaySize(ancho, alto).setDepth(-.5);
      const visorSuperior = rectMetadataSprite(this.spriteCascada, this.puntosEquipo?.visor1);
      const visorInferior = rectMetadataSprite(this.spriteCascada, this.puntosEquipo?.visor2);
      this.visoresCascada = { superior: visorSuperior, inferior: visorInferior };
      this.anclajeQ12Medido = rectMetadataSprite(this.spriteCascada, this.puntosEquipo?.q12);
      const entrada = puntoMetadataSprite(this.spriteCascada, this.puntosEquipo?.entrada);
      const salidaWorld = puntoMetadataSprite(this.spriteCascada, this.puntosEquipo?.salida);
      const baseWorld = puntoMetadataSprite(this.spriteCascada, base);
      this.anclajesMedidosTanques = [
        { entrada, salida: null, base: null, visor: visorSuperior },
        { entrada: null, salida: salidaWorld, base: baseWorld, visor: visorInferior },
      ];
      this.equipoCascada = new Equipo(this, this.spriteCascada, { familia: 'alambique-cascada' });
      this.mascaraGeometricaVisores = this.make.graphics({ x: 0, y: 0, add: false });
      this.mascaraGeometricaVisores.fillStyle(0xffffff, 1);
      for (const v of Object.values(this.visoresCascada)) this.mascaraGeometricaVisores.fillRect(v.x, v.y, v.w, v.h);
      this.mascaraVisores = this.mascaraGeometricaVisores.createGeometryMask();
      this.renderVisorLiquido.setMask(this.mascaraVisores);
      this.renderEquilibrio.setMask(this.mascaraVisores);
    } else {
      this.metadataEquipo = this.cache.json.get('alambique-simple-meta');
      this.puntosEquipo = this.metadataEquipo?.puntos;
      for (let i = 0; i < this.nivel.tanques; i++) {
        const p = posicionSpriteTanque(i, this.nivel.tanques);
        let tanqueSprite = null;
        if (this.conSprites) {
          const base = this.puntosEquipo.base;
          const entrada = this.puntosEquipo.entrada;
          const frameWidth = this.metadataEquipo.frameWidth, frameHeight = this.metadataEquipo.frameHeight;
          const alto = p.alto / (base[1] - entrada[1]), ancho = alto * frameWidth / frameHeight;
          const izquierda = p.x - ancho / 2, baseY = p.y + p.alto / 2;
          tanqueSprite = this.add.sprite(izquierda + base[0] * ancho, baseY, 'alambique-simple-reposo', 0)
            .setOrigin(base[0], base[1]).setDisplaySize(ancho, alto).setDepth(-.5);
          this.cajasTanquesSprite.push({ x: izquierda, y: baseY - base[1] * alto, w: ancho, h: alto });
          this.spritesTanques.push(tanqueSprite);
        } else this.cajasTanquesSprite.push(null);
        const meta = this.puntosEquipo?.visor1 || null;
        this.visoresSimples.push(meta || null);
        if (tanqueSprite) this.anclajesMedidosTanques.push({
          entrada: puntoMetadataSprite(tanqueSprite, this.puntosEquipo?.entrada),
          salida: puntoMetadataSprite(tanqueSprite, this.puntosEquipo?.salida),
          base: puntoMetadataSprite(tanqueSprite, this.puntosEquipo?.base),
          visor: rectMetadataSprite(tanqueSprite, this.puntosEquipo?.visor1),
        });
        this.equiposTanques.push(new Equipo(this, tanqueSprite, { familia: 'alambique-simple' }));
        if (this.conSprites) {
          const sombra = this.add.graphics().setDepth(-.7);
          for (const [anchoSombra, alpha] of [[p.ancho + 48, .08], [p.ancho + 28, .12], [p.ancho + 10, .16]]) sombra.fillStyle(0x111315, alpha).fillEllipse(p.x, p.y + p.alto / 2 + 4, anchoSombra, 16);
        }
      }
    }
    if (!this.esCascada) this.dibujarFijacionesEntrada();
    this.conSpritesValvula = this.textures.exists('valvula-cuerpo') && this.textures.exists('valvula-volante');
    if (this.conSpritesValvula && !this.esCascada) {
      const puntos = posicionSpritesValvulas(this.nivel.tanques);
      for (const [clave, punto] of [['v1', puntos.v1], ['v2', puntos.v2]]) {
        if (!punto || (clave === 'v2' && this.nivel.tanques !== 2)) continue;
        const cuerpo = this.add.image(punto.x, punto.y, 'valvula-cuerpo').setDisplaySize(L.valvulaSprite.cuerpo, L.valvulaSprite.cuerpo);
        const volante = this.add.image(punto.x, punto.y, 'valvula-volante').setDisplaySize(L.valvulaSprite.volante, L.valvulaSprite.volante);
        const fantasma = this.add.image(punto.x, punto.y, 'valvula-volante').setDisplaySize(L.valvulaSprite.volante, L.valvulaSprite.volante).setAlpha(.35);
        this.spritesValvulas.push({ clave, cuerpo, volante, fantasma });
      }
    } else if (this.esCascada && this.textures.exists('valvula-volante')) {
      const cfg = L.cascada;
      for (const clave of ['v1', 'v2']) {
        const puntoInicial = this.anclajesMedidosTanques[clave === 'v1' ? 0 : 1][clave === 'v1' ? 'entrada' : 'salida'];
        const x = puntoInicial?.x ?? L.planta.x, y = puntoInicial?.y ?? L.planta.y;
        const cuerpo = this.textures.exists('valvula-cuerpo') ? this.add.image(x, y, 'valvula-cuerpo').setDisplaySize(L.valvulaSprite.cuerpo, L.valvulaSprite.cuerpo).setDepth(1) : null;
        const volante = this.add.image(x, y, 'valvula-volante').setDisplaySize(cfg.ruedas.tamano, cfg.ruedas.tamano).setDepth(1);
        const fantasma = this.add.image(x, y, 'valvula-volante').setDisplaySize(cfg.ruedas.tamano, cfg.ruedas.tamano).setAlpha(.35).setDepth(1);
        this.spritesValvulas.push({ clave, cuerpo, volante, fantasma });
      }
    }
    this.renderOverlay = this.add.graphics().setDepth(2);
    this.etiquetasEquilibrio = Array.from({ length: this.nivel.tanques }, (_, indice) => {
      const visor = this.esCascada
        ? this.visoresCascada[indice === 0 ? 'superior' : 'inferior']
        : obtenerVisorTanque(indice, this.nivel.tanques, this.conSprites, this.visoresSimples[indice], this.cajasTanquesSprite[indice]);
      const regla = L.reglaVisor;
      const panelX = visor.x + visor.w + regla.panelOffsetX;
      this.panel({ x: panelX, y: visor.y, ancho: regla.panelAncho, alto: visor.h }, { profundidad: 1.8, alpha: .82, radio: 2 });
      return this.add.text(visor.x + visor.w + L.equilibrio.etiquetaOffsetX, visor.y, 'equilibrio', fuenteInterfaz(9, '#FFFFFF', { backgroundColor: 'rgba(28,32,38,0.9)', padding: { x: 2, y: 1 } })).setDepth(6).setVisible(false);
    });
    if (this.textures.exists('caldero-real')) {
      const cfg = L.caldero, fuente = this.textures.get('caldero-real').getSourceImage();
      const ancho = cfg.ancho, alto = ancho * fuente.height / fuente.width;
      const x = this.esCascada
        ? (this.anclajesMesa?.bordeDerecho ?? (L.mesa.centroX + L.mesa.ancho / 2)) + L.cascada.salidaFueraMesa
        : cfg.centroX;
      this.calderoCaja = { x: x - ancho / 2, y: cfg.baseY - alto, w: ancho, h: alto };
      const sombraCaldero = this.add.graphics().setDepth(-.7);
      for (const [anchoSombra, alpha] of [[ancho + 38, .08], [ancho + 20, .13], [ancho + 5, .18]]) sombraCaldero.fillStyle(0x111315, alpha).fillEllipse(x, cfg.baseY + 3, anchoSombra, 13);
      this.add.image(x, cfg.baseY - alto / 2, 'caldero-real').setDisplaySize(ancho, alto).setDepth(1);
      this.anclajeBocaCaldero = { x, y: this.calderoCaja.y + alto * cfg.boca.yRel };
      this.superficiePocionCaldero = { x, y: this.calderoCaja.y + alto * cfg.pocion.yRel };
      this.picoSalida = { x, y: this.anclajeBocaCaldero.y };
    }
    this.placasAlarmas = [];
    this.runasAlarmas = [];
    if (this.textures.exists('alarma-placa') && this.textures.exists('alarma-runa')) {
      const puntos = this.esCascada
        ? ['superior', 'inferior'].map((key, i) => ({ x: L.cascada.etiquetasTanque[i].x + L.cascada.etiquetasTanque[i].placa / 2, y: this.visoresCascada[key].y + this.visoresCascada[key].h / 2, tamano: L.cascada.etiquetasTanque[i].placa }))
        : posicionSpritesValvulas(this.nivel.tanques).alarmas.map((p) => ({ ...p, tamano: L.alarmaSolo.tamano }));
      for (const p of puntos) {
        this.placasAlarmas.push(this.add.image(p.x, p.y, 'alarma-placa').setDisplaySize(p.tamano, p.tamano).setDepth(3));
        this.runasAlarmas.push(this.add.image(p.x, p.y, 'alarma-runa').setDisplaySize(p.tamano, p.tamano).setDepth(4));
      }
    }
    this.etiquetasEscala = [];
    this.etiquetasEscalaCascada = {};
    this.etiquetasEscalaSimple = [];
    if (this.esCascada) {
      for (const key of ['superior', 'inferior']) {
        const v = this.visoresCascada[key], regla = L.reglaVisor, x = v.x + v.w + regla.panelOffsetX;
        const marcas = [];
        for (let metro = 0; metro <= 3; metro++) {
          const y = v.y + v.h * (1 - metro / 3);
          this.renderEscalaVisores.lineStyle(1, 0xe6e8ea, .9).lineBetween(x + 1, y, x + 5, y);
          const yTexto = metro === 3 ? y + 5 : metro === 0 ? y - 5 : y;
          const texto = this.add.text(x + 7, yTexto, String(metro), fuenteInterfaz(9)).setOrigin(0, .5).setDepth(5);
          marcas.push(texto); this.etiquetasEscala.push(texto);
        }
        const unidad = this.add.text(x + 7, v.y - 12, 'm', fuenteInterfaz(8)).setDepth(5);
        this.etiquetasEscalaCascada[key] = { marcas, unidad };
        this.etiquetasEscala.push(unidad);
      }
    } else for (let tanque = 0; tanque < this.nivel.tanques; tanque++) {
      const visorMedido = this.visoresSimples[tanque];
      const cajaSprite = this.cajasTanquesSprite[tanque];
      const visor = obtenerVisorTanque(tanque, this.nivel.tanques, this.conSprites, visorMedido, cajaSprite), regla = L.reglaVisor;
      const panelX = visor.x + visor.w + regla.panelOffsetX;
      const xRegla = panelX + 1;
      this.renderEscalaVisores.lineStyle(1, 0xe6e8ea, .85).lineBetween(xRegla, visor.y, xRegla, visor.y + visor.h);
      const marcas = [];
      for (let metro = 0; metro <= 3; metro++) {
        const y = visor.y + visor.h * (1 - metro / 3);
        this.renderEscalaVisores.lineStyle(1, 0xe6e8ea, .9).lineBetween(panelX + 1, y, panelX + 5, y);
        const yTexto = metro === 3 ? y + 5 : metro === 0 ? y - 5 : y;
        const texto = this.add.text(panelX + 7, yTexto, String(metro), fuenteInterfaz(9)).setOrigin(0, .5).setDepth(5);
        marcas.push(texto); this.etiquetasEscala.push(texto);
      }
      const unidad = this.add.text(panelX + 7, visor.y - 12, 'm', fuenteInterfaz(8)).setOrigin(0, 0).setDepth(5);
      this.etiquetasEscalaSimple.push({ marcas, unidad });
      this.etiquetasEscala.push(unidad);
    }
    for (let i = 0; i < this.nivel.tanques; i++) {
      if (this.esCascada) {
        const key = i === 0 ? 'superior' : 'inferior', visor = this.visoresCascada[key], cfg = L.cascada.etiquetasTanque[i];
        const y = visor.y + visor.h / 2 - cfg.alto / 2 + (cfg.desfaseY ?? 0);
        this.panel({ x: cfg.x, y, ancho: cfg.ancho, alto: cfg.alto }, { profundidad: 1, radio: 7 });
        this.placasAlarmas[i]?.setPosition(cfg.x + cfg.placa / 2, y + cfg.alto / 2);
        this.runasAlarmas[i]?.setPosition(cfg.x + cfg.placa / 2, y + cfg.alto / 2);
        this.add.text(cfg.x + cfg.placa + 3, y + 10, `Alambique ${i + 1} · h${i + 1}`, fuenteInterfaz(10, '#E6E8EA', { fontStyle: 'bold' })).setDepth(5).setName(`etiqueta-tanque-${i}`);
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
        const pos = L.cascada.etiquetasValvula;
        const entrada = this.anclajesMedidosTanques[0].entrada, salida = this.anclajesMedidosTanques[1].salida;
        const picoSalida = this.anclajeBocaCaldero.y - L.caldero.alturaPicoSobreBorde;
        const puntoValvula = clave === 'v1' ? this.posicionValvulaEntrada(entrada) : this.posicionValvulaSalida(salida, { y: picoSalida });
        const { x: cx, y: cy } = puntoValvula;
        const tamanoRueda = L.cascada.ruedas.tamano;
        const altoEtiqueta = clave === 'v1' ? 20 : pos.alto;
        const yEtiqueta = clave === 'v1' ? cy - tamanoRueda / 2 - altoEtiqueta : cy + tamanoRueda / 2 + 5;
        const xEtiqueta = cx - pos.ancho / 2;
        this.panel({ x: xEtiqueta, y: yEtiqueta, ancho: pos.ancho, alto: altoEtiqueta }, { profundidad: 1, radio: 5 });
        this.etiquetasValvulas[clave] = this.add.text(xEtiqueta + 5, yEtiqueta + 3, '', fuenteInterfaz(11, '#E6E8EA', { fontStyle: 'bold' })).setDepth(5);
      }
      const q12 = this.anclajeQ12Medido;
      const q = { x: q12.x + q12.w + L.cascada.etiquetaQ12.separacion, y: q12.y + q12.h / 2 - L.cascada.etiquetaQ12.alto / 2, ancho: L.cascada.etiquetaQ12.ancho, alto: L.cascada.etiquetaQ12.alto };
      this.panel(q, { profundidad: 1, radio: 5 });
      this.add.text(q.x + 5, q.y + 7, 'q12 = c1·√h1 (llave abierta)', fuenteInterfaz(10, '#E6E8EA', { fontStyle: 'bold' })).setDepth(5);
    } else if (this.nivel.id === 2) {
      const q = L.salidaConsumo.etiqueta;
      this.panel(q, { profundidad: 1, radio: 5 });
      this.add.text(q.x + 5, q.y + 4, 'consumo qd →\ncaldero', fuenteInterfaz(9, '#E6E8EA', { fontStyle: 'bold', lineSpacing: 1 })).setDepth(5);
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
      limpiar(() => this.renderAnclajesDebug.destroy());
      limpiar(() => this.renderChorroEntrada.destroy());
      limpiar(() => this.renderOverlay.destroy());
      limpiar(() => this.renderEquilibrio.destroy());
      limpiar(() => this.renderEscalaVisores.destroy());
      limpiar(() => this.renderMarcasRegla.destroy());
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
    if (!this.esCascada) dibujarTanquesFijos(this.renderFijo, this.renderMarcasFijas, this.renderTuberias, this.nivel.tanques, { conSprites: this.conSprites, conSpritesValvula: this.conSpritesValvula, visores: this.visoresSimples, cajas: this.conSprites ? this.cajasTanquesSprite : null });
    this.dibujarConexionesMedidas();
  }

  dibujarFijacionesEntrada() {
    const cfg = LAYOUT.simulacion.entradaSolo;
    const tuboY = cfg.ejeTuboY, g = this.renderEntradaFixtures;
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

  dibujarConexionesMedidas() {
    const L = LAYOUT.simulacion, entrada = this.anclajesMedidosTanques?.[0]?.entrada;
    const salida = this.anclajesMedidosTanques?.at(-1)?.salida;
    if (!entrada || !salida) return;
    this.renderTuberias.clear();
    this.renderBridaSalida.clear();
    this.renderTuberiaCascada.clear();
    let valvula1;
    if (this.esCascada) {
      valvula1 = this.posicionValvulaEntrada(entrada);
      const rutaEntrada = [{ x: L.planta.x, y: valvula1.y }, { x: entrada.x, y: valvula1.y }, entrada];
      dibujarTuberia(this.renderTuberiaCascada, rutaEntrada);
      this.recorridoEntradaFlujo = rutaEntrada;
      this.dibujarBridasCodos(this.renderBridaSalida, rutaEntrada);
      this.renderBridaSalida.fillStyle(0x1a1b1d).fillCircle(entrada.x, entrada.y, 8).fillStyle(0xb85a24).fillCircle(entrada.x, entrada.y, 5);
    } else {
      const cfgEntrada = L.entradaSolo, valve = L.valvula1Solo;
      valvula1 = { x: valve.x, y: valve.tuboY };
      const y = cfgEntrada.ejeTuboY;
      const caminoEntrada = [{ x: L.planta.x, y }, { x: entrada.x, y }, entrada];
      dibujarTuberia(this.renderTuberias, caminoEntrada);
      this.recorridoEntradaFlujo = caminoEntrada;
      this.dibujarBridasCodos(this.renderBridaSalida, caminoEntrada);
      this.renderBridaSalida.fillStyle(0x1a1b1d).fillCircle(entrada.x, entrada.y, 8).fillStyle(0xb85a24).fillCircle(entrada.x, entrada.y, 5);
    }
    this.posicionesValvulasMedidas = { v1: valvula1 };
    if (this.calderoCaja && this.anclajeBocaCaldero) {
      const boca = this.anclajeBocaCaldero;
      const pico = { x: boca.x, y: boca.y - L.caldero.alturaPicoSobreBorde };
      if (this.esCascada) {
        const valve2 = this.posicionValvulaSalida(salida, pico);
        this.posicionesValvulasMedidas.v2 = valve2;
        const radio = L.valvulaSprite.cuerpo / 2;
        const xBajada = Math.max(valve2.x + radio + 12, boca.x + 40);
        const yHorizontal = pico.y - L.salidaConsumo.codoAntesPico;
        this.recorridoSalida = [salida, { x: valve2.x - radio, y: salida.y }, { x: valve2.x + radio, y: salida.y }, { x: xBajada, y: salida.y }, { x: xBajada, y: yHorizontal }, { x: boca.x, y: yHorizontal }, pico];
        this.recorridosFlujoSalida = [
          [salida, { x: valve2.x - radio, y: salida.y }],
          [{ x: valve2.x + radio, y: salida.y }, { x: xBajada, y: salida.y }, { x: xBajada, y: yHorizontal }, { x: boca.x, y: yHorizontal }, pico],
        ];
        dibujarTuberia(this.renderTuberiaCascada, this.recorridoSalida);
        this.dibujarBridasCodos(this.renderBridaSalida, this.recorridoSalida);
        this.renderBridaSalida.fillStyle(0x1a1b1d, 1).fillCircle(salida.x, salida.y, 10)
          .lineStyle(3, 0xb85a24, 1).strokeCircle(salida.x, salida.y, 7);
      } else {
        const union = L.entradaSolo.salidaAlambique, xBajada = this.anclajesMesa?.bordeDerecho ?? boca.x - 70;
        const inicioBoquilla = { x: salida.x + union.brida.radio + union.boquillaLongitud, y: salida.y };
        const yHorizontal = pico.y - L.salidaConsumo.codoAntesPico;
        this.recorridoSalida = [salida, inicioBoquilla, { x: xBajada, y: salida.y }, { x: xBajada, y: yHorizontal }, { x: boca.x, y: yHorizontal }, pico];
        this.recorridosFlujoSalida = [this.recorridoSalida];
        dibujarTuberia(this.renderSalidaOculta, this.recorridoSalida);
        this.dibujarBridasCodos(this.renderBridaSalida, this.recorridoSalida);
        this.renderBridaSalida.fillStyle(0x1a1b1d).fillCircle(salida.x, salida.y, 12)
          .lineStyle(3, 0xb85a24).strokeCircle(salida.x, salida.y, 9);
      }
      this.picoSalida = pico;
    }
    for (const valvula of this.spritesValvulas || []) {
      const p = this.posicionesValvulasMedidas[valvula.clave];
      if (!p) continue;
      valvula.cuerpo?.setPosition(p.x, p.y); valvula.volante.setPosition(p.x, p.y); valvula.fantasma?.setPosition(p.x, p.y);
    }
  }

  posicionValvulaEntrada(entrada) {
    const L = LAYOUT.simulacion;
    if (!this.esCascada) return { x: L.valvula1Solo.x, y: L.valvula1Solo.tuboY };
    return { x: entrada.x - 150, y: Math.max(L.barraSuperior.y + L.barraSuperior.alto + 20 + L.valvulaSprite.cuerpo / 2, entrada.y - 35) };
  }

  posicionValvulaSalida(salida, pico) {
    return { x: salida.x + 105, y: salida.y };
  }

  dibujarBridasCodos(g, puntos) {
    for (let i = 1; i < puntos.length - 1; i++) {
      const previo = puntos[i - 1], centro = puntos[i], siguiente = puntos[i + 1];
      const dxPrevio = centro.x - previo.x, dyPrevio = centro.y - previo.y;
      const dxSiguiente = siguiente.x - centro.x, dySiguiente = siguiente.y - centro.y;
      if (Math.hypot(dxPrevio, dyPrevio) < 1 || Math.hypot(dxSiguiente, dySiguiente) < 1) continue;
      const esCodo = (Math.abs(dxPrevio) > 1 && Math.abs(dySiguiente) > 1)
        || (Math.abs(dyPrevio) > 1 && Math.abs(dxSiguiente) > 1);
      if (!esCodo) continue;
      g.fillStyle(0x1a1b1d, 1).fillCircle(centro.x, centro.y, 9);
      g.lineStyle(2, 0xb85a24, 1).strokeCircle(centro.x, centro.y, 7);
      for (const signo of [-1, 1]) {
        g.fillStyle(0x1a1b1d, 1).fillCircle(centro.x + signo * 5, centro.y, 1.7);
        g.fillStyle(0xe6a06d, 1).fillCircle(centro.x + signo * 5, centro.y - .5, .8);
      }
    }
  }

  actualizarFlujoSalida() {
    if (!this.picoSalida || !this.superficiePocionCaldero) return;
    const p = this.sistema.p;
    const caudal = this.esCascada
      ? p.coeficienteDescarga2 * this.actuador2.salida() * Math.sqrt(Math.max(0, this.sistema.x[1] ?? 0))
      : p.coeficienteDescarga1 * Math.sqrt(Math.max(0, this.sistema.x[0] ?? 0));
    if (this.recorridosFlujoSalida) {
      this.renderCanalSalida.clear();
      this.recorridosFlujoSalida.forEach((ruta, indice) => dibujarCanalConFlujo(this.renderCanalSalida, ruta, caudal, this.tiempoJuego, LAYOUT.simulacion.entradaSolo.salidaAlambique.canal, LAYOUT.simulacion.tuberia.ancho, indice === 0));
    }
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

  dibujarChorroEntrada() {
    const g = this.renderChorroEntrada, entrada = this.anclajesMedidosTanques?.[0]?.entrada;
    g.clear();
    if (!entrada || !this.recorridoEntradaFlujo?.length) return;
    const qIn = this.sistema.p.caudalEntradaMaximo * this.actuador1.salida();
    if (qIn <= 0) return;
    const grosor = Math.min(LAYOUT.simulacion.tuberia.ancho - 2, Math.max(2, LAYOUT.simulacion.tuberia.ancho * qIn / this.sistema.p.caudalEntradaMaximo));
    for (let i = 1; i < this.recorridoEntradaFlujo.length; i++) {
      const a = this.recorridoEntradaFlujo[i - 1], b = this.recorridoEntradaFlujo[i];
      g.lineStyle(grosor, 0x00e676, .9).lineBetween(a.x, a.y, b.x, b.y);
    }
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
      this.actualizarEstadosEquipo(dt);
      const desborde = hs.some((h) => h >= PARAMETROS_TANQUES.alturaMaxima);
      if (desborde) { this.terminar(true); return; }
      if (this.tiempoJuego >= this.nivel.duracion) { this.terminar(false); return; }
      if (!this.modoVerificacionEscalon && this.nivel.criterio.tipo === 'consecutivo' && this.tiempoEnBandaSeguido >= this.nivel.criterio.segundos) { this.terminar(false); return; }
    }
    this.actualizarBarrasEnVivo();
    this.actualizarElementosVivos();
    this.actualizarAyudaPellizco(c);
    this.actualizarFlujoSalida();
    this.dibujarChorroEntrada();
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
      this.dibujarAnclajesDepuracion();
      this.ultimoDebug = ahoraHmi;
    } else if (!this.debug) this.dibujarAnclajesDepuracion();
  }

  dibujarAnclajesDepuracion() {
    const g = this.renderAnclajesDebug;
    g.clear();
    this.debugAnchorTexts?.forEach((text) => text.destroy());
    this.debugAnchorTexts = [];
    if (!this.debug) return;
    const marcar = (p, nombre, color) => {
      if (!p) return;
      g.lineStyle(2, color, 1).lineBetween(p.x - 7, p.y, p.x + 7, p.y).lineBetween(p.x, p.y - 7, p.x, p.y + 7);
      this.debugAnchorTexts.push(this.add.text(p.x + 8, p.y - 15, nombre, { fontFamily: 'monospace', fontSize: '11px', color: `#${color.toString(16).padStart(6, '0')}`, backgroundColor: 'rgba(20,22,25,.86)', padding: { x: 2, y: 1 } }).setDepth(8));
    };
    for (const [i, tanque] of this.anclajesMedidosTanques.entries()) {
      marcar(tanque.entrada, `T${i + 1} entrada`, 0x00e676);
      marcar(tanque.salida, `T${i + 1} salida`, 0xffa24a);
      marcar(tanque.base, `T${i + 1} base`, 0x57c7ff);
      if (tanque.visor) g.lineStyle(2, 0xffffff, .95).strokeRect(tanque.visor.x, tanque.visor.y, tanque.visor.w, tanque.visor.h);
    }
    if (this.anclajeQ12Medido) {
      const r = this.anclajeQ12Medido;
      g.lineStyle(2, 0x00e676, .95).strokeRect(r.x, r.y, r.w, r.h);
      marcar({ x: r.x + r.w / 2, y: r.y + r.h / 2 }, 'q12', 0x00e676);
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
    if (this.esCascada) {
      dibujarLiquidosCascada(this.renderVisorLiquido, this.visoresCascada, hs, referencia, banda, dentroBanda);
      this.renderTuberiasExtra.clear();
      const q12 = this.sistema.p.coeficienteDescarga1 * Math.sqrt(Math.max(0, hs[0] ?? 0));
      if (q12 > 0 && this.anclajeQ12Medido) {
        const v = this.anclajeQ12Medido, m = 2;
        const alpha = Math.min(.9, q12 / (this.sistema.p.coeficienteDescarga1 * Math.sqrt(PARAMETROS_TANQUES.alturaMaxima)));
        this.renderTuberiasExtra.fillStyle(0x00e676, alpha).fillRoundedRect(v.x + m, v.y + m, Math.max(1, v.w - m * 2), Math.max(1, v.h - m * 2), Math.min(5, v.w / 3));
      }
    } else dibujarNivelesTanques(this.render, this.renderOverlay, hs, this.nivel.tanques, {
      tanqueControlado: this.nivel.tanques === 2 ? 1 : 0, referencia, tolerancia: banda, dentroBanda, conSprites: this.conSprites, visores: this.visoresSimples, cajas: this.conSprites ? this.cajasTanquesSprite : null,
    });
    const alturaEtiqueta = this.nivel.tanques === 2 ? 'h2' : 'h1';
    this.refTexto.setText(this.nivel.tanques === 2
      ? `${alturaEtiqueta} ${variableControlada.toFixed(2)} m · ref ${referencia.toFixed(2)} ±${banda.toFixed(2)} m · qd ${obtenerPerturbacion(this.nivel, this.tiempoJuego).toFixed(2)}`
      : `${alturaEtiqueta} ${variableControlada.toFixed(2)} m · referencia ${referencia.toFixed(2)} ±${banda.toFixed(2)} m · qd ${obtenerPerturbacion(this.nivel, this.tiempoJuego).toFixed(3)} m³/s`);
    const alarmasPorTanque = hs.map((h, i) => this.equipoCascada?.alarmas[i] ?? this.equiposTanques?.[i]?.alarmas[0] ?? (h >= 2.8 ? 'HH' : h >= 2.4 ? 'H' : null));
    this.alarmasActivas = alarmasPorTanque.map((alarma, i) => alarma ? `${alarma}${i + 1}` : '').filter(Boolean);
    this.alarmText.setText(this.alarmasActivas.length ? `ALARMA ${this.alarmasActivas.join(' · ')}` : '');
    this.alarmText.setColor(this.alarmasActivas.some((a) => a.startsWith('HH')) ? '#FF1744' : '#FFD700');
    hs.forEach((h, i) => this.children.getByName(`etiqueta-tanque-${i}`)?.setText(`Alambique ${i + 1} · h${i + 1} ${h.toFixed(2)} m`));
    (this.runasAlarmas || []).forEach((runa, i) => {
      const alarma = alarmasPorTanque[i];
      const color = alarma === 'HH' ? 0xff1744 : alarma === 'H' ? 0xffd700 : 0x70777a;
      runa.setTint(color).setAlpha(alarma ? 1 : .8);
    });
    for (const valve of this.spritesValvulas || []) {
      const salida = valve.clave === 'v1' ? this.actuador1.salida() : this.actuador2.salida();
      const mando = valve.clave === 'v1' ? this.mando1Visual : this.mando2Visual;
      valve.volante.setRotation(salida * Math.PI * 1.5);
      valve.fantasma?.setRotation(mando * Math.PI * 1.5);
    }
    this.etiquetasValvulas?.v1?.setText(`v1 ${Math.round(this.actuador1.salida() * 100)} %`);
    this.etiquetasValvulas?.v2?.setText(`v2 ${Math.round(this.actuador2.salida() * 100)} %`);
    this.dibujarMarcasEquilibrio();
  }

  actualizarEstadosEquipo(dt = 0) {
    const alturas = this.sistema.x;
    const qIn = this.sistema.p.caudalEntradaMaximo * this.actuador1.salida();
    this.equipoCascada?.actualizar({ alturas, qIn, dt });
    this.equiposTanques?.forEach((equipo) => equipo.actualizar({ alturas, qIn, dt }));
    this.actualizarGeometriaVisoresEquipo();
  }

  actualizarGeometriaVisoresEquipo() {
    const equipo = this.esCascada ? this.equipoCascada : this.equiposTanques?.[0];
    if (!equipo) return;
    const estadoAsset = equipo.estado === 'apagado' ? 'reposo' : equipo.estado === 'arranque' ? 'funcionando' : equipo.estado;
    if (this.estadoVisorEquipo === estadoAsset) return;
    this.estadoVisorEquipo = estadoAsset;
    // La geometría, incluida la ventana, es idéntica en todos los cuadros.
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
    const referencia = obtenerReferencia(this.nivel, this.tiempoJuego);
    const tolerancia = obtenerTolerancia(this.nivel, this.tiempoJuego);
    this.dibujarMarcasRegla(referencia, tolerancia);
    this.renderEquilibrio.clear();
    const L = LAYOUT.simulacion, dash = L.equilibrio.dash, espacio = L.equilibrio.espacio;
    alturas.forEach((altura, indice) => {
      const visor = this.esCascada
        ? this.visoresCascada[indice === 0 ? 'superior' : 'inferior']
        : obtenerVisorTanque(indice, this.nivel.tanques, this.conSprites, this.visoresSimples[indice], this.cajasTanquesSprite[indice]);
      const arriba = visor.top ?? visor.y, abajo = visor.bottom ?? visor.y + visor.h;
      const y = abajo - (abajo - arriba) * altura / 3;
      const izquierda = visor.x + 1, derecha = visor.x + visor.w - 1;
      this.renderEquilibrio.lineStyle(1.5, 0xffffff, .95);
      for (let x = izquierda; x < derecha; x += dash + espacio) this.renderEquilibrio.lineBetween(x, y, Math.min(derecha, x + dash), y);
      const etiqueta = this.etiquetasEquilibrio[indice];
      etiqueta?.setY(y - L.equilibrio.etiquetaAlto / 2).setVisible(true);
    });
  }

  dibujarMarcasRegla(referencia, tolerancia) {
    const g = this.renderMarcasRegla;
    if (!g) return;
    g.clear();
    const controlado = this.nivel.tanques === 2 ? 1 : 0;
    const visores = this.esCascada
      ? [this.visoresCascada.superior, this.visoresCascada.inferior]
      : Array.from({ length: this.nivel.tanques }, (_, i) => obtenerVisorTanque(i, this.nivel.tanques, this.conSprites, this.visoresSimples[i], this.cajasTanquesSprite[i]));
    visores.forEach((visor, indice) => {
      if (!visor) return;
      const x = visor.x + visor.w + LAYOUT.simulacion.reglaVisor.panelOffsetX;
      const yNivel = (h) => visor.y + visor.h * (1 - Math.max(0, Math.min(3, h)) / 3);
      if (indice === controlado && Number.isFinite(referencia)) {
        const superior = yNivel(referencia + tolerancia), inferior = yNivel(referencia - tolerancia);
        g.fillStyle(0xb7bdc2, .42).fillRect(x + 1, superior, LAYOUT.simulacion.reglaVisor.panelAncho - 2, Math.max(1, inferior - superior));
        g.lineStyle(2, 0xc9a227, 1).lineBetween(x + 1, yNivel(referencia), x + LAYOUT.simulacion.reglaVisor.panelAncho - 1, yNivel(referencia));
      }
      for (const [nivel, color] of [[2.4, 0xffd700], [2.8, 0xff1744]]) {
        const y = yNivel(nivel);
        g.lineStyle(2, color, 1).lineBetween(x + LAYOUT.simulacion.reglaVisor.panelAncho - 7, y, x + LAYOUT.simulacion.reglaVisor.panelAncho - 1, y);
      }
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
    const opcionesNiveles = { ...L.tendenciaNiveles, muestras: this.muestrasVista, min: 0, max: 3, unidad: 'm', titulo: 'Niveles y banda', clave: 'y', series: [...seriesAltura, { clave: 'h_sp', nombre: 'referencia', color: 0xc9a227 }], bandaInferiorClave: 'banda_inf', bandaSuperiorClave: 'banda_sup', alarma: alarmasActivas.length > 0, ejeTiempo: true };
    const opcionesValvulas = { ...L.tendenciaValvulas, muestras: this.muestrasVista, min: 0, max: 1, unidad: '', titulo: 'Válvulas v1 / v2', tituloEjeY: 'apertura', formatoTickY: (v) => Number(v.toFixed(2)).toString(), ejeTiempo: true, series: [{ clave: 'u', nombre: 'v1', color: 0xe6e8ea }, ...(this.nivel.tanques === 2 ? [{ clave: 'v2', nombre: 'v2', color: 0x2ecc71 }] : [])] };
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
      this.ultimaAlarma[i] = estado;
    });
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
    console.info('terminar: cambio de escena');
    this.scene.start('Fin', datosFin);
    setTimeout(() => {
      console.info('[DIAG] escenas activas', this.game.scene.getScenes(true).map((escena) => escena.scene.key));
    }, 1000);
  }
}
