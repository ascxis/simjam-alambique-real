// Anchors derived from the processed sprite sizes: table 390×182, tank 215×300.
const MESA_PISO_Y = 650;
const MESA_ANCHO = 390;
const MESA_ALTO = 182;
const SUPERFICIE_MESA_Y = MESA_PISO_Y - MESA_ALTO + MESA_ALTO * .28;
const TANQUE_SOLO_ALTO = 300;
const TANQUE_SOLO_CIMA_Y = SUPERFICIE_MESA_Y - TANQUE_SOLO_ALTO;
const EJE_ENTRADA_Y = TANQUE_SOLO_CIMA_Y - 33;
const DESFASE_EJE_VALVULA_Y = 15;
const CASCADA_REFERENCIA = Object.freeze({
  ancho: 1015,
  alto: 1311,
  salidaX: (0.423 * 2752 - 173 - 3) / 1015,
  cuerpoX0: (0.139 * 2752 - 173 - 3) / 1015,
  cuerpoX1: (0.308 * 2752 - 173 - 3) / 1015,
});

export const LAYOUT = Object.freeze({
  canvas: { ancho: 1280, alto: 720 },
  fondo: { viñeta: [
    { ancho: 32, alpha: .17 }, { ancho: 64, alpha: .11 }, { ancho: 104, alpha: .075 },
    { ancho: 150, alpha: .045 }, { alto: 24, alpha: .13 }, { alto: 48, alpha: .085 },
    { alto: 78, alpha: .05 },
  ] },
  colores: {
    fondo: 0x1c2026, oscuro: 0x1a1b1d, borde: 0xb85a24, cobre: 0xb85a24, texto: '#E6E8EA',
    titulo: '#F2E6C9', alarmaH: 0xffd700, alarmaHH: 0xff1744,
    pocion: 0x2ecc71, banda: 0x00e676, panelHmi: 0x3a3d40,
  },
  menu: {
    logo: { x: 640, y: 128, ancho: 400, alto: 256 },
    panel: { x: 260, y: 270, ancho: 760, alto: 380, radio: 10 },
    izquierda: { x: 292, ancho: 330 },
    derecha: { x: 652, ancho: 336 },
    fuenteLabelY: 292, fuenteY: 319, fuenteAlto: 38,
    nivelLabelY: 375, nivelY: 402, nivelAlto: 38,
    camaraLabelY: 292, camaraY: 319, camaraAlto: 38,
    invertirY: 400,
    botones: [
      { x: 285, y: 466, ancho: 230, alto: 46 },
      { x: 525, y: 466, ancho: 230, alto: 46 },
      { x: 765, y: 466, ancho: 230, alto: 46 },
    ],
    controles: { x: 280, y: 550, ancho: 720, alto: 62 },
    checkbox: { alto: 44, offsetX: 22 },
    margenControl: { x: 22, y: 18, horizontal: 44 },
  },
  simulacion: {
    barraSuperior: { x: 0, y: 0, ancho: 1280, alto: 80 },
    titulo: { x: 28, y: 19 }, parametrosEstado: { x: 28, y: 52 }, estadoCamara: { x: 1000, y: 29, ancho: 250 },
    planta: { x: 20, y: 90, ancho: 620, alto: 560 },
    piso: { x: 20, y: 650, ancho: 620, alto: 0 },
    hmi: { x: 660, y: 90, ancho: 600, alto: 560, radio: 10 },
    hmiInterior: { x: 680, ancho: 560 },
    estado: { x: 680, y: 105, ancho: 560, alto: 27 },
    tendenciaNiveles: { x: 680, y: 151, ancho: 560, alto: 198 },
    tendenciaValvulas: { x: 680, y: 354, ancho: 560, alto: 178 },
    barraV1: { x: 690, y: 538, ancho: 250, alto: 36 },
    barraV2: { x: 970, y: 538, ancho: 250, alto: 36 },
    ayudaValvulas: { x: 690, y: 574, ancho: 260, alto: 14 },
    ayudaPellizco: { iconoX: 978, iconoY: 560, textoX: 1008, textoY: 560, textoAncho: 230 },
    equilibrio: { etiquetaOffsetX: 36, etiquetaAncho: 76, etiquetaAlto: 17, dash: 5, espacio: 4 },
    reglaVisor: { panelOffsetX: 8, panelAncho: 22, numeroOffsetX: 4, tickAlto: 5 },
    criterio: { x: 680, y: 586, ancho: 560, alto: 64, progresoOffsetY: 33 },
    footer: { x: 20, y: 660, ancho: 1240, alto: 52, radio: 10 },
    ayuda: { x: 38, y: 670, ancho: 500, alto: 34 },
    ayudaSimple: { x: 290, ancho: 208 },
    ayudaCascada: { x: 38, ancho: 460 },
    reloj: { x: 550, y: 686, tamano: 24 },
    tiempo: { x: 572, y: 674, ancho: 260, alto: 26 },
    terminar: { x: 1090, y: 667, ancho: 145, alto: 38 },
    tanqueSolo: { centroX: 330, baseY: SUPERFICIE_MESA_Y, alto: TANQUE_SOLO_ALTO },
    tanque1Cascada: { centroX: 175, baseY: 360, alto: 240 },
    tanque2Cascada: { centroX: 450, baseY: 600, alto: 240 },
    cascada: {
      alto: SUPERFICIE_MESA_Y - 95, topMinimo: 95,
      salidaFueraMesa: 15,
      referencia: CASCADA_REFERENCIA,
      visorSuperior: 'superior', visorInferior: 'inferior',
      etiquetasValvula: { separacion: 5, ancho: 84, alto: 26 },
      ruedas: { v1: { x: .758, y: .183 }, v2: { x: .758, y: .747 }, tamano: 38 },
      etiquetaQ12: { separacion: 8, ancho: 174, alto: 30 },
      etiquetasTanque: [
        { x: 95, ancho: 116, alto: 36, placa: 32, desfaseY: 30 },
        { x: 95, ancho: 116, alto: 36, placa: 32, desfaseY: 0 },
      ],
      escala: { ancho: 26, alto: 22 },
    },
    mesa: {
      centroX: 330, ancho: MESA_ANCHO, alto: MESA_ALTO, patasY: MESA_PISO_Y,
      bordeTrasero: { xRel: .5, yRel: .17 }, bordeDelantero: { xRel: .5, yRel: .35 },
      puntoApoyoTanque: { xRel: .5, yRel: .28 }, patasDelanteras: [.08, .92],
    },
    caldero: {
      ancho: 110, alto: 97, baseY: MESA_PISO_Y, centroX: 590,
      boca: { xRel: .5, yRel: .06 }, pocion: { xRel: .5, yRel: .19 },
      alturaPicoSobreBorde: 15,
    },
    tuberia: { ancho: 7, borde: 2, brillo: 2, chorroMinimo: 2, chorroMaximo: 8 },
    soporte: { x: 65, y: 360, ancho: 220, baseY: 600 },
    entradaSolo: {
      brida: { x: 20, ancho: 24, alto: 40 }, barraY: 80,
      ejeTuboY: EJE_ENTRADA_Y,
      soportesX: [180, 280],
      valvula: { x: 69, tuboSemiancho: 25, ejeDesfaseY: DESFASE_EJE_VALVULA_Y },
      dome: { xRel: .5 }, salidaAlambique: {
        inicioDentro: 8, boquillaLongitud: 12, boquillaAncho: 10,
        brida: { radio: 13, anchoBorde: 3, remacheRadio: 1.5, remacheOffset: 6 },
        canal: { anchoRelativo: .5, largoTrazo: 12, separacionTrazos: 68, pixelesPorCaudal: 320 },
      },
    },
    valvula1Solo: { x: 69, y: EJE_ENTRADA_Y - DESFASE_EJE_VALVULA_Y, tuboY: EJE_ENTRADA_Y, tuboSemiancho: 25, domeXRel: .5, domeYRel: .01 },
    valvula1Cascada: { x: 70, y: 120, tuboY: 120, margenTanque: 0 },
    valvula2Cascada: { x: 584, y: 565, salidaXOffset: 50 },
    salidaConsumo: { codoAntesPico: 12, etiqueta: { x: 535, y: 488, ancho: 110, alto: 34 } },
    etiquetaSolo: { x: 430, y: 96, ancho: 200, alto: 36 },
    etiqueta1Cascada: { x: 65, y: 480, ancho: 220, alto: 36 },
    etiqueta2Cascada: { x: 300, y: 608, ancho: 300, alto: 36 },
    alarmaSolo: { x: 430, y: 96, tamano: 32 },
    alarma1Cascada: { x: 65, y: 480, tamano: 36 },
    alarma2Cascada: { x: 345, y: 608, tamano: 36 },
    escalaTanque: { ancho: 34, margenX: 4, margenSuperior: 20, margenInferior: 16 },
    valvulaSprite: { cuerpo: 70, volante: 42 },
    bordePedestal: { ancho: 4, voladizo: 16 },
    tuberiaQ12: { codoY: 410, margenTanque2: 5, margenSuperior: 30, etiqueta: { x: 368, y: 294, ancho: 82, alto: 24 } },
    pausa: { panel: { x: 390, y: 315, ancho: 500, alto: 70 }, centroX: 640, centroY: 350 },
    parametros: {
      panel: { x: 340, y: 165, ancho: 600, alto: 390 }, texto: { x: 370, y: 190 },
      filas: { area: 320, coeficienteDescarga1: 374, coeficienteDescarga2: 428 },
      etiquetaX: 370, opcionesX: 555, opcionAncho: 82, opcionAlto: 34, opcionGap: 8,
      aplicar: { x: 395, y: 496, ancho: 220, alto: 42 }, nominales: { x: 630, y: 496, ancho: 220, alto: 42 },
    },
  },
  final: {
    marcoOriginal: { ancho: 483, alto: 559 },
    factor: 700 / 559,
    marco: { x: 20, y: 10, ancho: 700 * 588 / 680, alto: 700 },
    panel: { x: 650, y: 10, ancho: 610, alto: 700, radio: 10 },
    titulo: { x: 20 + (100 + 385) / 2 * (700 / 559), y: 10 + (72 + 108) / 2 * (700 / 559) },
    areaTexto: { x: 20 + 30 * (700 / 559), y: 10 + 118 * (700 / 559), ancho: (453 - 30) * (700 / 559), alto: (310 - 118) * (700 / 559) },
    graficaH: { x: 20 + 38 * (700 / 559), y: 10 + 322 * (700 / 559), ancho: (233 - 38) * (700 / 559), alto: (482 - 322) * (700 / 559) },
    graficaV: { x: 20 + 250 * (700 / 559), y: 10 + 322 * (700 / 559), ancho: (445 - 250) * (700 / 559), alto: (482 - 322) * (700 / 559) },
    descarga: { x: 20 + 200 * (700 / 559), y: 10 + 498 * (700 / 559), ancho: (282 - 200) * (700 / 559), alto: (524 - 498) * (700 / 559) },
    resultado: { x: 20 + 38 * (700 / 559), y: 10 + 124 * (700 / 559), ancho: (453 - 38) * (700 / 559) },
    metricasHeading: { x: 20 + 38 * (700 / 559), y: 10 + 160 * (700 / 559) },
    metricas: { x: 20 + 38 * (700 / 559), y: 10 + 186 * (700 / 559), ancho: (453 - 38) * (700 / 559) },
    rightTitle: { x: 680, y: 32 }, modelo: { x: 680, y: 78, ancho: 550, alto: 190 },
    explicacion: { x: 680, y: 218, ancho: 550, alto: 330 },
    volver: { x: 976, y: 590, ancho: 250, alto: 46 },
    franjaCsv: { x: 680, y: 654, ancho: 550, alto: 30 },
    encabezadosCsv: { x: 680, y: 660 },
  },
  calibracion: { panel: { x: 230, y: 160, ancho: 820, alto: 410, radio: 10 }, texto: { x: 290, y: 245, ancho: 700, alto: 180 }, boton: { x: 520, y: 500, ancho: 240, alto: 44 } },
  arranque: { panel: { x: 350, y: 260, ancho: 580, alto: 200, radio: 10 }, titulo: { x: 470, y: 295 }, barra: { x: 420, y: 385, ancho: 440, alto: 18 } },
});

export function obtenerCajasTanques(cantidad) {
  const config = LAYOUT.simulacion;
  const medidas = cantidad === 2 ? [config.tanque1Cascada, config.tanque2Cascada] : [config.tanqueSolo];
  return medidas.map(({ centroX, baseY, alto }) => {
    const ancho = alto * (215 / 300);
    return { x: centroX - ancho / 2, y: baseY - alto, w: ancho, h: alto };
  });
}
