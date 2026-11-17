// Registro único de todas las animaciones del juego. Se llama una sola vez desde la escena
// de Arranque; las demás escenas solo reproducen las animaciones por su clave.

export const EQUIPOS = ['alambique_simple', 'alambique_cascada'];
// Estados de la hoja -> cuadros y velocidad base (docs/recursos.md).
export const HOJAS_EQUIPO = {
  reposo: { cuadros: 1, fps: 1, repetir: -1 },
  funcionando: { cuadros: 4, fps: 8, repetir: -1 },
  falla: { cuadros: 4, fps: 8, repetir: -1 },
  alarma: { cuadros: 2, fps: 4, repetir: -1 }, // 2 cuadros a 4 fps = parpadeo de 2 Hz
};
export const EFECTOS = { salpicadura: 5, vapor: 6, chispa: 4, polvo: 4, aparicion: 5, desborde: 6 };
export const DECORACIONES = { vela: 4, frasco: 4, engranaje: 4 };

export const claveEquipo = (equipo, hoja) => `${equipo}-${hoja}`;

/** Carga las hojas de estados del equipo (se llama en el preload de Arranque). */
export function cargarHojasEquipo(escena) {
  const tamanos = { alambique_simple: [215, 300], alambique_cascada: [395, 510] };
  for (const equipo of EQUIPOS) {
    const [frameWidth, frameHeight] = tamanos[equipo];
    for (const hoja of Object.keys(HOJAS_EQUIPO)) {
      escena.load.spritesheet(claveEquipo(equipo, hoja), `assets/sprites/equipo/${equipo}_${hoja}.png`, { frameWidth, frameHeight });
    }
  }
}

function crear(anims, config) {
  if (!anims.exists(config.key)) anims.create(config);
}

/** Registra todas las animaciones disponibles (las que falten se omiten: respaldo con figuras). */
export function registrarAnimaciones(escena) {
  const { anims, textures } = escena;
  for (const equipo of EQUIPOS) {
    for (const [hoja, cfg] of Object.entries(HOJAS_EQUIPO)) {
      const clave = claveEquipo(equipo, hoja);
      if (!textures.exists(clave)) continue;
      crear(anims, { key: clave, frames: anims.generateFrameNumbers(clave, { start: 0, end: cfg.cuadros - 1 }), frameRate: cfg.fps, repeat: cfg.repetir });
    }
  }
  // El volante y la runa siguen al modelo cuadro a cuadro: la animación solo marca el
  // estado "en servicio" y la escena aplica el giro o el parpadeo desde el estado.
  if (textures.exists('piezas')) {
    crear(anims, { key: 'valvula-en-servicio', frames: [{ key: 'piezas', frame: 'valvula-volante' }], frameRate: 1, repeat: -1 });
    crear(anims, { key: 'runa-alerta', frames: [{ key: 'piezas', frame: 'alarma-runa' }], frameRate: 1, repeat: -1 });
    for (const [deco, cuadros] of Object.entries(DECORACIONES)) {
      const frames = Array.from({ length: cuadros }, (_, i) => ({ key: 'piezas', frame: `deco-${deco}-${i}` }));
      if (frames.every((f) => textures.get('piezas').has(f.frame))) crear(anims, { key: `deco-${deco}`, frames, frameRate: deco === 'engranaje' ? 6 : 5, repeat: -1 });
    }
  }
  if (textures.exists('llave-consumo-aviso')) {
    crear(anims, { key: 'llave-consumo-aviso', frames: anims.generateFrameNumbers('llave-consumo-aviso', { start: 0, end: 2 }), frameRate: 6, repeat: -1 });
  }
  for (const [nombre, cuadros] of Object.entries(EFECTOS)) {
    const clave = `efecto-${nombre}`;
    if (!textures.exists(clave)) continue;
    crear(anims, { key: clave, frames: anims.generateFrameNumbers(clave, { start: 0, end: cuadros - 1 }), frameRate: nombre === 'desborde' ? 18 : 15, repeat: nombre === 'desborde' ? 0 : -1 });
  }
}

/** Lista para la Galería: [clave de animación, nombre legible]. */
export function listaAnimaciones(escena) {
  const lista = [];
  for (const equipo of EQUIPOS) for (const hoja of Object.keys(HOJAS_EQUIPO)) lista.push([claveEquipo(equipo, hoja), `${equipo.replace('_', ' ')} · ${hoja}`]);
  for (const deco of Object.keys(DECORACIONES)) lista.push([`deco-${deco}`, `decoración · ${deco}`]);
  lista.push(['llave-consumo-aviso', 'llave de consumo · aviso']);
  for (const nombre of Object.keys(EFECTOS)) lista.push([`efecto-${nombre}`, `efecto · ${nombre}`]);
  return lista.filter(([clave]) => escena.anims.exists(clave));
}
