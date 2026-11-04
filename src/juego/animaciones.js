const velocidadAnimacion = (recurso) => {
  if (recurso.key.includes('alarma')) return 2;
  if (recurso.key.includes('falla')) return 8;
  if (recurso.key.includes('funcionando')) return 8;
  if (recurso.key.startsWith('efecto-')) return 18;
  if (recurso.key.startsWith('cucharon-') || recurso.key.startsWith('sifon-')) return 8;
  return 6;
};

/** Registra las animaciones de hojas disponibles una sola vez por juego. */
export function registrarAnimaciones(scene) {
  const recursos = scene.cache.json.get('assets-manifest')?.resources || [];
  for (const recurso of recursos) {
    if (recurso.type !== 'spritesheet' || !recurso.available || !scene.textures.exists(recurso.key)) continue;
    if (['valvula-tira', 'alarma-runa-estados', 'baldosas', 'interfaz', 'laboratorio-tiles'].includes(recurso.key)) continue; // Son piezas, iconos o mosaicos, no secuencias.
    const nombre = recurso.key;
    if (scene.anims.exists(nombre)) continue;
    const fin = Math.max(0, (recurso.frameCount || 1) - 1);
    scene.anims.create({
      key: nombre,
      frames: scene.anims.generateFrameNumbers(recurso.key, { start: 0, end: fin }),
      frameRate: velocidadAnimacion(recurso),
      repeat: -1,
    });
  }

  // La hoja contiene estados de alarma independientes, no una animación cíclica.
  if (scene.textures.exists('alarma-runa-estados')) {
    for (const [sufijo, frame] of [['normal', 0], ['h', 1], ['hh', 2]]) {
      const key = `alarma-runa-${sufijo}`;
      if (!scene.anims.exists(key)) scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers('alarma-runa-estados', { start: frame, end: frame }),
        frameRate: 1,
        repeat: -1,
      });
    }
  }

}

export function animacionEquipo(familia, estado) {
  return `${familia}-${estado === 'apagado' ? 'reposo' : estado === 'arranque' ? 'funcionando' : estado}`;
}

