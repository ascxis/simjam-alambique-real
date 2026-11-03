import test from 'node:test';
import assert from 'node:assert/strict';
import { rk4, euler } from '../src/modelo/integrador.js';
import { Actuador } from '../src/modelo/actuador.js';
import { GestorEntrada } from '../src/entrada/gestorEntrada.js';
import { Registro } from '../src/modelo/registro.js';
import { crearSistemaTanques } from '../src/modelo/tanques.js';
import { EntradaGestos } from '../src/entrada/gestos.js';
import { MAPA_CONTROL, leerSenalSiPresente } from '../src/juego/mapaControl.js';
import { readFileSync } from 'node:fs';

const simular = (integrador, f, x0, h, total) => { let x = x0, t = 0; while (t < total - h / 2) { x = integrador(f, x, 1, t, h); t += h; } return x[0]; };
test('RK4 reproduce sistema de primer orden K=2, tau=0.5 con escalón', () => {
  const f = ([y], u) => [(2 * u - y) / .5]; const exacta = 2 * (1 - Math.exp(-1 / .5));
  const errorRK4 = Math.abs(simular(rk4, f, [0], 1 / 120, 1) - exacta); const errorEuler = Math.abs(simular(euler, f, [0], 1 / 120, 1) - exacta);
  assert.ok(errorRK4 < 1e-4, `error RK4 = ${errorRK4}`); console.log(`Primer orden: error RK4=${errorRK4}, Euler=${errorEuler}`);
});
test('RK4 reproduce sistema de segundo orden zeta=0.3, wn=4 con escalón', () => {
  const f = ([y, v]) => [v, 16 * (1 - y) - 2 * .3 * 4 * v];
  const exacta = (t) => { const wd = 4 * Math.sqrt(1 - .3 ** 2); return 1 - Math.exp(-1.2 * t) * (Math.cos(wd * t) + 1.2 / wd * Math.sin(wd * t)); };
  let x = [0, 0], xEuler = [0, 0], max = 0, maxEuler = 0, h = 1 / 120;
  for (let i = 0; i <= 1200; i++) {
    const t = i * h;
    max = Math.max(max, Math.abs(x[0] - exacta(t)));
    maxEuler = Math.max(maxEuler, Math.abs(xEuler[0] - exacta(t)));
    x = rk4(f, x, 1, t, h);
    xEuler = euler(f, xEuler, 1, t, h);
  }
  assert.ok(max < 1e-4, `error máximo RK4 = ${max}`); console.log(`Segundo orden: error máximo RK4=${max}, Euler=${maxEuler}`);
});
test('Actuador respeta saturación y velocidad máxima', () => {
  const a = new Actuador({ minimo: 0, maximo: 1, velocidadMaxima: .25 });
  assert.equal(a.avanzar(3, 1), .25); assert.equal(a.avanzar(3, 1), .5); assert.equal(a.avanzar(-2, 10), 0);
});
test('el filtro de gestos usa alfa 0.5 por defecto', () => {
  assert.equal(new EntradaGestos().alfa, 0.5);
});
test('la fuente escalón entrega controles completos y cambia der.altura a los 2 s', () => {
  const entrada = new GestorEntrada({ fuente: 'escalon' });
  const antes = entrada.actualizar(1);
  assert.equal(antes.der.altura, 0.612372);
  for (const mano of [antes.der, antes.izq]) {
    assert.deepEqual(Object.keys(mano).sort(), ['altura', 'dedos', 'giro', 'medidaCruda', 'pellizco', 'presente', 'puno', 'u_crudo', 'x'].sort());
    for (const campo of ['altura', 'x', 'pellizco', 'giro']) {
      assert.ok(Number.isFinite(mano[campo]));
      assert.ok(Number.isFinite(mano.u_crudo[campo]));
      assert.ok(Number.isFinite(mano.medidaCruda[campo]));
    }
  }
  assert.equal(typeof antes.pausa, 'boolean');
  const despues = entrada.actualizar(1);
  assert.equal(despues.der.altura, 0.622372);
  assert.equal(despues.der.u_crudo.altura, 0.622372);
});
test('escalón de verificación: tanque se aproxima al nuevo equilibrio en 80 s', () => {
  const h0 = 1.5, vEquilibrio = 0.612372, vFinal = 0.622372, dt = 1 / 120;
  const sistema = crearSistemaTanques({ tanques: 1, estadoInicial: [h0] });
  const actuador = new Actuador({ velocidadMaxima: 0.25, inicial: 0.2 * Math.sqrt(h0) / 0.4 });
  const equilibrioFinal = (0.4 * vFinal / 0.2) ** 2;
  const umbral = h0 + .632 * (equilibrioFinal - h0);
  let tiempo63 = null, hAnterior = sistema.x[0], tAnterior = 0;
  for (let paso = 0; paso < 80 * 120; paso++) {
    const t = sistema.t;
    const mando = t < 2 ? vEquilibrio : vFinal;
    const v1 = actuador.avanzar(mando, dt);
    sistema.avanzar([v1, 1, 0], dt);
    const hActual = sistema.x[0], tActual = sistema.t;
    if (tiempo63 === null && tActual >= 2 && hAnterior < umbral && hActual >= umbral) {
      const fraccion = (umbral - hAnterior) / (hActual - hAnterior);
      tiempo63 = tAnterior + fraccion * (tActual - tAnterior) - 2;
    }
    hAnterior = hActual; tAnterior = tActual;
  }
  const final = sistema.x[0];
  assert.ok(Math.abs(final - 1.5494) < 0.01 * 1.5494, `h1(80 s)=${final} m`);
  assert.ok(Number.isFinite(tiempo63), 'el nivel cruza el 63,2 % del cambio');
  console.log(`Escalón de verificación: h1(80 s)=${final} m; t63,2=${tiempo63} s desde t=2 s`);
});
test('la cámara conserva cada consigna mientras su mano está fuera de zona', () => {
  const controles = {
    der: { presente: false, altura: 0 },
    izq: { presente: false, pellizco: 0 },
  };
  assert.equal(leerSenalSiPresente(controles, MAPA_CONTROL.v1, null, 0.548, true), 0.548);
  assert.equal(leerSenalSiPresente(controles, MAPA_CONTROL.v2, null, 1, true), 1);
  assert.equal(leerSenalSiPresente(controles, MAPA_CONTROL.v2, null, 1, false), 0);
  controles.izq.presente = true;
  controles.izq.pellizco = 0.73;
  assert.equal(leerSenalSiPresente(controles, MAPA_CONTROL.v2, null, 1, true), 0.73);
});
test('rangos guardados inválidos de altura y pellizco se ignoran con aviso', () => {
  const gestos = new EntradaGestos();
  gestos.calibracion = { der: { altura: { min: 0.4, max: 0.4 }, pellizco: { min: 0.1, max: 0.14 } } };
  const puntos = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5 }));
  puntos[0] = { x: 0.4, y: 0.6 };
  const avisos = [];
  const warnOriginal = console.warn;
  console.warn = (mensaje) => avisos.push(mensaje);
  try {
    const controles = gestos.procesar({ manos: [{ puntos, etiqueta: 'der' }], tiempo: 1000 });
    assert.equal(controles.der.presente, true);
    assert.ok(Math.abs(controles.der.u_crudo.altura - 0.475) < 1e-12);
    assert.equal(controles.der.u_crudo.altura, controles.der.medidaCruda.altura);
    assert.equal(controles.der.u_crudo.pellizco, controles.der.medidaCruda.pellizco);
  } finally { console.warn = warnOriginal; }
  assert.equal(avisos.length, 2);
});
test('x y giro siguen la imagen espejada y la calibración admite extremos invertidos', () => {
  const puntos = Array.from({ length: 21 }, () => ({ x: .3, y: .5 }));
  puntos[0] = { x: .4, y: .6 };
  puntos[9] = { x: .2, y: .4 };
  const gestos = new EntradaGestos();
  const controles = gestos.procesar({ manos: [{ puntos, etiqueta: 'der' }], tiempo: 1000 });
  assert.ok(controles.der.x > 0, 'la mano visible a la derecha da x positivo');
  assert.ok(controles.der.giro > 0, 'los dedos inclinados a la derecha visible dan giro positivo');

  const calibrados = new EntradaGestos();
  calibrados.calibracion = { der: { altura: { min: .8, max: .2 } } };
  const resultado = calibrados.procesar({ manos: [{ puntos, etiqueta: 'der' }], tiempo: 1000 });
  assert.ok(Number.isFinite(resultado.der.altura));
  assert.ok(resultado.der.u_crudo.altura > 0 && resultado.der.u_crudo.altura < 1, 'rango invertido conserva la escala en lugar de saturar');
});
test('el registro exporta CSV con coma, punto decimal y encabezados exactos', () => {
  const registro = new Registro({ frecuencia: 30, encabezados: ['t', 'u_crudo', 'u', 'x1', 'y'] });
  registro.agregar(1 / 30, { t: 2.5, u_crudo: 1, u: 0.75, x: [0.25], y: 0.25 });
  assert.equal(registro.csv(), 't,u_crudo,u,x1,y\n2.5,1,0.75,0.25,0.25');
});
test('la primera fila del CSV usa el mando inicial como u_crudo y u', () => {
  const registro = new Registro({ frecuencia: 30, encabezados: ['t', 'u_crudo', 'u', 'x1', 'y'] });
  const mandoInicial = 0.2 * Math.sqrt(0.5) / 0.4;
  registro.agregar(1 / 30, { t: 0, u_crudo: mandoInicial, u: mandoInicial, x: [0.5], y: 0.5 });
  const [encabezado, primeraFila] = registro.csv().split('\n');
  const columnas = encabezado.split(','), valores = primeraFila.split(',');
  assert.equal(valores[columnas.indexOf('u_crudo')], valores[columnas.indexOf('u')]);
});
test('el modelo de tanque coincide con el escalón Vensim hasta 20 s', () => {
  const lineas = readFileSync(new URL('../docs/vensim_escalon.csv', import.meta.url), 'utf8').trim().split(/\r?\n/);
  const separador = lineas[0].includes(',') ? ',' : ';';
  const columnas = lineas[0].split(separador).map((s) => s.trim());
  const indiceT = columnas.indexOf('t'), indiceH = columnas.indexOf('h1');
  assert.ok(indiceT >= 0 && indiceH >= 0, 'el CSV Vensim tiene columnas t y h1');
  const referencia = new Map(lineas.slice(1).map((linea) => {
    const campos = linea.split(separador).map((s) => s.trim());
    return [Math.round(Number(campos[indiceT]) * 100), Number(campos[indiceH])];
  }).filter(([t, h]) => Number.isFinite(t) && Number.isFinite(h)));

  const sistema = crearSistemaTanques({ tanques: 1, estadoInicial: [0.5] });
  const simuladas = new Map();
  const h = 1 / 120;
  for (let paso = 0; paso <= 20 * 120; paso++) {
    const tiempo = paso * h;
    if (paso % 6 === 0) simuladas.set(Math.round(tiempo * 100), sistema.x[0]);
    if (paso < 20 * 120) sistema.avanzar(tiempo < 2 ? [0, 1, 0] : [1, 1, 0], h);
  }

  const instantes = [...simuladas.keys()].filter((t) => referencia.has(t));
  assert.ok(instantes.length > 0, 'hay instantes comunes cada 0.05 s');
  let errorMaximo = 0;
  for (const t of instantes) {
    const modelo = simuladas.get(t);
    let vensim = referencia.get(t);
    // El CSV fuente omite el separador decimal tras el primer dígito para
    // algunos valores mayores que 1 (p. ej. 179.617 representa 1.79617).
    while (vensim > 4) vensim /= 10;
    errorMaximo = Math.max(errorMaximo, Math.abs(modelo - vensim));
  }
  const h20Modelo = simuladas.get(2000);
  let h20Vensim = referencia.get(2000);
  while (h20Vensim > 4) h20Vensim /= 10;
  console.log(`Tanque a 20 s: error máximo=${errorMaximo} m, modelo=${h20Modelo} m, Vensim=${h20Vensim} m`);
  assert.ok(errorMaximo < 1e-3, `error máximo modelo/Vensim = ${errorMaximo} m`);
});
