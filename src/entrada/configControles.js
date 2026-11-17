// Configuración de controles de teclado y gamepad (guardada en localStorage).
// Cada acción del juego tiene un control por defecto que el jugador puede cambiar.
const CLAVE = 'alambique.controles.v1';

export const ACCIONES = Object.freeze([
  { id: 'subirV1', texto: 'Subir la válvula de entrada v1', ayuda: 'Abre más la válvula: sube el nivel' },
  { id: 'bajarV1', texto: 'Bajar la válvula de entrada v1', ayuda: 'Cierra la válvula: baja el nivel' },
  { id: 'abrirV2', texto: 'Abrir la válvula de salida v2', ayuda: 'Solo en el nivel 3 (cascada)' },
  { id: 'cerrarV2', texto: 'Cerrar la válvula de salida v2', ayuda: 'Solo en el nivel 3 (cascada)' },
  { id: 'pausa', texto: 'Pausar / reanudar', ayuda: 'Detiene la simulación' },
  { id: 'terminar', texto: 'Terminar la partida', ayuda: 'Ver "Lo que pasó en el modelo"' }
]);

// Teclas que el juego usa para otras cosas y no se pueden reasignar.
export const TECLAS_RESERVADAS = Object.freeze({ KeyP: 'panel de parámetros', KeyD: 'depuración', KeyM: 'silencio' });

export const POR_DEFECTO = Object.freeze({
  teclado: Object.freeze({ subirV1: 'ArrowUp', bajarV1: 'ArrowDown', abrirV2: 'KeyE', cerrarV2: 'KeyQ', pausa: 'Enter', terminar: 'KeyF' }),
  gamepad: Object.freeze({
    subirV1: Object.freeze({ tipo: 'eje', indice: 3, dir: -1, base: 0 }),
    bajarV1: Object.freeze({ tipo: 'eje', indice: 3, dir: 1, base: 0 }),
    abrirV2: Object.freeze({ tipo: 'boton', indice: 7 }),
    cerrarV2: Object.freeze({ tipo: 'boton', indice: 6 }),
    pausa: Object.freeze({ tipo: 'boton', indice: 9 }),
    terminar: Object.freeze({ tipo: 'boton', indice: 3 })
  })
});

const copiar = (o) => JSON.parse(JSON.stringify(o));

function valida(origen, b) {
  if (origen === 'teclado') return typeof b === 'string' && b.length > 0;
  return b && (b.tipo === 'boton' || b.tipo === 'eje') && Number.isInteger(b.indice) && b.indice >= 0 && b.indice < 32
    && (b.tipo === 'boton' || b.dir === 1 || b.dir === -1 || (b.discreto === true && Number.isFinite(b.pico)));
}

export function cargarConfig() {
  const cfg = copiar(POR_DEFECTO);
  try {
    const guardado = JSON.parse(globalThis.localStorage?.getItem(CLAVE) || '{}');
    for (const origen of ['teclado', 'gamepad']) for (const { id } of ACCIONES) {
      if (valida(origen, guardado?.[origen]?.[id])) cfg[origen][id] = guardado[origen][id];
    }
  } catch {}
  return cfg;
}

export function guardarConfig(cfg) {
  try { globalThis.localStorage?.setItem(CLAVE, JSON.stringify(cfg)); } catch {}
}

export function restablecerConfig(origen) {
  const cfg = cargarConfig();
  cfg[origen] = copiar(POR_DEFECTO[origen]);
  guardarConfig(cfg);
  return cfg;
}

export function mismoControl(a, b) {
  if (typeof a === 'string') return a === b;
  if (!a || !b || a.tipo !== b.tipo || a.indice !== b.indice) return false;
  if (a.tipo === 'boton') return true;
  if (a.discreto || b.discreto) return Boolean(a.discreto && b.discreto && Math.abs(a.pico - b.pico) < 0.05);
  return a.dir === b.dir;
}

// Asigna `control` a `accion`; si otra acción ya lo usaba, intercambian controles.
export function asignarControl(cfg, origen, accion, control) {
  const previo = cfg[origen][accion];
  const otra = ACCIONES.find((a) => a.id !== accion && mismoControl(cfg[origen][a.id], control));
  if (otra) cfg[origen][otra.id] = previo;
  cfg[origen][accion] = control;
  return otra?.id ?? null;
}

