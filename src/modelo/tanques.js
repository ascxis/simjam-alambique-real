import { SistemaContinuo } from './sistema.js';

export const PARAMETROS_TANQUES = Object.freeze({
  area: 1,
  coeficienteDescarga1: 0.2,
  coeficienteDescarga2: 0.2,
  caudalEntradaMaximo: 0.4,
  alturaMaxima: 3,
  velocidadMaximaValvula: 0.25
});

// Entrada u = [v1, v2, q_d]; el caudal de perturbación se resta al último tanque.
export function derivadasTanques(x, u, _t, p) {
  const v1 = Math.max(0, Math.min(1, u?.[0] ?? 0));
  const v2 = Math.max(0, Math.min(1, u?.[1] ?? 0));
  const qd = u?.[2] ?? 0;
  const h1 = Math.max(0, x[0] ?? 0), q12 = p.coeficienteDescarga1 * Math.sqrt(h1);
  let dh1 = (p.caudalEntradaMaximo * v1 - q12 - (p.tanques === 1 ? qd : 0)) / p.area;
  if (h1 === 0 && dh1 < 0) dh1 = 0;
  if (p.tanques === 1) return [dh1];
  const h2 = Math.max(0, x[1] ?? 0);
  let dh2 = (q12 - p.coeficienteDescarga2 * v2 * Math.sqrt(h2) - qd) / p.area;
  if (h2 === 0 && dh2 < 0) dh2 = 0;
  return [dh1, dh2];
}

export function crearSistemaTanques(nivel) {
  const p = { ...PARAMETROS_TANQUES, tanques: nivel.tanques };
  return new SistemaContinuo({ f: derivadasTanques, p, x0: [...nivel.estadoInicial], metodo: 'rk4', paso: 1 / 120 });
}

export function constanteTiempoTanque(alturaOperacion, area = PARAMETROS_TANQUES.area, coeficiente = PARAMETROS_TANQUES.coeficienteDescarga1) {
  return 2 * area * Math.sqrt(Math.max(0, alturaOperacion)) / coeficiente;
}

export function gananciaTanque(alturaOperacion, coeficiente = PARAMETROS_TANQUES.coeficienteDescarga1) {
  return 2 * Math.sqrt(Math.max(0, alturaOperacion)) / coeficiente;
}
