// Orden de los niveles para los botones "Repetir nivel" y "Siguiente nivel" de la pantalla final.
// Sin dependencias de Phaser ni del DOM (lo prueba test/progresion.test.js).

/**
 * Nivel que sigue a `id` en la lista de ids de niveles.json, o null si `id` es el último
 * (o no está en la lista).
 */
export function siguienteNivel(id, ids) {
  const lista = [...new Set(ids.map(Number))].sort((a, b) => a - b);
  const i = lista.indexOf(Number(id));
  return i >= 0 && i < lista.length - 1 ? lista[i + 1] : null;
}
