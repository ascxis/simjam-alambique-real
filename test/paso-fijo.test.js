// Robustez del paso fijo (etapa 8 y sección 5.7 a): el bucle del juego reparte el tiempo
// real de cada cuadro en trozos de máximo 0,1 s y el integrador avanza con h = 1/120 s.
// Con 60, 30, 15 FPS (CPU lenta) o cuadros irregulares, la respuesta al escalón debe dar
// las mismas métricas que la línea base (valor final < 0,5 %, t. de subida < 2 %, Mp < 1 pt).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearSistemaTanques, PARAMETROS_TANQUES } from '../src/modelo/tanques.js';
import { Actuador } from '../src/modelo/actuador.js';
import { Registro } from '../src/modelo/registro.js';

function leerCsv(url) {
  const filas = readFileSync(url, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/);
  const col = Object.fromEntries(filas[0].split(',').map((n, i) => [n, i]));
  return filas.slice(1).map((f) => { const c = f.split(','); return { t: +c[col.t], u: +c[col.u], y: +c[col.y] }; });
}

// Mismo cálculo que analisis/regresion.py
function metricas(m) {
  const k0 = m.findIndex((r) => Math.abs(r.u - m[0].u) > 1e-9);
  const y0 = m[Math.max(k0 - 1, 0)].y;
  const cola = m.slice(-Math.max(1, Math.floor(m.length / 10)));
  const yf = cola.reduce((s, r) => s + r.y, 0) / cola.length;
  const yn = m.slice(k0).map((r) => ({ t: r.t, v: (r.y - y0) / (yf - y0) }));
  const cruce = (nivel) => { const k = yn.findIndex((r) => r.v >= nivel); const a = yn[k - 1], b = yn[k]; return a.t + (nivel - a.v) / (b.v - a.v) * (b.t - a.t); };
  return { yf, tr: cruce(0.9) - cruce(0.1), mp: Math.max(0, Math.max(...yn.map((r) => r.v)) - 1) * 100 };
}

/** Reproduce el bucle de Simulacion.actualizarCuadro con ?control=escalon. */
function partidaEscalon(siguienteDt, duracion = 120) {
  const h0 = 1.5;
  const sistema = crearSistemaTanques({ tanques: 1, estadoInicial: [h0] });
  const actuador = new Actuador({ velocidadMaxima: PARAMETROS_TANQUES.velocidadMaximaValvula, inicial: 0.2 * Math.sqrt(h0) / 0.4 });
  const registro = new Registro({ encabezados: ['t', 'u_crudo', 'u', 'x1', 'x2', 'y'] });
  let tEntrada = 0, tAnterior = 0, subpasosMax = 0;
  const filas = [];
  while (sistema.t < duracion) {
    const dt = siguienteDt();
    tEntrada += dt;
    const mando = tEntrada >= 2 ? 0.622372 : 0.612372; // GestorEntrada en modo escalón
    const antes = sistema.t;
    let restante = dt;
    while (restante > 1e-9) {
      const paso = Math.min(restante, 0.1);
      const v1 = actuador.avanzar(mando, paso);
      sistema.avanzar([v1, 1, 0], paso);
      restante -= paso;
    }
    subpasosMax = Math.max(subpasosMax, Math.round((sistema.t - antes) / sistema.paso));
    registro.reloj += Math.max(0, sistema.t - tAnterior); tAnterior = sistema.t;
    if (registro.reloj + 1e-9 >= registro.periodo) { registro.reloj %= registro.periodo; filas.push({ t: sistema.t, u: actuador.salida(), y: sistema.x[0] }); }
  }
  return { filas, subpasosMax };
}

const base = metricas(leerCsv(new URL('../docs/linea_base_escalon.csv', import.meta.url)));
let semilla = 7;
const azar = () => { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; };
const escenarios = {
  '60 FPS': () => 1 / 60,
  '30 FPS (límite con cámara lenta)': () => 1 / 30,
  '15 FPS (CPU 4x más lenta)': () => 1 / 15,
  'cuadros irregulares de 8 a 120 ms': () => 0.008 + 0.112 * azar(),
  'tirón de 0,5 s (pestaña en segundo plano)': (() => { let n = 0; return () => (++n % 200 === 0 ? 0.5 : 1 / 60); })(),
};

for (const [nombre, dt] of Object.entries(escenarios)) {
  test(`paso fijo: la respuesta al escalón no depende de los FPS (${nombre})`, () => {
    const { filas, subpasosMax } = partidaEscalon(dt);
    const m = metricas(filas);
    const eYf = Math.abs(m.yf - base.yf) / Math.abs(base.yf) * 100;
    const eTr = Math.abs(m.tr - base.tr) / base.tr * 100;
    const eMp = Math.abs(m.mp - base.mp);
    assert.ok(eYf < 0.5, `valor final ${eYf.toFixed(3)} %`);
    assert.ok(eTr < 2, `tiempo de subida ${eTr.toFixed(3)} %`);
    assert.ok(eMp < 1, `sobreimpulso ${eMp.toFixed(3)} puntos`);
    assert.ok(subpasosMax <= 61, `máximo ${subpasosMax} subpasos por cuadro (tope 0,1 s por trozo y 0,5 s por cuadro)`);
  });
}
