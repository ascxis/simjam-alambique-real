// Escenario (etapa 5) y rendimiento, atlas y tamaño de la entrega (etapa 8).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MATRIZ_LABORATORIO, validarMatriz, DECORACIONES_NIVEL, POLVO_MAXIMO, PROFUNDIDAD, CAPAS_FONDO, CERCANA_NIVEL, ZONAS_MODELO_NIVEL } from '../src/juego/niveles/escenario.js';
import { debeReducir, limitarFps, intervaloLimite } from '../src/juego/rendimiento.js';
import { leerPng, empaquetar } from '../scripts/crear-atlas.mjs';

const raiz = fileURLToPath(new URL('..', import.meta.url));

test('escenario: matriz de baldosas válida para la hoja 8x4 y decoraciones por nivel', () => {
  assert.ok(validarMatriz(MATRIZ_LABORATORIO));
  assert.equal(MATRIZ_LABORATORIO[0].length * 32, 640, 'cubre el ancho de la planta');
  for (const id of [1, 2, 3]) {
    const decos = DECORACIONES_NIVEL[id];
    assert.ok(decos.length >= 1 && decos.some((d) => d.deco === 'vela'), `nivel ${id}: al menos una decoración animada`);
    for (const d of decos) assert.ok(d.x - d.tam / 2 >= 16 && d.x + d.tam / 2 <= 645, `nivel ${id}: ${d.deco} dentro de la planta, sin tapar la HMI`);
  }
  assert.ok(POLVO_MAXIMO <= 30);
  const orden = [PROFUNDIDAD.fondo, PROFUNDIDAD.fondoMedio, PROFUNDIDAD.baldosas, PROFUNDIDAD.decoraciones, PROFUNDIDAD.ambiente, PROFUNDIDAD.polvo, PROFUNDIDAD.efectos, PROFUNDIDAD.primerPlano, PROFUNDIDAD.hmi];
  assert.deepEqual([...orden].sort((a, b) => a - b), orden, 'lejana < media < baldosas < decoraciones < ... < efectos < cercana < HMI');
});

test('fondo: tres capas de 1280x720 y la capa cercana no tapa ninguna pieza del modelo', () => {
  for (const capa of Object.values(CAPAS_FONDO)) {
    const png = leerPng(readFileSync(join(raiz, 'public', capa.archivo)));
    assert.deepEqual([png.ancho, png.alto], [1280, 720], capa.archivo);
  }
  const P = { x: 20, y: 80, ancho: 620, alto: 570 }; // planta, desde el borde de la barra superior
  const choca = (a, b) => a.x < b.x + b.ancho && b.x < a.x + a.ancho && a.y < b.y + b.alto && b.y < a.y + a.alto;
  for (const id of [1, 2, 3]) {
    assert.ok(CERCANA_NIVEL[id].length >= 1, `nivel ${id}: usa la capa cercana`);
    assert.ok(ZONAS_MODELO_NIVEL[id].length >= 8, `nivel ${id}: zonas del modelo definidas`);
    for (const { recorte: r, destino: d } of CERCANA_NIVEL[id]) {
      assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.ancho <= 1280 && r.y + r.alto <= 720, `nivel ${id}: recorte dentro de la imagen`);
      const caja = { x: d.x, y: d.y, ancho: r.ancho, alto: r.alto };
      assert.ok(caja.x >= P.x && caja.y >= P.y && caja.x + caja.ancho <= P.x + P.ancho && caja.y + caja.alto <= P.y + P.alto, `nivel ${id}: trozo dentro de la planta`);
      for (const z of ZONAS_MODELO_NIVEL[id]) assert.ok(!choca(caja, z), `nivel ${id}: la capa cercana tapa "${z.nombre}"`);
    }
  }
});

test('atlas: piezas.json apunta a cuadros dentro de piezas.png sin solaparse', () => {
  const atlas = JSON.parse(readFileSync(join(raiz, 'public/assets/sprites/piezas.json'), 'utf8'));
  const png = leerPng(readFileSync(join(raiz, 'public/assets/sprites/piezas.png')));
  const cuadros = Object.entries(atlas.frames);
  for (const nombre of ['valvula-cuerpo', 'valvula-volante', 'alarma-placa', 'alarma-runa', 'caldero-real', 'deco-vela-0', 'deco-frasco-3', 'deco-engranaje-2']) assert.ok(atlas.frames[nombre], nombre);
  for (const [n, { frame: f }] of cuadros) assert.ok(f.x >= 0 && f.y >= 0 && f.x + f.w <= png.ancho && f.y + f.h <= png.alto, `${n} dentro del atlas`);
  for (let i = 0; i < cuadros.length; i++) for (let j = i + 1; j < cuadros.length; j++) {
    const a = cuadros[i][1].frame, b = cuadros[j][1].frame;
    assert.ok(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y, `${cuadros[i][0]} y ${cuadros[j][0]} no se solapan`);
  }
  const p = empaquetar([{ nombre: 'a', ancho: 300, alto: 10 }, { nombre: 'b', ancho: 300, alto: 20 }], 512, 2);
  assert.ok(p.piezas[1].y >= 22, 'empaquetado por estantes');
});