export function nombreTecla(codigo) {
  const especiales = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Space: 'Espacio', Enter: 'Enter', ShiftLeft: 'Shift izq.', ShiftRight: 'Shift der.', Backspace: 'Retroceso', Tab: 'Tab' };
  if (especiales[codigo]) return especiales[codigo];
  if (/^Key[A-Z]$/.test(codigo)) return codigo.slice(3);
  if (/^Digit\d$/.test(codigo)) return codigo.slice(5);
  if (/^Numpad/.test(codigo)) return `Num ${codigo.slice(6)}`;
  return codigo;
}

const BOTONES_ESTANDAR = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Select', 'Start', 'Stick izq. (clic)', 'Stick der. (clic)', 'Cruceta ↑', 'Cruceta ↓', 'Cruceta ←', 'Cruceta →'];
const EJES_ESTANDAR = ['Stick izq. horizontal', 'Stick izq. vertical', 'Stick der. horizontal', 'Stick der. vertical'];

export function nombreGamepad(b) {
  if (!b) return '—';
  if (b.tipo === 'boton') return `Botón ${b.indice}${BOTONES_ESTANDAR[b.indice] ? ` (${BOTONES_ESTANDAR[b.indice]})` : ''}`;
  if (b.discreto) return `Cruceta ${direccionCruceta(b.pico)} (eje ${b.indice})`;
  const flecha = b.indice % 2 === 1 ? (b.dir < 0 ? '↑' : '↓') : (b.dir < 0 ? '←' : '→');
  return `Eje ${b.indice} ${flecha}${EJES_ESTANDAR[b.indice] ? ` (${EJES_ESTANDAR[b.indice]})` : ''}`;
}

// Algunas cruceta se reportan como UN eje que toma valores fijos (arriba = -1, abajo ≈ 0,14, ...).
const VALORES_CRUCETA = [-1, -0.714, -0.428, -0.143, 0.143, 0.428, 0.714, 1];
const FLECHAS_CRUCETA = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
function direccionCruceta(valor) {
  let mejor = 0;
  VALORES_CRUCETA.forEach((v, i) => { if (Math.abs(v - valor) < Math.abs(VALORES_CRUCETA[mejor] - valor)) mejor = i; });
  return FLECHAS_CRUCETA[mejor];
}

export function nombreControl(origen, b) { return origen === 'teclado' ? nombreTecla(b) : nombreGamepad(b); }

// Valor 0..1 de un control del gamepad (botón o dirección de un eje).
export function valorControlGamepad(b, gp) {
  if (!b || !gp) return 0;
  if (b.tipo === 'boton') {
    const boton = gp.buttons?.[b.indice];
    const v = boton ? (Number.isFinite(boton.value) && boton.value > 0 ? boton.value : (boton.pressed ? 1 : 0)) : 0;
    return v > 0.1 ? v : 0;
  }
  const valorEje = gp.axes?.[b.indice] ?? 0;
  // Eje discreto (cruceta como eje único): activo solo cerca del valor que tenía al configurarlo.
  if (b.discreto) return Math.abs(valorEje - b.pico) < 0.1 ? 1 : 0;
  const v = (valorEje - (b.base || 0)) * b.dir;
  return v > 0.15 ? Math.min(1, (v - 0.15) / 0.85) : 0;
}

export function elegirGamepad() {
  const lista = [...(globalThis.navigator?.getGamepads?.() || [])].filter((g) => g && g.connected !== false);
  return lista.find((g) => g.mapping === 'standard') || lista[0] || null;
}

// Estado de reposo del gamepad (botones sueltos y ejes en su valor neutro) para detectar qué se pulsa después.
export function reposoGamepad(gp) {
  return { botones: (gp?.buttons || []).map((b) => b.pressed || b.value > .5), ejes: [...(gp?.axes || [])] };
}

// Devuelve el control que el jugador acaba de pulsar o mover (o null si todavía no hizo nada).
export function detectarPulsacion(gp, reposo) {
  if (!gp) return null;
  const i = gp.buttons.findIndex((b, k) => (b.pressed || b.value > .5) && !reposo.botones[k]);
  if (i >= 0) return { tipo: 'boton', indice: i };
  const e = gp.axes.findIndex((v, k) => Math.abs(v - (reposo.ejes[k] ?? 0)) > .7);
  if (e < 0) return null;
  const base = reposo.ejes[e] ?? 0, valor = gp.axes[e];
  // Reposo fuera de [-1, 1] (p. ej. 3,29): es una cruceta de un solo eje; se guarda el valor exacto de cada dirección.
  if (Math.abs(base) > 1.1) return { tipo: 'eje', indice: e, discreto: true, base, pico: Number(valor.toFixed(3)) };
  return { tipo: 'eje', indice: e, dir: Math.sign(valor - base) || 1, base: Math.abs(base) > .5 ? base : 0 };
}
