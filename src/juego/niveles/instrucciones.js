// Textos de la pantalla de inicio de cada nivel y de la franja de perturbación.
// Solo leen la definición del nivel (niveles.json) y la configuración de controles.

const NOMBRE_TECLA = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Enter: 'Enter', Space: 'Espacio' };
export const nombreTecla = (codigo = '') => NOMBRE_TECLA[codigo] || codigo.replace(/^Key/, '').replace(/^Digit/, '');

const metros = (v) => `${v.toFixed(2).replace('.', ',')} m`;

/** Banda de tolerancia del nivel como [mínimo, máximo] en metros. */
export function banda(nivel, referencia = nivel.referencia) {
  const t = nivel.tolerancia;
  const d = t.tipo === 'relativa' ? referencia * t.fraccion : t.valor;
  return [referencia - d, referencia + d];
}

function textoCriterio(nivel) {
  const c = nivel.criterio;
  return c.tipo === 'consecutivo'
    ? `${c.segundos} segundos seguidos dentro de la banda`
    : `el ${c.porcentaje} % del tiempo dentro de la banda`;
}

function textoControles(nivel, fuente, teclas) {
  const dos = nivel.tanques === 2;
  if (fuente === 'camara') {
    return dos
      ? ['Mano derecha arriba / abajo → abre / cierra la entrada v₁', 'Pellizco de la mano izquierda → abre la salida v₂']
      : ['Mano derecha arriba / abajo → abre / cierra la entrada v₁'];
  }
  if (fuente === 'gamepad') {
    return dos ? ['Stick derecho arriba / abajo → entrada v₁', 'Gatillo derecho (RT) abre / izquierdo (LT) cierra la salida v₂'] : ['Stick derecho arriba / abajo → entrada v₁'];
  }
  const v1 = `Teclas ${nombreTecla(teclas.subirV1)} / ${nombreTecla(teclas.bajarV1)} → abren / cierran la entrada v₁`;
  return dos ? [v1, `Teclas ${nombreTecla(teclas.abrirV2)} / ${nombreTecla(teclas.cerrarV2)} → abren / cierran la salida v₂`] : [v1];
}

function textoPerturbacion(nivel) {
  const p = nivel.perturbacion;
  if (!p) return 'Sin perturbación: aprende cómo responde el alambique. La válvula tarda unos 4 s en abrirse del todo y el nivel tarda aún más en llegar.';
  if (p.tipo === 'escalon') {
    return `A los ${p.desde} s se abre la llave de consumo del costado y saca ${p.valor.toFixed(2).replace('.', ',')} m³/s del alambique hasta los ${p.hasta} s. La llave brilla en ámbar 2 s antes: sube la entrada para compensar.`;
  }
  return `La tubería delgada entre el alambique 2 y el caldero va y viene como una ola (hasta ${p.amplitud.toFixed(2).replace('.', ',')} m³/s, ciclo de ${p.periodo} s): ${p.periodo / 2} s le saca poción al alambique 2 y ${p.periodo / 2} s se la devuelve. Las flechas muestran hacia dónde va.`;
}

/** Contenido de la pantalla de inicio del nivel. */
export function instruccionesNivel(nivel, { fuente = 'teclado', teclas = {} } = {}) {
  const [min, max] = banda(nivel);
  const controlado = nivel.tanques === 2 ? 'el alambique 2 (abajo)' : 'el alambique';
  let objetivo = `Lleva ${controlado} a ${metros(nivel.referencia)} (entre ${metros(min)} y ${metros(max)}) y mantenlo: ${textoCriterio(nivel)}.`;
  if (nivel.cambioReferencia) objetivo += ` A los ${nivel.cambioReferencia.tiempo} s la meta cambia a ${metros(nivel.cambioReferencia.valor)}.`;
  const planta = nivel.tanques === 2
    ? 'La poción entra arriba por v₁, baja sola del alambique 1 al 2 por el tubo de vidrio y sale al caldero por v₂.'
    : 'La poción entra por arriba (v₁) y sale sola por abajo hacia el caldero: sale más rápido cuanto más lleno está.';
  const avisos = [];
  if (nivel.falloAlarmaHH) avisos.push('Si llegas a 2,8 m (alarma HH) pierdes.');
  avisos.push('A 3,0 m el alambique se desborda.');
  return {
    titulo: nivel.nombre,
    objetivo,
    planta,
    perturbacion: textoPerturbacion(nivel),
    controles: textoControles(nivel, fuente, teclas),
    avisos: avisos.join(' '),
  };
}

/**
 * Texto de la franja de perturbación según el instante. Devuelve null en niveles sin
 * perturbación. sentido: 1 sale del alambique, -1 entra, 0 sin flujo.
 */
export function estadoPerturbacion(nivel, tiempo, qd, fase) {
  const p = nivel.perturbacion;
  if (!p) return null;
  const caudal = `${Math.abs(qd).toFixed(3).replace('.', ',')} m³/s`;
  if (p.tipo === 'escalon') {
    if (fase === 'aviso') return { texto: `¡Atención! La llave de consumo se abre en ${Math.max(0, p.desde - tiempo).toFixed(1)} s`, tono: 'aviso', sentido: 0 };
    if (tiempo < p.desde) return { texto: `Llave de consumo cerrada · se abre a los ${p.desde} s (faltan ${Math.ceil(p.desde - tiempo)} s)`, tono: 'calma', sentido: 0 };
    if (tiempo < p.hasta) return { texto: `Llave de consumo ABIERTA: saca ${caudal} del alambique · se cierra a los ${p.hasta} s`, tono: 'activa', sentido: 1 };
    return { texto: 'Llave de consumo cerrada otra vez: el nivel tiende a subir', tono: 'calma', sentido: 0 };
  }
  if (Math.abs(qd) < 0.002) return { texto: 'Intercambio cambiando de sentido…', tono: fase === 'aviso' ? 'aviso' : 'calma', sentido: 0 };
  return qd > 0
    ? { texto: `Intercambio: SALE ${caudal} del alambique 2 hacia el caldero (el nivel baja)`, tono: 'activa', sentido: 1 }
    : { texto: `Intercambio: ENTRA ${caudal} del caldero al alambique 2 (el nivel sube)`, tono: 'entra', sentido: -1 };
}
