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
import { dibujarTanquesFijos, dibujarNivelesTanques, dibujarTuberia, dibujarLiquidosCascada, convertirVisoresCascada, posicionEscalaTanque, posicionSpriteTanque, posicionSpritesValvulas } from '../hmi/tanques.js';
import { MAPA_CONTROL, leerSenal, leerSenalSiPresente } from './mapaControl.js';
import { LAYOUT } from '../hmi/layout.js';
import { fuenteInterfaz, fuenteTitulo } from '../hmi/estilo.js';
import { dibujarProgreso } from '../hmi/actuadores.js';

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
    this.nivel = cargarNiveles().find((n) => n.id === Number(contextoJuego.nivelElegido)) || cargarNiveles()[0];
    this.gestor = contextoJuego.gestor = new GestorEntrada({ fuente: contextoJuego.fuenteElegida || undefined });
    this.gestor.elegir(contextoJuego.fuenteElegida || this.gestor.fuente);
    this.modoVerificacionEscalon = this.gestor.fuente === 'escalon' && this.nivel.id === 1;
    if (this.modoVerificacionEscalon) {
      this.nivel.estadoInicial = [1.5];
      this.nivel.duracion = 80;
    }
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
    this.renderEntradaFixtures = this.add.graphics().setDepth(-.4);
    this.renderVisorLiquido = this.add.graphics().setDepth(1.5);
    this.renderVisorOverlay = this.add.graphics().setDepth(2);
    this.renderChorro = this.add.graphics().setDepth(4);
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
    this.mando1Visual = this.actuador1.salida();
    this.mando2Visual = this.actuador2.salida();
    this.barras[0] = dibujarBarraActuador(this, L.barraV1.x, L.barraV1.y, 'v1 entrada', this.actuador1.salida(), this.sistema.x[0], 'm', 'h1', L.barraV1.ancho, this.mando1Visual);
    if (this.nivel.tanques === 2) this.barras[1] = dibujarBarraActuador(this, L.barraV2.x, L.barraV2.y, 'v2 salida', this.actuador2.salida(), this.sistema.x[1], 'm', 'h2', L.barraV2.ancho, this.mando2Visual);
    this.add.text(L.ayudaValvulas.x, L.ayudaValvulas.y, '▲ mano · ■ válvula (tarda 4 s de 0 a 100 %)', fuenteInterfaz(10, '#E6E8EA')).setDepth(5);
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
    if (!this.esCascada) dibujarTanquesFijos(this.renderFijo, this.renderMarcasFijas, this.renderTuberias, this.nivel.tanques, { conSprites: this.conSprites, conSpritesValvula: this.conSpritesValvula });
    if (!this.esCascada && this.calderoCaja) this.dibujarSalidaFija();
    if (this.esCascada && this.calderoCaja) this.dibujarSalidaCascadaFija();
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
    const caudal = this.esCascada
      ? PARAMETROS_TANQUES.coeficienteDescarga2 * this.actuador2.salida() * Math.sqrt(Math.max(0, this.sistema.x[1] ?? 0))
      : PARAMETROS_TANQUES.coeficienteDescarga1 * Math.sqrt(Math.max(0, this.sistema.x[0] ?? 0));
    if (!this.esCascada && this.recorridoSalida) dibujarCanalConFlujo(this.renderCanalSalida, this.recorridoSalida, caudal, this.tiempoJuego, LAYOUT.simulacion.entradaSolo.salidaAlambique.canal, LAYOUT.simulacion.tuberia.ancho);
    this.renderChorro.clear();
    if (caudal > 0) {
      const L = LAYOUT.simulacion;
      const coeficiente = this.esCascada ? PARAMETROS_TANQUES.coeficienteDescarga2 : PARAMETROS_TANQUES.coeficienteDescarga1;
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
      const desborde = hs.some((h) => h >= PARAMETROS_TANQUES.alturaMaxima);
      if (desborde) { this.terminar(true); return; }
      if (this.tiempoJuego >= this.nivel.duracion) { this.terminar(false); return; }
      if (!this.modoVerificacionEscalon && this.nivel.criterio.tipo === 'consecutivo' && this.tiempoEnBandaSeguido >= this.nivel.criterio.segundos) { this.terminar(false); return; }
    }
    this.actualizarBarrasEnVivo();
    this.actualizarElementosVivos();
    this.actualizarFlujoSalida();
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
      this.panelDepuracion.actualizar({ fps: camara?.fps, fpsCamara: camara?.fpsCamara, fpsJuego, tiempoDeteccionMs: camara?.promedioDeteccionMs, tiempoCuadroMs: this.tiempoMedioCuadroMs, delegado: camara?.delegado, resolucion: camara?.obtenerResolucion?.(), avisoResolucion: camara?.avisoResolucion, alertaFPS, alfa: dep.alfa, Ts: dep.Ts, tau: dep.tau, controles: c, x: this.sistema.x });
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
    if (this.esCascada) {
      dibujarLiquidosCascada(this.renderVisorLiquido, this.visoresCascada, hs, referencia, banda, dentroBanda);
      this.renderTuberiasExtra.clear();
      const q12 = PARAMETROS_TANQUES.coeficienteDescarga1 * Math.sqrt(Math.max(0, hs[0] ?? 0));
      if (q12 > 0) {
        const v = L.cascada.unionVidrio, m = v.margenInterior;
        const alpha = Math.min(.9, q12 / (PARAMETROS_TANQUES.coeficienteDescarga1 * Math.sqrt(PARAMETROS_TANQUES.alturaMaxima)));
        this.renderTuberiasExtra.fillStyle(0x00e676, alpha).fillRect(this.cajaCascada.x + v.x * this.cajaCascada.w + m, this.cajaCascada.y + v.y * this.cajaCascada.h + m, v.ancho * this.cajaCascada.w - m * 2, v.alto * this.cajaCascada.h - m * 2);
      }
    } else dibujarNivelesTanques(this.render, this.renderOverlay, hs, this.nivel.tanques, {
      tanqueControlado: this.nivel.tanques === 2 ? 1 : 0, referencia, tolerancia: banda, dentroBanda, conSprites: this.conSprites,
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
