import test from 'node:test';
import assert from 'node:assert/strict';
import { EntradaGestos } from '../src/entrada/gestos.js';

// Mano sintética en coordenadas de la imagen SIN espejar (como las entrega MediaPipe):
// centro de la palma (cx, cy), tamaño de palma 0,12 (distancia 0-9) y pellizco = dist(4,8)/0,12.
function mano(cx, cy, etiqueta, pellizco = 1) {
  const p = Array.from({ length: 21 }, () => ({ x: cx, y: cy }));
  p[0] = { x: cx, y: cy + 0.06 }; p[9] = { x: cx, y: cy - 0.06 };
  p[5] = { x: cx - 0.03, y: cy - 0.03 }; p[13] = { x: cx + 0.03, y: cy - 0.03 }; p[17] = { x: cx, y: cy + 0.06 };
  p[4] = { x: cx - 0.06, y: cy - 0.1 }; p[8] = { x: cx - 0.06 + 0.12 * pellizco, y: cy - 0.1 };
  return { puntos: p, etiqueta };
}
const nuevo = (opciones = {}) => { const g = new EntradaGestos(); g.asignacion = 'posicion'; Object.assign(g, opciones); return g; };
let reloj = 1000; const t = () => (reloj += 33);
// Mueve la mano de forma gradual (máx. 0,04 de la imagen por cuadro, como una mano real a 30 FPS).
function barrer(g, cx, de, a, etiquetas, extra = []) {
  let c; const n = Math.max(1, Math.ceil(Math.abs(a - de) / 0.04));
  for (let i = 0; i <= n; i++) c = g.procesar({ manos: [mano(cx, de + (a - de) * i / n, etiquetas(i)), ...extra], tiempo: t() });
  for (let i = 0; i < 12; i++) c = g.procesar({ manos: [mano(cx, a, etiquetas(i)), ...extra], tiempo: t() });
  return c;
}

test('niveles 1-2: la mano derecha controla v1 aunque MediaPipe la etiquete "izq" (etiqueta invertida)', () => {
  const g = nuevo({ modoUnaMano: true });
  let c;
  c = barrer(g, 0.3, 0.2, 0.2, () => 'izq');
  assert.equal(c.der.presente, true); assert.equal(c.izq.presente, false);
  assert.ok(c.der.altura > 0.85, `mano arriba debe dar altura alta (${c.der.altura})`);
  c = barrer(g, 0.3, 0.2, 0.8, (i) => (i % 2 ? 'der' : 'izq')); // la etiqueta cambia sola de un cuadro a otro
  assert.ok(c.der.altura < 0.15, `mano abajo debe dar altura baja (${c.der.altura})`);
});

test('altura sube de forma monótona al subir la mano y no depende de la etiqueta', () => {
  const g = nuevo({ modoUnaMano: true }); const valores = [];
  valores.push(barrer(g, 0.5, 0.9, 0.9, () => 'der').der.altura);
  for (let k = 1; k <= 10; k++) valores.push(barrer(g, 0.5, 0.9 - (k - 1) * 0.08, 0.9 - k * 0.08, (i) => (i % 2 ? 'izq' : 'der')).der.altura);
  for (let i = 1; i < valores.length; i++) assert.ok(valores[i] > valores[i - 1] - 1e-9, `no monótona: ${valores.map((v) => v.toFixed(2))}`);
  assert.ok(valores.at(-1) - valores[0] > 0.9);
});

test('dos manos con la MISMA etiqueta ya no se pisan: se separan por posición', () => {
  const g = nuevo(); let c;
  for (let i = 0; i < 15; i++) c = g.procesar({ manos: [mano(0.3, 0.2, 'der'), mano(0.7, 0.8, 'der')], tiempo: t() });
  assert.equal(c.der.presente, true); assert.equal(c.izq.presente, true);
  assert.ok(c.der.altura > 0.85, 'la mano de la derecha de la pantalla (x=0.3 sin espejar) está arriba');
  assert.ok(c.izq.altura < 0.15);
});

test('nivel 3: pellizco de la mano izquierda se lee en izq y no en der', () => {
  const g = nuevo(); let c;
  for (let i = 0; i < 15; i++) c = g.procesar({ manos: [mano(0.3, 0.5, 'izq', 1), mano(0.7, 0.5, 'der', 0.1)], tiempo: t() });
  assert.ok(c.der.pellizco > 0.9, `der abierta (${c.der.pellizco})`);
  assert.ok(c.izq.pellizco < 0.2, `izq cerrada (${c.izq.pellizco})`);
});

test('con la segunda mano en cuadro, v1 sigue la misma mano y no salta a la otra', () => {
  const g = nuevo({ modoUnaMano: true }); let c;
  for (let i = 0; i < 15; i++) c = g.procesar({ manos: [mano(0.3, 0.3, 'der')], tiempo: t() });
  const antes = c.der.altura;
  for (let i = 0; i < 30; i++) c = g.procesar({ manos: [mano(0.3, 0.3, 'der'), mano(0.7, 0.85, 'izq')], tiempo: t() });
  assert.ok(Math.abs(c.der.altura - antes) < 0.05, `v1 saltó a la otra mano (${antes} → ${c.der.altura})`);
  // si la mano seguida sale y solo queda la lejana, no se adopta de golpe
  for (let i = 0; i < 5; i++) c = g.procesar({ manos: [mano(0.7, 0.85, 'izq')], tiempo: t() });
  assert.ok(Math.abs(c.der.altura - antes) < 0.05, 'no debe adoptar la mano lejana de golpe');
});

test('"Intercambiar derecha/izquierda" invierte la asignación por posición', () => {
  const g = nuevo(); let c;
  for (let i = 0; i < 15; i++) c = g.procesar({ manos: [mano(0.3, 0.2, 'der'), mano(0.7, 0.8, 'izq')], tiempo: t(), intercambiar: true });
  assert.ok(c.izq.altura > 0.85); assert.ok(c.der.altura < 0.15);
});

test('una mano fuera de la zona de control (80 % central) se ignora', () => {
  const g = nuevo({ modoUnaMano: true });
  const c = g.procesar({ manos: [mano(0.05, 0.5, 'der')], tiempo: t() });
  assert.equal(c.der.presente, false);
});