test('rendimiento: reduce efectos solo si la detección lleva 5 s bajo 20 FPS', () => {
  assert.equal(debeReducir({ camaraActiva: true, fpsDeteccion: 14, msActiva: 6000 }), true);
  assert.equal(debeReducir({ camaraActiva: true, fpsDeteccion: 14, msActiva: 2000 }), false);
  assert.equal(debeReducir({ camaraActiva: true, fpsDeteccion: 24, msActiva: 9000 }), false);
  assert.equal(debeReducir({ camaraActiva: false, fpsDeteccion: 5, msActiva: 9000 }), false);
  const llamadas = [];
  const game = { loop: { fpsLimit: 60, sleep: () => llamadas.push('sleep'), wake: () => llamadas.push('wake') } };
  assert.equal(limitarFps(game, 30), true);
  assert.deepEqual([game.loop.fpsLimit, game.loop.hasFpsLimit, game.loop._limitRate], [30, true, intervaloLimite(30)]);
  assert.deepEqual(llamadas, ['sleep', 'wake']);
  assert.equal(limitarFps(game, 30), false);
  // Al arrancar Phaser deja fpsLimit = 60 con el umbral exacto: limitarFps debe aplicar el margen.
  const recien = { loop: { fpsLimit: 60, _limitRate: 1000 / 60, sleep() {}, wake() {} } };
  assert.equal(limitarFps(recien, 60), true);
  assert.equal(recien.loop._limitRate, intervaloLimite(60));
});

// Reproduce TimeStep.stepLimitFPS de Phaser 3.87: acumula el tiempo de cada requestAnimationFrame y
// dibuja cuando llega al umbral, dejando el acumulado en 0. Marcas de vsync con ±0,05 ms de ruido.
function cuadrosPorSegundo(hz, umbralMs, segundos = 20) {
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647) - 0.5;
  let ultimo = 0, acumulado = 0, cuadros = 0;
  for (let k = 1; k <= hz * segundos; k++) {
    const t = (k * 1000) / hz + azar() * 0.1;
    acumulado += Math.max(0, t - ultimo); ultimo = t;
    if (acumulado >= umbralMs) { cuadros++; acumulado = 0; }
  }
  return cuadros / segundos;
}

test('rendimiento: el límite de 60 FPS da 60 en pantallas de 60, 120 y 180 Hz (con el margen)', () => {
  for (const hz of [60, 120, 180]) {
    assert.ok(cuadrosPorSegundo(hz, 1000 / 60) < 56, `${hz} Hz con el umbral exacto de Phaser pierde cuadros`);
    const conMargen = cuadrosPorSegundo(hz, intervaloLimite(60));
    assert.ok(conMargen >= 59.5 && conMargen <= 60.5, `${hz} Hz con margen: ${conMargen} FPS`);
  }
  assert.ok(cuadrosPorSegundo(144, intervaloLimite(60)) <= 60, '144 Hz no pasa de 60');
  const reducido = cuadrosPorSegundo(180, intervaloLimite(30));
  assert.ok(reducido >= 29.5 && reducido <= 30.5, `modo reducido a 180 Hz: ${reducido} FPS`);
});

function tamano(dir) {
  return readdirSync(dir).reduce((s, f) => { const r = join(dir, f), st = statSync(r); return s + (st.isDirectory() ? tamano(r) : st.size); }, 0);
}

test('tamaño: public/assets sin audio < 10 MB y audio < 8 MB', () => {
  const total = tamano(join(raiz, 'public/assets')), audio = tamano(join(raiz, 'public/assets/audio'));
  assert.ok((total - audio) / 2 ** 20 < 10, `assets sin audio: ${((total - audio) / 2 ** 20).toFixed(2)} MB`);
  assert.ok(audio / 2 ** 20 < 8, `audio: ${(audio / 2 ** 20).toFixed(2)} MB`);
});

test('rutas relativas: el código no carga recursos con rutas absolutas', () => {
  const archivos = [];
  const recorrer = (d) => readdirSync(d).forEach((f) => { const r = join(d, f); statSync(r).isDirectory() ? recorrer(r) : r.endsWith('.js') && archivos.push(r); });
  recorrer(join(raiz, 'src'));
  for (const archivo of archivos) {
    const texto = readFileSync(archivo, 'utf8');
    assert.ok(!/['"`]\/assets\//.test(texto), `${archivo} usa '/assets/' absoluta`);
  }
  const vite = readFileSync(join(raiz, 'vite.config.js'), 'utf8');
  assert.match(vite, /base:\s*'\.\/'/);
});
