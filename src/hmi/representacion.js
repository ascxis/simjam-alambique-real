// Conversión de variables del modelo en parámetros visuales (mapa "variable del modelo ->
// representación" de docs/recursos.md). Funciones puras: no importan Phaser ni escriben
// en el modelo, así se prueban con node --test y la imagen no agrega retardo.

/** Mapeo lineal con saturación: valor en [min, max] -> [salidaMin, salidaMax]. */
export function mapear(valor, min, max, salidaMin = 0, salidaMax = 1) {
  if (!Number.isFinite(valor) || max === min) return salidaMin;
  const u = Math.min(1, Math.max(0, (valor - min) / (max - min)));
  return salidaMin + (salidaMax - salidaMin) * u;
}

/** Interpolación de color entre dos enteros 0xRRGGBB (u en 0..1, saturado). */
export function interpolarColor(colorA, colorB, u) {
  const t = Math.min(1, Math.max(0, Number.isFinite(u) ? u : 0));
  const canal = (c, s) => (c >> s) & 0xff;
  const mezcla = (s) => Math.round(canal(colorA, s) + (canal(colorB, s) - canal(colorA, s)) * t);
  return (mezcla(16) << 16) | (mezcla(8) << 8) | mezcla(0);
}

/** Umbral con histéresis: se activa al llegar a 'entra' y se apaga por debajo de 'sale'. */
export class UmbralHisteresis {
  constructor(entra, sale) {
    if (!(sale < entra)) throw new Error('La salida de la histéresis debe ser menor que la entrada');
    this.entra = entra; this.sale = sale; this.activo = false;
  }
  actualizar(valor) {
    this.activo = this.activo ? valor >= this.sale : valor >= this.entra;
    return this.activo;
  }
  reiniciar() { this.activo = false; }
}

// Límites de docs/niveles.md (alambique de 3,0 m de alto).
export const LIMITES = Object.freeze({ hMax: 3.0, H: 2.4, H_sale: 2.3, HH: 2.8, HH_sale: 2.7, desborde: 3.0 });

/** Fracción visible del líquido en el visor (setCrop según h/h_max). */
export const fraccionLiquido = (h) => mapear(h, 0, LIMITES.hMax, 0, 1);

/** Giro del volante en radianes según la apertura real del actuador (0..1 -> 0..270°). */
export const giroVolante = (v) => mapear(v, 0, 1, 0, Math.PI * 1.5);

/** Velocidad de la animación "funcionando" proporcional al caudal de entrada (0.5 a 2). */
export const velocidadFuncionando = (qin, qinMax = 0.4) => mapear(qin, 0, qinMax, 0.5, 2);

/** Color de la franja de nivel: neutro, ámbar en H y rojo en HH. */
export function colorNivel(h) {
  if (h >= LIMITES.HH) return 0xff1744;
  if (h >= LIMITES.H) return 0xffb300;
  return 0x6fae7a;
}
